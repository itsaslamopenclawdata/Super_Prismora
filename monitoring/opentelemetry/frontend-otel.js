/**
 * OpenTelemetry Configuration for Next.js Frontend
 * Sets up distributed tracing and metrics for the web application
 */

const { NodeSDK } = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const {
  OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-grpc');
const {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} = require('@opentelemetry/sdk-metrics');
const { Resource } = require('@opentelemetry/resources');
const {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_VERSION,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
} = require('@opentelemetry/semantic-conventions');
const { trace } = require('@opentelemetry/api');

// Initialize OpenTelemetry SDK
const sdk = new NodeSDK({
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: 'photoidentifier-frontend',
    [SEMRESATTRS_SERVICE_VERSION]: process.env.npm_package_version || '0.1.0',
    [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
  }),
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4317',
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
    exportIntervalMillis: 15000,
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      // Disable some instrumentations that aren't needed
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
    }),
  ],
});

// Start the SDK
sdk
  .start()
  .then(() => {
    console.log('OpenTelemetry initialized successfully');
  })
  .catch((error) => {
    console.error('Error initializing OpenTelemetry:', error);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(
      () => console.log('OpenTelemetry terminated successfully'),
      (err) => console.error('Error terminating OpenTelemetry:', err)
    )
    .finally(() => process.exit(0));
});

// Export tracer for manual instrumentation
module.exports = { tracer: trace.getTracer('photoidentifier-frontend') };
