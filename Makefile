.PHONY: help dev build test lint seed clean install dev-admin

help:
	@echo "Available commands:"
	@echo "  make install      - Install all dependencies"
	@echo "  make dev          - Start development servers (frontend + backend)"
	@echo "  make dev-admin    - Start admin panel (runs on port 3001)"
	@echo "  make build        - Build production bundles"
	@echo "  make test         - Run all tests"
	@echo "  make lint         - Run linters"
	@echo "  make seed         - Seed database with sample data"
	@echo "  make clean        - Clean build artifacts"

install:
	cd backend && npm install
	cd frontend && npm install
	cd admin && npm install

dev:
	@echo "Starting backend and frontend..."
	@echo "Backend will run on http://localhost:5000"
	@echo "Frontend will run on http://localhost:3000"
	cd backend && npm run dev & cd frontend && npm run dev

dev-admin:
	@echo "Starting admin panel..."
	@echo "Admin panel will run on http://localhost:3001"
	cd admin && npm run dev

build:
	cd frontend && npm run build
	cd backend && npm run build

test:
	cd frontend && npm test
	cd backend && npm test

lint:
	cd frontend && npm run lint
	cd backend && npm run lint

seed:
	cd backend && npm run seed

clean:
	rm -rf frontend/.next frontend/out frontend/node_modules
	rm -rf backend/dist backend/node_modules

