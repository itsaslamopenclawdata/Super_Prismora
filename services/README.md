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

Once running, access interactive API docs at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
