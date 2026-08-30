import os
import logging
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

# Load .env file from backend directory
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

from database import engine, Base, upgrade_schema
from routes import leads, auth, clients, proposals, contracts, invoices, finance

# Configure basic logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("the_sorted_club")

# Create database tables and perform non-destructive schema upgrades automatically
upgrade_schema(engine)

app = FastAPI(
    title="The Sorted Club API",
    description="Production API for The Sorted Club lead capture, sales CRM, client onboarding, and commercial workflow system.",
    version="1.0.0"
)

# Parse CORS origins
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

# Global Exception Handlers for safe, consistent JSON responses
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
    Catch-all exception handler to prevent leaking internal stack traces.
    """
    logger.error(f"Unhandled server error on {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected server error occurred. Please try again shortly."}
    )

# Register routers
app.include_router(leads.router)
app.include_router(auth.router)
app.include_router(clients.router)
app.include_router(proposals.router)
app.include_router(contracts.router)
app.include_router(invoices.router)
app.include_router(finance.router)

@app.get("/")
def root():
    return {
        "app": "The Sorted Club API",
        "status": "online",
        "version": "1.0.0"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
