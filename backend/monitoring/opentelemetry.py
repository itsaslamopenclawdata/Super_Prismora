"""
OpenTelemetry Configuration for Backend (Python)
Sets up distributed tracing and metrics for the Python backend services
"""

import os
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource, SERVICE_NAME, SERVICE_VERSION
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader, ConsoleMetricExporter
from opentelemetry.instrumentation.auto_instrumentation import AutoInstrumentation


def init_opentelemetry():
    """
    Initialize OpenTelemetry for backend services
    """
    # Create resource with service metadata
    resource = Resource.create({
        SERVICE_NAME: os.getenv('SERVICE_NAME', 'photoidentifier-backend'),
        SERVICE_VERSION: os.getenv('SERVICE_VERSION', '0.1.0'),
        'deployment.environment': os.getenv('NODE_ENV', 'development'),
        'service.namespace': 'photoidentifier',
    })

    # Initialize tracing
    trace_provider = TracerProvider(resource=resource)
    
    # Configure OTLP exporter
    otlp_endpoint = os.getenv('OTEL_EXPORTER_OTLP_ENDPOINT', 'http://localhost:4317')
    otlp_exporter = OTLPSpanExporter(endpoint=otlp_endpoint, insecure=True)
    
    # Add batch span processor
    span_processor = BatchSpanProcessor(otlp_exporter)
    trace_provider.add_span_processor(span_processor)
    
    # Set global trace provider
    trace.set_tracer_provider(trace_provider)
    
    # Initialize metrics
    metric_reader = PeriodicExportingMetricReader(
        ConsoleMetricExporter(),
        export_interval_millis=15000
    )
    meter_provider = MeterProvider(resource=resource, metric_readers=[metric_reader])
    
    # Auto-instrument common libraries
    auto_instrumentation = AutoInstrumentation()
    auto_instrumentation.instrument()
    
    return {
        'tracer': trace.get_tracer(__name__),
        'meter': meter_provider.get_meter(__name__),
    }


# Create a tracer decorator for manual instrumentation
def traced(operation_name=None):
    """
    Decorator to automatically trace functions
    """
    def decorator(func):
        tracer = trace.get_tracer(__name__)
        
        def wrapper(*args, **kwargs):
            name = operation_name or f"{func.__module__}.{func.__name__}"
            with tracer.start_as_current_span(name) as span:
                # Add function arguments as attributes (be careful with sensitive data)
                span.set_attribute('function.name', func.__name__)
                span.set_attribute('function.module', func.__module__)
                return func(*args, **kwargs)
        return wrapper
    return decorator


# Initialize on import
_telemetry = init_opentelemetry()
tracer = _telemetry['tracer']
meter = _telemetry['meter']
