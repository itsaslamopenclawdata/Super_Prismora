# Monitoring & Observability Setup Guide

This guide covers the complete monitoring and observability infrastructure for the PhotoIdentifier platform.

## Overview

The platform includes three main monitoring components:

1. **APM with OpenTelemetry** - Distributed tracing and application performance monitoring
2. **Prometheus & Grafana** - Metrics collection and visualization
3. **Centralized Logging (ELK Stack)** - Log aggregation and search

## Quick Start

### 1. Start the Monitoring Stack

```bash
# Start all monitoring services
docker-compose -f docker-compose.monitoring.yml up -d

# Check service status
docker-compose -f docker-compose.monitoring.yml ps
```

### 2. Access the UIs

- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Jaeger UI**: http://localhost:16686
- **Kibana**: http://localhost:5601

### 3. Configure Applications

#### Frontend (Next.js)

The frontend automatically includes:
- OpenTelemetry tracing (initialized via package.json scripts)
- Prometheus metrics (accessible at `/api/metrics`)
- Centralized logging (logs forwarded to `/api/logs`)

#### Backend (Python)

Add to your Python application:

```python
from backend.monitoring import tracer, meter, traced
from backend.monitoring.logger import get_logger

# Use tracing
@traced()
def process_photo(photo_id: str):
    logger = get_logger(__name__)
    logger.info(f"Processing photo {photo_id}")
    # Your code here
```

## Component Details

### 1. OpenTelemetry APM

**Purpose**: Distributed tracing and performance monitoring

**Features**:
- Automatic instrumentation for HTTP requests, database queries, and cache operations
- Manual tracing support for custom operations
- Export to Jaeger for visualization
- Correlation of traces across frontend and backend

**Configuration**:
- Frontend: `apps/web/monitoring/opentelemetry/frontend-otel.js`
- Backend: `backend/monitoring/opentelemetry.py`

**Usage**:

```javascript
// Frontend - OpenTelemetry is automatically initialized
// Use the exported tracer for manual instrumentation
import { tracer } from '@/monitoring/opentelemetry';
```

```python
# Backend - Import and use the tracer
from backend.monitoring.opentelemetry import tracer

with tracer.start_as_current_span("custom_operation"):
    # Your code here
```

### 2. Prometheus Metrics

**Purpose**: Time-series metrics collection and alerting

**Metrics Collected**:
- HTTP request rate and duration
- Error rates by service
- Database connection pool usage
- Cache hit/miss rates
- Photo processing statistics
- Container and host metrics

**Key Files**:
- Configuration: `monitoring/prometheus/prometheus.yml`
- Alert rules: `monitoring/prometheus/alerts/platform-alerts.yml`
- Frontend metrics: `apps/web/monitoring/prometheus/metrics.ts`
- Backend metrics: `backend/monitoring/prometheus_exporter.py`

**Dashboard**:
- Pre-configured dashboard in Grafana: "PhotoIdentifier Platform Overview"
- Custom dashboards can be created via Grafana UI

**Manual Metrics**:

```javascript
// Frontend
import { trackPageView, trackPhotoUpload } from '@/monitoring/prometheus/metrics';

trackPageView('/gallery');
trackPhotoUpload('success', '1-5mb', 2.3);
```

```python
# Backend
from backend.monitoring.prometheus_exporter import (
    http_requests_total,
    db_query_duration_seconds,
    photos_processed_total
)

# Increment counters
photos_processed_total.labels(status='success', model='resnet').inc()

# Observe duration
with db_query_duration_seconds.labels(query_type='SELECT', table='photos').time():
    # Your query here
```

### 3. Centralized Logging (ELK Stack)

**Purpose**: Log aggregation, search, and analysis

**Components**:
- **Elasticsearch**: Log storage and search
- **Logstash**: Log processing pipeline
- **Kibana**: Log visualization and analysis

**Log Format**:
- Structured JSON logging
- Automatic correlation with traces
- Context-aware logging (user ID, request ID, etc.)

**Configuration**:
- Logstash pipeline: `monitoring/logstash/pipeline/logstash.conf`
- Frontend logger: `apps/web/monitoring/logging/logger.ts`
- Backend logger: `backend/monitoring/logger.py`

