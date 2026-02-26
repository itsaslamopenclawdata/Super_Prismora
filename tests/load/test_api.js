"""
Performance Tests - Load Testing

K6 load tests for Super_Prismora API endpoints.
Tests various load scenarios and performance benchmarks.

Priority: MEDIUM
"""

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

export const options = {
  scenarios: {
    // Smoke test - light load
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
    },
    // Load test - normal load
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },  // Ramp up
        { duration: '5m', target: 50 },   // Stay at 50
        { duration: '2m', target: 0 },    // Ramp down
      ],
    },
    // Stress test
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },
        { duration: '5m', target: 100 },
        { duration: '2m', target: 200 },
        { duration: '5m', target: 200 },
        { duration: '2m', target: 0 },
      ],
    },
    // Spike test
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 10 },
        { duration: '30s', target: 100 },  // Spike up
        { duration: '1m', target: 100 },
        { duration: '10s', target: 10 },   // Spike down
        { duration: '30s', target: 10 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],     // Error rate < 1%
    errors: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://api.superprismora.com';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || '';

// Test scenarios
export default function () {
  // Health check
  testHealthCheck();
  
  // Only run authenticated tests if we have a token
  if (AUTH_TOKEN) {
    testUserProfile();
    testPhotoList();
    testSearch();
  }
  
  sleep(1);
}

function testHealthCheck() {
  const res = http.get(`${BASE_URL}/api/health`);
  
  const success = check(res, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  errorRate.add(!success);
  responseTime.add(res.timings.duration);
}

function testUserProfile() {
  const headers = {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json',
  };
  
  const res = http.get(`${BASE_URL}/api/v1/users/profile`, { headers });
  
  const success = check(res, {
    'user profile status is 200': (r) => r.status === 200,
    'user profile response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  errorRate.add(!success);
  responseTime.add(res.timings.duration);
}

function testPhotoList() {
  const headers = {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json',
  };
  
  const res = http.get(`${BASE_URL}/api/v1/photos?page=1&limit=20`, { headers });
  
  const success = check(res, {
    'photo list status is 200': (r) => r.status === 200,
    'photo list response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  errorRate.add(!success);
  responseTime.add(res.timings.duration);
}

function testSearch() {
  const headers = {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json',
  };
  
  const res = http.get(`${BASE_URL}/api/v1/search?q=nature`, { headers });
  
  const success = check(res, {
    'search status is 200': (r) => r.status === 200,
    'search response time < 1000ms': (r) => r.timings.duration < 1000,
  });
  
  errorRate.add(!success);
  responseTime.add(res.timings.duration);
}

// Test authentication endpoints (no auth required)
export function testAuth() {
  const email = `test${Math.floor(Math.random() * 10000)}@example.com`;
  
  // Register
  const registerRes = http.post(`${BASE_URL}/api/v1/auth/register`, 
    JSON.stringify({ email, password: 'TestPass123!' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  check(registerRes, {
    'register returns 201': (r) => r.status === 201,
  });
  
  // Login
  const loginRes = http.post(`${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({ email, password: 'TestPass123!' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  check(loginRes, {
    'login returns 200': (r) => r.status === 200,
    'login returns token': (r) => r.json('access_token') !== undefined,
  });
}

// Test upload endpoint
export function testUpload() {
  if (!AUTH_TOKEN) return;
  
  const headers = {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
  };
  
  // Create a small test file
  const file = http.file('fake image data', 'test.jpg', 'image/jpeg');
  
  const res = http.post(`${BASE_URL}/api/v1/photos/upload`,
    { file },
    { headers }
  );
  
  check(res, {
    'upload returns 201': (r) => r.status === 201,
  });
}

// Test AI identification
export function testIdentification() {
  if (!AUTH_TOKEN) return;
  
  const headers = {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json',
  };
  
  const res = http.post(`${BASE_URL}/api/v1/identify`,
    JSON.stringify({ image_url: 'https://example.com/test.jpg' }),
    { headers }
  );
  
  // May return 202 (async) or 200 (sync)
  check(res, {
    'identify returns 200 or 202': (r) => r.status === 200 || r.status === 202,
  });
}

// Setup function
export function setup() {
  // This runs once before the test
  console.log(`Testing against: ${BASE_URL}`);
  
  return { startTime: Date.now() };
}

// Teardown function
export function teardown(data) {
  // This runs once after the test
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`Test completed in ${duration}s`);
}
