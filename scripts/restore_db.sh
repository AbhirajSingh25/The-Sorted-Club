#!/usr/bin/env bash
# ==============================================================================
# The Sorted Club — PostgreSQL Database Restore Script
# Usage: ./scripts/restore_db.sh <path_to_backup_file.sql.gz>
# ==============================================================================
set -eo pipefail

if [ -z "$1" ]; then
  echo "Usage: $0 <path_to_backup_file.sql.gz>" >&2
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file '$BACKUP_FILE' does not exist." >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "===================================================================="
echo "WARNING: Restoring will overwrite existing data in the database!"
echo "Target File: $BACKUP_FILE"
echo "===================================================================="
read -p "Type 'RESTORE' to proceed: " CONFIRM

if [ "$CONFIRM" != "RESTORE" ]; then
  echo "Restore aborted by user."
  exit 0
fi

echo "=== [$(date)] Restoring Database ==="

gunzip -c "$BACKUP_FILE" | docker compose exec -T postgres psql -U "${POSTGRES_USER:-sorted_user}" -d "${POSTGRES_DB:-sorted_club}"

echo "✓ Database successfully restored from $BACKUP_FILE"
echo "=== [$(date)] Restore Completed ==="
