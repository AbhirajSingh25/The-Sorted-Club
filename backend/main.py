import os
import logging
from pathlib import Path
from dotenv import load_dotenv
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy import text

# Load .env file from backend directory (override only in non-test modes)
env_path = Path(__file__).resolve().parent / ".env"
is_test = os.environ.get("APP_ENV") == "test"
load_dotenv(dotenv_path=env_path, override=not is_test)

from database import engine, Base, upgrade_schema, DATABASE_URL, create_db_engine
from auth import validate_production_auth_config
from routes import leads, auth, clients, proposals, contracts, invoices, finance, projects, notifications, admin

# Structured logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("the_sorted_club")


def validate_production_environment():
    """
    Validates all mandatory environment settings before booting in production mode.
    Refuses startup if unsafe defaults or incompatible configurations are detected.
    """
    app_env = os.getenv("APP_ENV", "development").lower()
    if app_env == "production":
        logger.info("Validating production environment configuration...")
        
        # 1. Validate JWT / Admin security
        validate_production_auth_config()

        # 2. Validate Database URL (PostgreSQL required in production)
        db_url = os.getenv("DATABASE_URL", "")
        if not db_url or db_url.startswith("sqlite"):
            raise ValueError(
                "CRITICAL CONFIGURATION ERROR: Production environment requires PostgreSQL. "
                "SQLite is strictly restricted to development and test environments."
            )

        # 3. Validate CORS origins (no wildcard permitted in production)
        cors_env = os.getenv("CORS_ORIGINS", "")
        if not cors_env or "*" in cors_env:
            raise ValueError(
                "CRITICAL CONFIGURATION ERROR: Production CORS_ORIGINS must explicitly define allowed domain origins "
                "(e.g. 'https://thesortedclub.com'). Wildcard '*' is strictly prohibited in production."
            )

        logger.info("Production environment configuration validation PASSED.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Validate production environment and perform schema upgrades
    validate_production_environment()
    upgrade_schema(engine)
    logger.info("The Sorted Club API startup initialized successfully.")
    yield
    # Shutdown: Cleanly dispose DB engine pool connections
    logger.info("The Sorted Club API shutting down...")
    engine.dispose()


app = FastAPI(
    title="The Sorted Club API",
    description="Production API for The Sorted Club lead capture, sales CRM, client onboarding, and commercial workflow system.",
    version="1.0.0",
    lifespan=lifespan
)

# ------------------------------------------------------------------------------
# SECURITY HEADERS MIDDLEWARE
# ------------------------------------------------------------------------------
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# ------------------------------------------------------------------------------
# REQUEST BODY SIZE LIMIT MIDDLEWARE (Max 5MB)
# ------------------------------------------------------------------------------
MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5 MB

class RequestSizeLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                if int(content_length) > MAX_CONTENT_LENGTH:
                    return JSONResponse(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        content={"detail": "Payload too large. Maximum allowed size is 5MB."}
                    )
            except ValueError:
                pass
        return await call_next(request)

app.add_middleware(RequestSizeLimitMiddleware)

# ------------------------------------------------------------------------------
# CORS CONFIGURATION
# ------------------------------------------------------------------------------
cors_env = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://localhost:5174,http://127.0.0.1:5174")
origins = [origin.strip() for origin in cors_env.split(",") if origin.strip()]

if not origins:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if "*" not in origins else ["*"],
    allow_credentials=True if "*" not in origins else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------------------
# GLOBAL EXCEPTION HANDLERS
# ------------------------------------------------------------------------------
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Format Pydantic validation errors clearly for the client.
    """
    formatted_errors = []
    for err in exc.errors():
        field_loc = err.get("loc", [])
        field_name = field_loc[-1] if field_loc else "field"
        msg = err.get("msg", "Invalid value")
        if msg.startswith("Value error, "):
            msg = msg[len("Value error, "):]
        formatted_errors.append({
            "field": str(field_name),
            "message": msg
        })

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": formatted_errors,
            "message": formatted_errors[0]["message"] if formatted_errors else "Validation error occurred."
        }
    )

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """
    Standardize HTTP exceptions.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=getattr(exc, "headers", None)
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """
    Catch-all exception handler to prevent leaking internal stack traces, DB queries, or secrets.
    """
    logger.error(f"Unhandled server error on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected server error occurred. Please try again shortly."}
    )

# ------------------------------------------------------------------------------
# ROUTER REGISTRATION
# ------------------------------------------------------------------------------
app.include_router(leads.router)
app.include_router(auth.router)
app.include_router(clients.router)
app.include_router(proposals.router)
app.include_router(contracts.router)
app.include_router(invoices.router)
app.include_router(finance.router)
app.include_router(projects.router)
app.include_router(notifications.router)
app.include_router(admin.router)

# ------------------------------------------------------------------------------
# HEALTH & READINESS PROBES
# ------------------------------------------------------------------------------
@app.get("/")
def root():
    return {
        "app": "The Sorted Club API",
        "status": "online",
        "version": "1.0.0"
    }

@app.get("/health")
@app.get("/api/health")
def health_check():
    """Liveness probe: confirms FastAPI process is active."""
    return {"status": "healthy"}

@app.get("/ready")
@app.get("/api/ready")
def readiness_check():
    """Readiness probe: confirms FastAPI process AND database connection are active."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {
            "status": "ready",
            "database": "connected"
        }
    except Exception as e:
        logger.error(f"Readiness probe database check failed: {e}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "database": "disconnected"
            }
        )
