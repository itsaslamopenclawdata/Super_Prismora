# PhotoIdentifier Backend Services

FastAPI-based microservices for the PhotoIdentifier platform.

## Services

- **Image Service**: Image upload and processing
- **Notification Service**: Email, SMS, and push notifications
- **Search Service**: Elasticsearch-powered search
- **Analytics Service**: Event tracking and analytics
- **Marketplace Service**: In-app marketplace
- **Booking Service**: Telehealth appointment booking

## Development

### Setup

```bash
# Install dependencies
poetry install

# Set environment variables
cp .env.example .env

# Run all services
poetry run uvicorn app.main:app --reload --port 8000
```

### Individual Services

Each service can be run independently:

```bash
# Image Service
poetry run uvicorn services.image.app:app --reload --port 8001

# Notification Service
poetry run uvicorn services.notification.app:app --reload --port 8002

# Search Service
poetry run uvicorn services.search.app:app --reload --port 8003

# Analytics Service
poetry run uvicorn services.analytics.app:app --reload --port 8004

# Marketplace Service
poetry run uvicorn services.marketplace.app:app --reload --port 8005

# Booking Service
poetry run uvicorn services.booking.app:app --reload --port 8006
```

## API Documentation

### Interactive Documentation

Each service provides interactive API documentation when running:

| Service | Swagger UI | ReDoc |
|---------|-----------|-------|
| Image | http://localhost:8001/docs | http://localhost:8001/redoc |
| Notification | http://localhost:8002/docs | http://localhost:8002/redoc |
| Search | http://localhost:8003/docs | http://localhost:8003/redoc |
| Analytics | http://localhost:8004/docs | http://localhost:8004/redoc |
| Marketplace | http://localhost:8005/docs | http://localhost:8005/redoc |
| Booking | http://localhost:8006/docs | http://localhost:8006/redoc |

### Complete API Documentation

For comprehensive API documentation including all endpoints, request/response schemas, and examples, see:

- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete REST API documentation
- **[openapi.yaml](./openapi.yaml)** - OpenAPI 3.0 specification
- **Kong API Gateway** - See [kong/README.md](./kong/README.md) for gateway configuration

### Key Features

- **OpenAPI/Swagger** - Auto-generated documentation for all services
- **Type-safe** - Pydantic models for request/response validation
- **Async support** - FastAPI's async/await capabilities
- **Middleware** - CORS, rate limiting, error handling, request logging
- **Health checks** - `/health` endpoint on all services
- **Docker support** - Containerized deployment with Dockerfile
