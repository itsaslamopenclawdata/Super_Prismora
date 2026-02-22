"""
Prometheus metrics exporter for PhotoIdentifier backend
"""

from prometheus_client import Counter, Histogram, Gauge, Info, start_http_server
import os
import time


# Create metrics
# HTTP request metrics
http_requests_total = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

http_request_duration_seconds = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration in seconds',
    ['method', 'endpoint'],
    buckets=(0.005, 0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1.0, 2.5, 5.0, 7.5, 10.0)
)

# Database metrics
db_query_duration_seconds = Histogram(
    'db_query_duration_seconds',
    'Database query duration in seconds',
    ['query_type', 'table'],
    buckets=(0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0)
)

db_connection_pool_size = Gauge(
    'db_connection_pool_size',
    'Database connection pool size'
)

db_connection_pool_active = Gauge(
    'db_connection_pool_active',
    'Active database connections'
)

# Cache metrics
cache_hits_total = Counter(
    'cache_hits_total',
    'Total cache hits',
    ['cache_type']
)

cache_misses_total = Counter(
    'cache_misses_total',
    'Total cache misses',
    ['cache_type']
)

cache_operation_duration_seconds = Histogram(
    'cache_operation_duration_seconds',
    'Cache operation duration in seconds',
    ['operation', 'cache_type']
)

# Business metrics
photos_processed_total = Counter(
    'photos_processed_total',
    'Total photos processed',
    ['status', 'model']
)

photos_processing_duration_seconds = Histogram(
    'photos_processing_duration_seconds',
    'Photo processing duration in seconds',
    ['model'],
    buckets=(0.1, 0.5, 1.0, 2.5, 5.0, 10.0, 30.0, 60.0)
)

# Application info
app_info = Info(
    'app_info',
    'Application information'
)


def init_prometheus_metrics(port: int = 8001):
    """
    Initialize Prometheus metrics server
    """
    # Start metrics server
    start_http_server(port)
    
    # Set application info
    app_info.info({
        'version': os.getenv('APP_VERSION', '0.1.0'),
        'environment': os.getenv('NODE_ENV', 'development'),
        'service': 'photoidentifier-backend'
    })


class MetricsMiddleware:
    """
    Middleware to automatically track HTTP requests with Prometheus metrics
    """
    
    def __init__(self, app):
        self.app = app
    
    def __call__(self, environ, start_response):
        start_time = time.time()
        
        def custom_start_response(status, headers, exc_info=None):
            # Extract status code
            status_code = status.split(' ')[0]
            
            # Track request
            method = environ.get('REQUEST_METHOD', 'unknown')
            path = environ.get('PATH_INFO', 'unknown')
            
            http_requests_total.labels(
                method=method,
                endpoint=path,
                status=status_code
            ).inc()
            
            return start_response(status, headers, exc_info)
        
        # Call the application
        response = self.app(environ, custom_start_response)
        
        # Track duration
        duration = time.time() - start_time
        http_request_duration_seconds.labels(
            method=environ.get('REQUEST_METHOD', 'unknown'),
            endpoint=environ.get('PATH_INFO', 'unknown')
        ).observe(duration)
        
        return response


# Export metrics for use in application
__all__ = [
    'http_requests_total',
    'http_request_duration_seconds',
    'db_query_duration_seconds',
    'db_connection_pool_size',
    'db_connection_pool_active',
    'cache_hits_total',
    'cache_misses_total',
    'cache_operation_duration_seconds',
    'photos_processed_total',
    'photos_processing_duration_seconds',
    'app_info',
    'init_prometheus_metrics',
    'MetricsMiddleware',
]