**Usage**:

```javascript
// Frontend
import logger from '@/monitoring/logging/logger';

logger.info('User uploaded a photo', {
  userId: '123',
  photoSize: 2048576,
});
```

```python
# Backend
from backend.monitoring.logger import get_logger

logger = get_logger(__name__)
logger.info('Processing photo', {
  user_id: '123',
  photo_id: 'abc-123',
})
```

## Alerts

Prometheus is configured with alert rules for:

- High error rates (>5%)
- Service downtime
- High response times (>1s P95)
- Database connection pool exhaustion
- High Redis memory usage (>80%)
- Low disk space (<10%)

Alerts can be configured to send notifications via:
- Email
- Slack
- PagerDuty
- Custom webhooks

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PhotoIdentifier Platform                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   Frontend   │  │    Backend   │                        │
│  │   (Next.js)  │  │   (Python)   │                        │
│  └──────┬───────┘  └──────┬───────┘                        │
│         │                 │                                  │
│         │  OpenTelemetry  │                                  │
│         ├────────────────►│  Traces                         │
│         │                 │                                  │
│         │  Prometheus     │                                  │
│         │  Metrics        │                                  │
│         ├────────────────►│  Metrics                       │
│         │                 │                                  │
│         │  Logs           │                                  │
│         ├────────────────►│  Logs                          │
│         │                 │                                  │
└─────────┼─────────────────┼──────────────────────────────────┘
          │                 │
          ▼                 ▼
┌──────────────────────────────────────────────────────────────┐
│                   Monitoring Stack                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────┐  ┌────────────┐  ┌────────────────┐            │
│  │ Jaeger  │  │ Prometheus │  │   Logstash    │            │
│  │  Traces │  │   Metrics  │  │    Pipeline   │            │
│  └─────────┘  └─────┬──────┘  └────────┬───────┘            │
│                     │                   │                     │
│                     │                   │                     │
│               ┌─────▼───────────────────▼──────┐              │
│               │        Grafana & Kibana        │              │
│               │    (Visualization & Search)   │              │
│               └───────────────────────────────┘              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Troubleshooting

### Grafana not connecting to Prometheus

1. Check if Prometheus is running:
   ```bash
   docker ps | grep prometheus
   ```

2. Check Prometheus targets:
   - Go to http://localhost:9090/targets
   - Ensure all targets are "UP"

### Logs not appearing in Kibana

1. Check Logstash logs:
   ```bash
   docker logs photoidentifier-logstash
   ```

2. Verify Elasticsearch is healthy:
   ```bash
   curl http://localhost:9200/_cluster/health
   ```

### Traces not appearing in Jaeger

1. Check if OTLP endpoint is accessible:
   ```bash
   curl http://localhost:4317
   ```

2. Verify OpenTelemetry initialization in applications

## Maintenance

### Backup Grafana Dashboards

```bash
# Export all dashboards
curl -u admin:admin http://localhost:3001/api/search?query=dash > dashboards.json
```

### Retain Prometheus Data

Data is persisted in Docker volumes. To backup:
```bash
docker run --rm -v photoidentifier_prometheus_data:/data -v $(pwd):/backup alpine tar czf /backup/prometheus-backup.tar.gz /data
```

### Clean Old Logs

Configure Elasticsearch index lifecycle management in Kibana:
1. Go to Stack Management → Index Lifecycle Policies
2. Create a policy to delete indices older than 30 days

## Security

In production:

1. Change default passwords (Grafana, Kibana)
2. Enable TLS for all connections
3. Restrict network access
4. Use secrets management for sensitive configuration

## Scaling

For high-traffic deployments:

1. **Prometheus**: Use Thanos or VictoriaMetrics for long-term storage
2. **Elasticsearch**: Deploy a cluster with proper sharding
3. **Jaeger**: Use Cassandra or Elasticsearch as the backend storage

## Further Reading

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/)
- [Grafana Dashboards](https://grafana.com/docs/grafana/latest/dashboards/)
- [ELK Stack Guide](https://www.elastic.co/guide/)
