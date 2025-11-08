#!/bin/sh
set -e

echo "🚀 Starting JACS ShiftPilot Backend..."

# Run database migrations
echo "📊 Running database migrations..."
npx prisma migrate deploy

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
  node prisma/seed-clean.js
else
  echo "✅ Database already contains data, skipping seed"
fi

echo "✨ Starting application server..."
exec npm start
