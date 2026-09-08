#!/usr/bin/env bash
# ==============================================================================
# The Sorted Club — Post-Deployment VPS Verification & Diagnostics
# Usage: ./scripts/verify_vps.sh [domain]
# ==============================================================================
set -eo pipefail

DOMAIN="${1:-thesortedclub.com}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "=================================================================="
echo " The Sorted Club — Post-Deployment Verification ($DOMAIN)"
echo "=================================================================="

# 1. Container Status Check
echo ""
echo "[1/6] Checking Docker Container Statuses..."
docker compose ps

# 2. Check Postgres Health
echo ""
echo "[2/6] Checking PostgreSQL Database Engine..."
docker compose exec postgres pg_isready -U "${POSTGRES_USER:-sorted_user}" -d "${POSTGRES_DB:-sorted_club}"

# 3. Check Backend Readiness Probe
echo ""
echo "[3/6] Checking Backend Readiness (/ready)..."
docker compose exec backend curl -s http://localhost:8000/ready | grep -q '"status":"ready"' && echo "✓ Backend & DB connection: READY" || echo "✗ Backend readiness failed"

# 4. Check Frontend Webserver
echo ""
echo "[4/6] Checking Frontend SPA Server..."
docker compose exec frontend wget -q -O - http://localhost/ | grep -q "<div id=\"root\">" && echo "✓ Frontend index.html served cleanly" || echo "✗ Frontend probe failed"

# 5. Check Nginx Health Proxy on Port 80
echo ""
echo "[5/6] Checking Nginx Local Health Endpoint..."
docker compose exec nginx wget -q -O - http://localhost/health | grep -q '"status":"healthy"' && echo "✓ Nginx /health proxy operational" || echo "✗ Nginx /health failed"

# 6. Check Public HTTPS (if DNS and TLS are live)
echo ""
echo "[6/6] Checking Public Endpoints (via curl)..."
if curl -s -k "https://${DOMAIN}/health" 2>/dev/null | grep -q "healthy"; then
  echo "✓ Public HTTPS /health reachable"
else
  echo "ℹ Public HTTPS /health not yet reachable (normal if DNS / SSL certificate is pending)"
fi

echo ""
echo "=================================================================="
echo " Verification Scan Finished."
echo "=================================================================="
