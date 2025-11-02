# Makefile for JACS ShiftPilot Docker Management

.PHONY: help up down restart logs build clean dev prod test shell db-shell migrate seed backup

# Default target
help:
	@echo "JACS ShiftPilot - Docker Management Commands"
	@echo ""
	@echo "Development Commands:"
	@echo "  make dev          - Start all services in development mode with hot-reload"
	@echo "  make dev-logs     - View development logs"
	@echo "  make dev-down     - Stop development services"
	@echo ""
	@echo "Production Commands:"
	@echo "  make prod         - Start all services in production mode"
	@echo "  make prod-logs    - View production logs"
	@echo "  make prod-down    - Stop production services"
	@echo ""
	@echo "General Commands:"
	@echo "  make up           - Start services (default: production)"
	@echo "  make down         - Stop all services"
	@echo "  make restart      - Restart all services"
	@echo "  make logs         - View all logs"
	@echo "  make build        - Rebuild all services"
	@echo "  make clean        - Remove all containers, volumes, and images"
	@echo ""
	@echo "Database Commands:"
	@echo "  make migrate      - Run database migrations"
	@echo "  make seed         - Seed database with mock data"
	@echo "  make db-shell     - Access PostgreSQL shell"
	@echo "  make backup       - Backup database"
	@echo "  make db-reset     - Reset database (WARNING: deletes all data!)"
	@echo ""
	@echo "Testing & Debug:"
	@echo "  make test         - Run backend tests"
	@echo "  make shell        - Access backend container shell"
	@echo "  make frontend-shell - Access frontend container shell"
	@echo ""
	@echo "Utility:"
	@echo "  make ps           - Show running containers"
	@echo "  make env          - Create .env from .env.example"

# Development mode
dev:
	@echo "🚀 Starting services in DEVELOPMENT mode..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "✅ Services started!"
	@echo "Frontend: http://localhost:5173"
	@echo "Backend:  http://localhost:3001"
	@echo "Database: localhost:5432"

dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f

dev-down:
	docker-compose -f docker-compose.dev.yml down

dev-build:
	docker-compose -f docker-compose.dev.yml up -d --build

# Production mode
prod:
	@echo "🚀 Starting services in PRODUCTION mode..."
	docker-compose up -d
	@echo "✅ Services started!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend:  http://localhost:3001"
	@echo "Database: localhost:5432"

prod-logs:
	docker-compose logs -f

prod-down:
	docker-compose down

prod-build:
	docker-compose up -d --build

# General commands
up: prod

down:
	docker-compose down
	docker-compose -f docker-compose.dev.yml down

restart:
	docker-compose restart

logs:
	docker-compose logs -f

build:
	docker-compose build

clean:
	@echo "⚠️  WARNING: This will remove all containers, volumes, and images!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v --rmi all; \
		docker-compose -f docker-compose.dev.yml down -v --rmi all; \
		echo "✅ Cleaned up!"; \
	fi

# Database commands
migrate:
	@echo "Running database migrations..."
	docker exec -it shiftpilot-backend npx prisma migrate deploy
	@echo "✅ Migrations completed!"

seed:
	@echo "Seeding database..."
	docker exec -it shiftpilot-backend npm run seed
	@echo "✅ Database seeded!"

db-shell:
	@echo "Accessing PostgreSQL shell..."
	docker exec -it shiftpilot-db psql -U postgres -d shiftpilot

backup:
	@echo "Creating database backup..."
	@mkdir -p backups
	docker exec shiftpilot-db pg_dump -U postgres shiftpilot > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup created in backups/ directory"

db-reset:
	@echo "⚠️  WARNING: This will delete all database data!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker exec -it shiftpilot-backend npx prisma migrate reset; \
		echo "✅ Database reset!"; \
	fi

# Testing
test:
	@echo "Running backend tests..."
	docker exec -it shiftpilot-backend npm test

test-coverage:
	@echo "Running tests with coverage..."
	docker exec -it shiftpilot-backend npm test -- --coverage

# Shell access
shell:
	docker exec -it shiftpilot-backend sh

frontend-shell:
	docker exec -it shiftpilot-frontend sh

# Utility commands
ps:
	docker-compose ps

env:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "✅ Created .env file from .env.example"; \
		echo "⚠️  Please update .env with your configuration"; \
	else \
		echo "⚠️  .env file already exists"; \
	fi

# Health check
health:
	@echo "Checking service health..."
	@echo "Backend API:"
	@curl -s http://localhost:3001/api/health || echo "❌ Backend not responding"
	@echo "\nFrontend:"
	@curl -s http://localhost:5173 > /dev/null && echo "✅ Frontend responding" || echo "❌ Frontend not responding"
	@echo "\nDatabase:"
	@docker exec shiftpilot-db pg_isready -U postgres && echo "✅ Database responding" || echo "❌ Database not responding"

# Quick start
quickstart: env dev
	@echo ""
	@echo "🎉 Quick start complete!"
	@echo "The application is starting up. This may take a minute..."
	@sleep 10
	@make health
