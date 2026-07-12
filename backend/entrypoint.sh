#!/bin/sh
set -e

echo "═══════════════════════════════════════════"
echo "  FleetFlow API — Container Startup"
echo "═══════════════════════════════════════════"

echo "▶ Running Prisma migrations..."
npx prisma migrate deploy

if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "▶ Running database seed..."
  node prisma/seed.js
else
  echo "▶ Skipping seed (RUN_SEED not set)"
fi

echo "▶ Starting FleetFlow API server..."
exec node src/index.js
