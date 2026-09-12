#!/usr/bin/env bash
# Idempotent repository bootstrap for the Porthos Cloud Agent environment.
# Runs after the repository is checked out. Must terminate and be safe to re-run.
set -euo pipefail

cd "$(dirname "$0")/.."

# 1. System dependency: PostgreSQL (stable local dev database).
if ! command -v pg_ctlcluster >/dev/null 2>&1; then
  echo "Installing PostgreSQL..."
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq postgresql postgresql-contrib
else
  echo "PostgreSQL already installed."
fi

# 2. Local dev env file (git-ignored). Points NextAuth + Prisma at the local DB.
if [ ! -f .env.local ]; then
  echo "Writing .env.local..."
  cat > .env.local <<'ENV'
DATABASE_URL="postgresql://porthos:porthos@localhost:5432/porthos_db?schema=public"
NEXTAUTH_SECRET="porthos-dev-insecure-secret"
NEXTAUTH_URL="http://localhost:3000"
ENV
else
  echo ".env.local already present, leaving as-is."
fi

# 3. Node dependencies (pnpm is pinned via packageManager). postinstall runs `prisma generate`.
corepack enable
pnpm install --frozen-lockfile

echo "Install complete."
