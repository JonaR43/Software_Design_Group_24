#!/bin/bash

# ShiftPilot Production Deployment Script
# This script helps you deploy ShiftPilot using Docker

set -e  # Exit on error

echo "🚀 ShiftPilot Deployment Script"
echo "================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed!"
    echo "Please install Docker Compose first: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "⚠️  .env.production file not found!"
    echo ""
    echo "Creating .env.production from template..."
    cp .env.production.example .env.production
    echo ""
    echo "📝 Please edit .env.production and add your configuration:"
    echo "   - Database password"
    echo "   - JWT secret (generate with: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\")"
    echo "   - Google Maps API key"
    echo "   - Your domain URLs"
    echo ""
    echo "After editing .env.production, run this script again."
    exit 0
fi

echo "✅ Found .env.production"
echo ""

# Load environment variables
export $(cat .env.production | grep -v '^#' | xargs)

# Check if critical variables are set
if [ "$JWT_SECRET" = "GENERATE_A_64_CHARACTER_RANDOM_STRING_HERE" ]; then
    echo "❌ JWT_SECRET not configured in .env.production!"
    echo "Generate one with: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
    exit 1
fi

if [ "$POSTGRES_PASSWORD" = "GENERATE_A_SECURE_PASSWORD_HERE" ]; then
    echo "❌ POSTGRES_PASSWORD not configured in .env.production!"
    echo "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    exit 1
fi

echo "✅ Environment variables configured"
echo ""

# Ask user what to do
echo "What would you like to do?"
echo "1) 🆕 Initial deployment (first time)"
echo "2) 🔄 Update deployment (pull latest changes and rebuild)"
echo "3) 🔍 View logs"
echo "4) 🛑 Stop services"
echo "5) 📊 Check status"
echo "6) 🗑️  Remove everything (including data!)"
echo ""
read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        echo ""
        echo "🆕 Starting initial deployment..."
        echo ""

        # Pull latest images
        echo "📥 Pulling base images..."
        docker-compose -f docker-compose.prod.yml pull postgres

        # Build and start services
        echo "🔨 Building and starting services..."
        docker-compose -f docker-compose.prod.yml up -d --build

        echo ""
        echo "⏳ Waiting for services to be healthy..."
        sleep 10

        # Check status
        docker-compose -f docker-compose.prod.yml ps

        echo ""
        echo "✅ Deployment complete!"
        echo ""
        echo "Your application is running at:"
        echo "  Frontend: http://localhost:${FRONTEND_PORT:-3000}"
        echo "  Backend:  http://localhost:${BACKEND_PORT:-3001}"
        echo "  Database: localhost:${POSTGRES_PORT:-5432}"
        echo ""
        echo "View logs with: docker-compose -f docker-compose.prod.yml logs -f"
        ;;

    2)
        echo ""
        echo "🔄 Updating deployment..."
        echo ""

        # Pull latest code
        if [ -d .git ]; then
            echo "📥 Pulling latest code from git..."
            git pull
        fi

        # Rebuild and restart
        echo "🔨 Rebuilding services..."
        docker-compose -f docker-compose.prod.yml up -d --build

        echo ""
        echo "✅ Update complete!"
        echo ""
        echo "View logs with: docker-compose -f docker-compose.prod.yml logs -f"
        ;;

    3)
        echo ""
        echo "📋 Viewing logs (Ctrl+C to exit)..."
        echo ""
        docker-compose -f docker-compose.prod.yml logs -f
        ;;

    4)
        echo ""
        echo "🛑 Stopping services..."
        docker-compose -f docker-compose.prod.yml down
        echo ""
        echo "✅ Services stopped"
        ;;

    5)
        echo ""
        echo "📊 Service Status:"
        echo ""
        docker-compose -f docker-compose.prod.yml ps
        echo ""
        echo "📊 Resource Usage:"
        echo ""
        docker stats --no-stream $(docker-compose -f docker-compose.prod.yml ps -q)
        ;;

    6)
        echo ""
        echo "⚠️  WARNING: This will remove all containers, networks, and DATA!"
        read -p "Are you sure? Type 'yes' to confirm: " confirm
        if [ "$confirm" = "yes" ]; then
            echo ""
            echo "🗑️  Removing everything..."
            docker-compose -f docker-compose.prod.yml down -v
            echo ""
            echo "✅ Everything removed"
        else
            echo "Cancelled"
        fi
        ;;

    *)
        echo "Invalid choice"
        exit 1
        ;;
esac
