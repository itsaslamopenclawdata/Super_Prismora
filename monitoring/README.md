# Monitoring & Observability Infrastructure

This directory contains the monitoring and observability setup for the PhotoIdentifier platform.

## Components

### 1. OpenTelemetry APM
- Distributed tracing for frontend (Next.js) and backend (Python)
- Automatic instrumentation for key frameworks
- Export to Jaeger/OTLP backend

### 2. Prometheus Metrics
- Application metrics collection
- Service-level metrics with proper labeling
- Integration with container orchestration

### 3. Grafana Dashboards
- Pre-built dashboards for platform monitoring
- Real-time metrics visualization
- Alert configurations

### 4. Centralized Logging
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Structured logging with correlation IDs
- Log aggregation and search capabilities

## Setup

### Prerequisites
- Docker and Docker Compose installed
- Network connectivity between services

### Installation
```bash
# Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Verify services are running
docker ps
```

## Access Points

- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Jaeger UI**: http://localhost:16686
- **Kibana**: http://localhost:5601

## Configuration

See individual component directories for detailed configuration options.
