.PHONY: help setup download-models build run test clean monitor deploy

PROJECT_NAME = vehicle-ai
PYTHON = python3
DOCKER_COMPOSE = docker-compose -f docker/docker-compose.yml
KUBECTL = kubectl

help:
	@echo "Available commands:"
	@echo "  setup              - Set up the development environment"
	@echo "  download-models    - Download all required model weights"
	@echo "  build             - Build Docker images"
	@echo "  run               - Run the system with Docker Compose"
	@echo "  test              - Run tests"
	@echo "  clean             - Clean up containers and volumes"
	@echo "  monitor           - Open monitoring dashboards"
	@echo "  deploy            - Deploy to Kubernetes"

setup:
	@echo "Setting up development environment..."
	$(PYTHON) -m venv venv
	./venv/bin/pip install --upgrade pip
	./venv/bin/pip install -r requirements.txt
	cp .env.example .env
	@echo "Setup complete! Edit .env file with your configuration."

download-models:
	@echo "Downloading model weights..."
	chmod +x scripts/setup/download_models.sh
	./scripts/setup/download_models.sh

build:
	@echo "Building Docker images..."
	docker build -t vehicle-ai/base:latest -f docker/base/Dockerfile.base .
	$(DOCKER_COMPOSE) build

run:
	@echo "Starting services..."
	$(DOCKER_COMPOSE) up -d
	@echo "Services started! API available at http://localhost:8080"

test:
	@echo "Running tests..."
	$(PYTHON) -m pytest tests/ -v --cov=src --cov-report=html

clean:
	@echo "Cleaning up..."
	$(DOCKER_COMPOSE) down -v
	rm -rf logs/*.log

monitor:
	@echo "Opening monitoring dashboards..."
	open http://localhost:3000

deploy:
	@echo "Deploying to Kubernetes..."
	$(KUBECTL) apply -f kubernetes/

logs:
	$(DOCKER_COMPOSE) logs -f

stop:
	$(DOCKER_COMPOSE) stop

status:
	$(DOCKER_COMPOSE) ps
