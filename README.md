# The Sorted Club

The business collective for what's next. We build, grow, automate, and hire for ambitious businesses under one roof.

---

## Features

- **Brand Landing Page**: High-impact, responsive landing page preserving The Sorted Club's signature design aesthetic (`DM Sans` + `Space Grotesk`, stark minimalist dark/acid accents).
- **Interactive Lead Capture Modal**: Connected to all "Get Sorted", "Tell us what needs sorting", and service exploration CTAs with client-side validation, category pre-selection, and rich confirmation screen.
- **FastAPI Backend**: Clean, typed REST API using Python, FastAPI, and Pydantic validation.
- **SQLAlchemy & SQLite Persistence**: Fully managed local database storing structured leads with status tracking and timestamps.
- **Protected Admin Dashboard (`/admin`)**: Real-time pipeline metrics (Total, New, Contacted, Qualified, Won, Proposal, Lost), instant search, multi-axis filtering, status updates, and direct outreach shortcuts.
- **Environment-based Admin Authentication**: Secure HMAC-signed session tokens with credentials configurable via environment variables.

---

## Tech Stack

- **Frontend**: React 18, Vite, Lucide Icons, Custom CSS Design System
- **Backend**: Python 3.10+, FastAPI, Uvicorn, Pydantic v2
- **Database**: SQLite, SQLAlchemy 2.0 ORM

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (with `npm`)
- **Python**: v3.10+ (with `pip`)

---

### 2. Backend Setup & Run

1. Install Python dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

2. Configure environment variables (or use defaults from `backend/.env.example`):
   ```bash
   cp backend/.env.example backend/.env
   ```

   **Default `.env` configuration:**
   ```env
   DATABASE_URL=sqlite:///./sorted_club.db
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=sorted_admin_2026
   ADMIN_SECRET_KEY=sorted_club_super_secret_jwt_key_2026
   HOST=127.0.0.1
   PORT=8000
   CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://localhost:5174,http://127.0.0.1:5174
   ```

3. Start the FastAPI backend:
   ```bash
   cd backend
   py -m uvicorn main:app --reload
   ```
   *(or specify a custom port if port 8000 is in use: `py -m uvicorn main:app --port 8002 --reload`)*

   - **Interactive API Docs (/docs)**: `http://127.0.0.1:8000/docs`
   - **Health Check**: `http://127.0.0.1:8000/api/health`

---

### 3. Frontend Setup & Run

1. In the project root, install Node dependencies:
   ```bash
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   - Open your browser at: `http://localhost:5173` (or the port assigned by Vite, e.g. `http://localhost:5174`).

---

### 4. Database Initialization

The SQLite database file (`sorted_club.db`) is automatically initialized and updated with all tables on backend startup. No manual migration steps are needed for local development.

---

### 5. Accessing the Admin Dashboard

1. Open your browser and navigate to:
   ```
   http://localhost:5173/admin
   ```
   *(or click the "Admin Portal" link in the footer)*

2. Sign in with the configured admin credentials:
   - **Username**: `admin`
   - **Password**: `sorted_admin_2026` *(configurable in `backend/.env`)*

3. From the dashboard you can:
   - View pipeline metrics (`TOTAL`, `NEW`, `CONTACTED`, `QUALIFIED`, `WON`, `PROPOSAL`, `LOST`).
   - Live-search inquiries across contact names, businesses, emails, phones, and problem briefs.
   - Filter inquiries by status and service interest.
   - Click any lead to open the slide-in drawer for full brief review, one-click outreach (email/phone/website), and status updates.
   - Permanently delete archived or test leads.

---

## API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/leads` | Public | Submit a new lead / inquiry brief with validation. |
| `GET` | `/api/leads` | Protected | List leads with optional `status`, `service_interest`, and `search` query filters. |
| `GET` | `/api/leads/stats` | Protected | Aggregated count metrics across pipeline statuses. |
| `GET` | `/api/leads/{id}` | Protected | Fetch complete details for a single lead. |
| `PATCH` | `/api/leads/{id}` | Protected | Update lead fields or transition status (`NEW`, `CONTACTED`, `QUALIFIED`, `PROPOSAL`, `WON`, `LOST`). |
| `DELETE` | `/api/leads/{id}` | Protected | Permanently remove a lead record. |
| `POST` | `/api/admin/login` | Public | Authenticate admin credentials and receive signed Bearer token. |
| `GET` | `/api/admin/verify` | Protected | Verify active session token validity. |
| `GET` | `/api/health` | Public | Server health status check. |

---

## Project Structure

```
the-sorted-club/
├── backend/
│   ├── __init__.py           # Backend package initializer
│   ├── .env.example          # Template for backend environment variables
│   ├── .env                  # Local environment file (gitignored)
│   ├── requirements.txt      # Python dependencies (FastAPI, SQLAlchemy, Uvicorn, etc.)
│   ├── database.py           # SQLAlchemy database session & engine configuration
│   ├── models.py             # SQLAlchemy Lead model & LeadStatus enum
│   ├── schemas.py            # Pydantic schemas for request validation and serialization
│   ├── auth.py               # HMAC-SHA256 admin authentication & token dependency
│   ├── routes/
│   │   ├── __init__.py       # Routes package initializer
│   │   ├── leads.py          # Lead capture, filtering, stats, and CRUD routes
│   │   └── auth.py           # Admin login & session verification routes
│   └── main.py               # FastAPI entrypoint, CORS configuration & router registration
├── app/
│   ├── main.jsx              # React app entrypoint, client routing (/ and /admin), and CTAs
│   ├── styles.css            # Unified styles for landing page, modal, and admin OS
│   ├── components/
│   │   ├── InquiryModal.jsx  # Rich multi-field inquiry modal matching Sorted Club design
│   │   ├── AdminDashboard.jsx# Pipeline overview, metric cards, table, and lead drawer
│   │   ├── AdminLogin.jsx    # Secure login card for admin portal
│   │   └── StatusBadge.jsx   # Color-coded badges for pipeline statuses
│   └── api/
│       └── client.js         # Frontend HTTP client with automatic auth injection
├── .gitignore                # Git exclusions (.env, *.db, node_modules, venv, etc.)
├── package.json              # Frontend scripts and dependencies
├── vite.config.js            # Vite configuration with API backend proxy
└── README.md                 # Complete system documentation
```
