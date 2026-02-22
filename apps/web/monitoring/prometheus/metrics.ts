/**
 * Prometheus metrics for PhotoIdentifier frontend
 * Uses prom-client for metrics collection
 */

import client from 'prom-client';
import { NextResponse } from 'next/server';

// Create a Registry
const register = new client.Registry();

// Enable default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// HTTP request metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1.0, 2.5, 5.0, 7.5, 10.0],
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

// Frontend-specific metrics
const pageViewsTotal = new client.Counter({
  name: 'page_views_total',
  help: 'Total page views',
  labelNames: ['page', 'user_agent_type'],
});

const photoUploadTotal = new client.Counter({
  name: 'photo_uploads_total',
  help: 'Total photo uploads',
  labelNames: ['status', 'file_size_range'],
});

const photoUploadDuration = new client.Histogram({
  name: 'photo_upload_duration_seconds',
  help: 'Duration of photo uploads in seconds',
  labelNames: ['file_size_range'],
  buckets: [0.5, 1.0, 2.5, 5.0, 10.0, 30.0, 60.0],
});

const apiClientRequestDuration = new client.Histogram({
  name: 'api_client_request_duration_seconds',
  help: 'Duration of API client requests in seconds',
  labelNames: ['endpoint', 'method'],
  buckets: [0.1, 0.25, 0.5, 1.0, 2.5, 5.0],
});

const apiClientRequestTotal = new client.Counter({
  name: 'api_client_requests_total',
  help: 'Total API client requests',
  labelNames: ['endpoint', 'method', 'status'],
});

// Register all metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(pageViewsTotal);
register.registerMetric(photoUploadTotal);
register.registerMetric(photoUploadDuration);
register.registerMetric(apiClientRequestDuration);
register.registerMetric(apiClientRequestTotal);

// Middleware to track HTTP requests
export function metricsMiddleware(req: Request, res: Response, next: () => void) {
  const start = Date.now();
  const method = req.method;
  const route = req.url;

  // Continue to the next middleware
  next();

  const duration = (Date.now() - start) / 1000; // Convert to seconds
  const statusCode = res.status;

  httpRequestDuration.labels(method, route, statusCode).observe(duration);
  httpRequestTotal.labels(method, route, statusCode).inc();
}

// API route to expose metrics
export async function GET() {
  const metrics = await register.metrics();
  return new NextResponse(metrics, {
    status: 200,
    headers: {
      'Content-Type': register.contentType,
    },
  });
}

// Helper functions to track specific metrics
export function trackPageView(page: string, userAgentType: string = 'unknown') {
  pageViewsTotal.labels(page, userAgentType).inc();
}

export function trackPhotoUpload(status: 'success' | 'error', fileSizeRange: string, duration?: number) {
  photoUploadTotal.labels(status, fileSizeRange).inc();
  if (duration !== undefined) {
    photoUploadDuration.labels(fileSizeRange).observe(duration);
  }
}

export function trackApiClientRequest(endpoint: string, method: string, status: number, duration: number) {
  apiClientRequestTotal.labels(endpoint, method, status).inc();
  apiClientRequestDuration.labels(endpoint, method).observe(duration);
}

// Export register and metrics
export {
  register,
  httpRequestDuration,
  httpRequestTotal,
  pageViewsTotal,
  photoUploadTotal,
  photoUploadDuration,
  apiClientRequestDuration,
  apiClientRequestTotal,
};
