# Kong API Gateway Configuration

Kong is the API Gateway for the PhotoIdentifier platform. It handles routing, authentication, rate limiting, and other cross-cutting concerns.

## Services

The following microservices are configured in Kong:

1. **Image Service** (Port 8001) - `/api/v1/images`
2. **Notification Service** (Port 8002) - `/api/v1/notifications`
3. **Search Service** (Port 8003) - `/api/v1/search`
4. **Analytics Service** (Port 8004) - `/api/v1/analytics`
5. **Marketplace Service** (Port 8005) - `/api/v1/marketplace`
6. **Booking Service** (Port 8006) - `/api/v1/bookings`

## Quick Start

### 1. Start Kong

```bash
cd services/kong
docker-compose up -d
```

### 2. Apply Configuration

```bash
./setup.sh
```

### 3. Verify Kong is Running

```bash
# Check Kong status
curl http://localhost:8001

# Check services
curl http://localhost:8001/services

# Check routes
curl http://localhost:8001/routes
```

## Access Points

- **Gateway Proxy**: http://localhost:8000
- **Admin API**: http://localhost:8001
- **Konga UI**: http://localhost:1337

## Plugins Configured

### 1. CORS
Enables cross-origin resource sharing for frontend applications.

### 2. Rate Limiting
Limits request rate to prevent abuse:
- 100 requests/minute
- 1,000 requests/hour
- 10,000 requests/day

### 3. Request Size Limiting
Limits payload size to 10MB.

### 4. JWT Authentication
Secure endpoints using JWT tokens.

### 5. IP Restriction
Block or allow specific IP addresses.

### 6. Response Rate Limiting
Rate limit based on response size.

### 7. File Logging
Log all requests to `/tmp/kong-requests.log`.

### 8. Prometheus
Expose metrics for monitoring.

## Testing Endpoints

Test services through the Kong gateway:

```bash
# Health check
curl http://localhost:8000/health

# Image service (via Kong)
curl http://localhost:8000/api/v1/images

# Search service (via Kong)
curl http://localhost:8000/api/v1/search
```

## Management

### Kong Admin API

```bash
# List all services
curl http://localhost:8001/services

# List all routes
curl http://localhost:8001/routes

# List all plugins
curl http://localhost:8001/plugins

# Update a service
curl -X PATCH http://localhost:8001/services/image-service \
  -d "url=http://image-service:8001"
```

### Konga UI

Access the Kong admin UI at http://localhost:1337 for a visual interface.

## Declarative Configuration

The `kong.yml` file contains the declarative configuration. To apply changes:

1. Edit `kong.yml`
2. Run `./setup.sh`

## Troubleshooting

### Kong won't start

```bash
# Check logs
docker-compose logs kong

# Restart Kong
docker-compose restart kong
```

### Configuration not applying

```bash
# Reset Kong database (CAUTION: This deletes all configuration)
docker-compose exec kong kong migrations reset --yes

# Re-apply configuration
./setup.sh
```

### Service unreachable

```bash
# Check service health
curl http://localhost:8001/services

# Check route configuration
curl http://localhost:8001/routes

# Verify backend service is running
curl http://localhost:8001/health
```

## Production Considerations

- Enable authentication for Konga UI (`NO_AUTH: "false"`)
- Use HTTPS for Admin API (Port 8444)
- Configure proper SSL certificates
- Set up Kong clustering for high availability
- Enable JWT authentication for all protected endpoints
- Configure proper rate limits for production traffic
- Set up monitoring and alerting

## Documentation

- [Kong Documentation](https://docs.konghq.com/)
- [Kong Admin API](https://docs.konghq.com/gateway/latest/admin-api/)
- [Declarative Configuration](https://docs.konghq.com/gateway/latest/db-less-and-deck/)
