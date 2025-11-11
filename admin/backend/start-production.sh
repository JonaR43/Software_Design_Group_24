#!/bin/sh
set -e

echo "🚀 Starting JACS ShiftPilot Backend..."

# Sync database schema (dev mode - auto applies schema changes)
echo "📊 Syncing database schema..."
npx prisma db push --skip-generate --accept-data-loss
we
# Check if database is empty and seed if needed
echo "🌱 Checking if database needs seeding..."
NODE_COUNT=$(node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.count()
  .then(count => { console.log(count); process.exit(0); })
  .catch(() => { console.log(0); process.exit(0); })
  .finally(() => prisma.\$disconnect());
")

if [ "$NODE_COUNT" = "0" ]; then
  echo "📦 Database is empty, running seed..."
  node prisma/seed-large.js
else
  echo "✅ Database already contains data, skipping seed"
fi

echo "✨ Starting application server..."
exec npm start
