#!/bin/bash

set -e

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="backups/$TIMESTAMP"
BACKUP_FILE="$BACKUP_DIR/card-investing.dump"

mkdir -p "$BACKUP_DIR"

echo ""
echo "Creating database backup..."
echo "---------------------------"

set -a
source .env.local
set +a

if [ -z "$DATABASE_URL" ]; then
	echo "Error: DATABASE_URL is not defined in .env.local"
	exit 1
fi

pg_dump "$DATABASE_URL" \
	--format=custom \
	--no-owner \
	--no-privileges \
	--file="$BACKUP_FILE"

echo ""
echo "✓ Database backup created:"
echo "$BACKUP_FILE"
echo ""