#!/usr/bin/env bash
# Per-boot runtime initialization for the Porthos Cloud Agent environment.
# Starts PostgreSQL, ensures the dev role/database exist, applies migrations and
# seeds data. Idempotent: safe to run on every boot.
set -euo pipefail

cd "$(dirname "$0")/.."

# 1. Start the PostgreSQL cluster (tolerate an already-running cluster).
sudo pg_ctlcluster 16 main start || true

# Wait for the server to accept connections.
for i in $(seq 1 30); do
  if sudo -u postgres pg_isready -q; then
    break
  fi
  sleep 1
done

# 2. Ensure the application role and database exist (idempotent).
sudo -u postgres psql -v ON_ERROR_STOP=1 <<'SQL'
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'porthos') THEN
    CREATE ROLE porthos LOGIN PASSWORD 'porthos';
  END IF;
END $$;
ALTER ROLE porthos CREATEDB;
SQL
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = 'porthos_db'" \
  | grep -q 1 || sudo -u postgres createdb -O porthos porthos_db

# 3. Apply schema migrations and seed data (both idempotent).
pnpm exec prisma migrate deploy
pnpm exec prisma db seed

echo "Start complete. Database ready at postgresql://porthos:porthos@localhost:5432/porthos_db"
