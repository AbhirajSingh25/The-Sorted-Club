#!/usr/bin/env bash
# ==============================================================================
# The Sorted Club — Automated PostgreSQL Database Backup Script
# Usage: ./scripts/backup_db.sh [backup_dir]
# ==============================================================================
set -eo pipefail

BACKUP_DIR="${1:-/var/backups/sorted_club}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/sorted_club_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=14

mkdir -p "$BACKUP_DIR"

echo "=== [$(date)] Starting Database Backup ==="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Ensure postgres container is running
if ! docker compose ps postgres | grep -q "Up"; then
  echo "Error: PostgreSQL container is not running!" >&2
  exit 1
fi

# Run pg_dump from container and compress
docker compose exec -T postgres pg_dump -U "${POSTGRES_USER:-sorted_user}" "${POSTGRES_DB:-sorted_club}" | gzip > "$BACKUP_FILE"

chmod 600 "$BACKUP_FILE"
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

echo "✓ Backup created successfully: $BACKUP_FILE (Size: $BACKUP_SIZE)"

# Rotate older backups
echo "Cleaning backups older than ${RETENTION_DAYS} days in ${BACKUP_DIR}..."
find "$BACKUP_DIR" -type f -name "sorted_club_*.sql.gz" -mtime +"$RETENTION_DAYS" -delete

echo "=== [$(date)] Backup Process Completed ==="
