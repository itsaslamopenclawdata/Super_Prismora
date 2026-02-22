# PhotoIdentifier Backend Services API Documentation

## Overview

This document describes the REST API for the PhotoIdentifier platform's backend microservices. All services are built with FastAPI and provide automatic OpenAPI/Swagger documentation.

---

## Table of Contents

1. [Base URL](#base-url)
2. [Authentication](#authentication)
3. [Common Response Codes](#common-response-codes)
4. [Services](#services)
   - [Image Service](#image-service)
   - [Notification Service](#notification-service)
   - [Search Service](#search-service)
   - [Analytics Service](#analytics-service)
   - [Marketplace Service](#marketplace-service)
   - [Booking Service](#booking-service)
5. [API Gateway](#api-gateway)

---

## Base URL

### Development
```
http://localhost:8000
```

### Individual Services (Direct Access)
```
Image Service:      http://localhost:8001
Notification:       http://localhost:8002
Search:             http://localhost:8003
Analytics:          http://localhost:8004
Marketplace:        http://localhost:8005
Booking:            http://localhost:8006
```

### Via Kong API Gateway
```
http://localhost:8000/api/v1/images
http://localhost:8000/api/v1/notifications
http://localhost:8000/api/v1/search
http://localhost:8000/api/v1/analytics
http://localhost:8000/api/v1/marketplace
http://localhost:8000/api/v1/bookings
```

---

## Authentication

Most endpoints require authentication via JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

To obtain a token, use the `/auth/login` endpoint.

---

## Common Response Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 201  | Created |
| 204  | No Content |
| 400  | Bad Request |
| 401  | Unauthorized |
| 403  | Forbidden |
| 404  | Not Found |
| 429  | Too Many Requests |
| 500  | Internal Server Error |

---

## Services

### Image Service

**Service Name:** Image Upload & Processing Service
**Port:** 8001
**Base Path:** `/api/v1/images`

#### Endpoints

##### Upload Image
```http
POST /api/v1/images/upload
Content-Type: multipart/form-data

file: <binary>
```

**Response:**
```json
{
  "id": "uuid",
  "filename": "uuid.jpg",
  "original_filename": "photo.jpg",
  "size": 1024000,
  "width": 1920,
  "height": 1080,
  "format": "JPEG",
  "url": "/api/v1/images/uuid.jpg"
}
```

##### Upload Multiple Images
```http
POST /api/v1/images/upload/multiple
Content-Type: multipart/form-data

files: [<binary>, <binary>]
```

##### Get Image
```http
GET /api/v1/images/{filename}
```

Returns the image file.

##### Delete Image
```http
DELETE /api/v1/images/{filename}
```

##### Get Image Info
```http
GET /api/v1/images/{filename}/info
```

**Response:**
```json
{
  "filename": "uuid.jpg",
  "format": "JPEG",
  "mode": "RGB",
  "size": 1024000,
  "width": 1920,
  "height": 1080,
  "created_at": 1234567890,
  "modified_at": 1234567890
}
```

##### Resize Image
```http
POST /api/v1/images/process/resize
Content-Type: application/json

{
  "filename": "uuid.jpg",
  "width": 800,
  "height": 600
}
```

##### Get Upload Stats
```http
GET /api/v1/images/stats
```

---

### Notification Service

**Service Name:** Notification Service
**Port:** 8002
**Base Path:** `/api/v1/notifications`

#### Endpoints

##### Send Email
```http
POST /api/v1/notifications/email
Content-Type: application/json

{
  "to": "user@example.com",
  "subject": "Welcome",
  "body": "Hello!",
  "html_body": "<h1>Hello!</h1>",
  "priority": "normal"
}
```

##### Send Bulk Email
```http
POST /api/v1/notifications/email/bulk
Content-Type: application/json

{
  "to": ["user1@example.com", "user2@example.com"],
  "subject": "Announcement",
  "body": "Hello everyone!",
  "priority": "normal"
}
```

##### Send SMS
```http
POST /api/v1/notifications/sms
Content-Type: application/json

{
  "to": "+1234567890",
  "message": "Your code is 123456"
}
```

##### Send Push Notification
```http
POST /api/v1/notifications/push
Content-Type: application/json

{
  "user_id": "uuid",
  "title": "New Feature",
  "body": "Check out what's new!",
  "data": {"action": "open_feature"}
}
```

##### List Templates
```http
GET /api/v1/notifications/templates
```

**Response:**
```json
{
  "templates": {
    "welcome": {
      "subject": "Welcome to PhotoIdentifier!",
      "body": "Thank you for signing up..."
    }
  },
  "count": 5
}
```

##### Send Template Notification
```http
POST /api/v1/notifications/templates/{template_name}
Content-Type: application/json

{
  "to": "user@example.com",
  "context": {"name": "John", "reset_link": "https://..."}
}
```

---

### Search Service

**Service Name:** Search Service (Elasticsearch)
**Port:** 8003
**Base Path:** `/api/v1/search`

#### Endpoints

##### Index Document
```http
POST /api/v1/search/index
Content-Type: application/json

{
  "id": "optional-uuid",
  "type": "photos",
  "title": "Sunset Beach",
  "description": "Beautiful sunset at the beach",
  "tags": ["nature", "sunset", "beach"],
  "metadata": {"date": "2024-01-01"}
}
```

##### Bulk Index Documents
```http
POST /api/v1/search/index/bulk
Content-Type: application/json

{
  "documents": [...]
}
```

##### Search
```http
GET /api/v1/search?query=sunset&document_type=photos&tags=nature&size=10
```

**Response:**
```json
{
  "total": 25,
  "took": 0.015,
  "results": [
    {
      "id": "uuid",
      "type": "photos",
      "score": 0.95,
      "source": {
        "title": "Sunset Beach",
        "description": "...",
        "highlight": {
          "title": ["<em>Sunset</em> Beach"]
        }
      }
    }
  ]
}
```

##### Get Suggestions
```http
GET /api/v1/search/suggest?query=suns&size=5
```

##### Get Aggregations
```http
GET /api/v1/search/aggregations?query=sunset&document_type=photos
```

##### Delete Document
```http
DELETE /api/v1/search/{document_type}/{document_id}
```

##### List Indices
```http
GET /api/v1/search/indices
```

---

### Analytics Service

**Service Name:** Analytics & Event Tracking Service
**Port:** 8004
**Base Path:** `/api/v1/analytics`

#### Endpoints

##### Track Event
```http
POST /api/v1/analytics/track
Content-Type: application/json

{
  "event_type": "photo_upload",
  "user_id": "uuid",
  "session_id": "uuid",
  "properties": {"photo_id": "uuid", "file_size": 1024000},
  "timestamp": "2024-01-01T12:00:00Z"
}
```

##### Track Bulk Events
```http
POST /api/v1/analytics/track/bulk
Content-Type: application/json

{
  "events": [...]
}
```

##### Get Events
```http
GET /api/v1/analytics/events?event_type=photo_upload&user_id=uuid&limit=100
```

##### Get Stats
```http
GET /api/v1/analytics/stats?start_date=2024-01-01&end_date=2024-01-31
```

**Response:**
```json
{
  "total_events": 5000,
  "unique_users": 250,
  "unique_sessions": 300,
  "event_types": {
    "page_view": 2000,
    "photo_upload": 500,
    "search_performed": 1500
  }
}
```

##### Get User Activity
```http
GET /api/v1/analytics/users/{user_id}/activity?days=7
```

##### Get Session Events
```http
GET /api/v1/analytics/sessions/{session_id}/events
```

##### Funnel Analysis
```http
GET /api/v1/analytics/funnel?steps=page_view,photo_upload,photo_identified
```

##### Retention Analysis
```http
GET /api/v1/analytics/retention?cohort_date=2024-01-01&periods=7
```

##### Export Analytics
```http
GET /api/v1/analytics/export?start_date=2024-01-01&end_date=2024-01-31
```

---

### Marketplace Service

**Service Name:** Marketplace Service
**Port:** 8005
**Base Path:** `/api/v1/marketplace`

#### Endpoints

##### List Products
```http
GET /api/v1/marketplace/products?category=photos&available_only=true&min_price=10&max_price=100
```

##### Get Product
```http
GET /api/v1/marketplace/products/{product_id}
```

##### Create Product
```http
POST /api/v1/marketplace/products
Content-Type: application/json

{
  "name": "Photo Pack: Nature",
  "description": "50 beautiful nature photos",
  "price": 19.99,
  "category": "photo_packs",
  "image_url": "https://...",
  "stock": 100
}
```

##### Update Product
```http
PUT /api/v1/marketplace/products/{product_id}
Content-Type: application/json

{
  "price": 14.99,
  "stock": 50
}
```

##### Delete Product
```http
DELETE /api/v1/marketplace/products/{product_id}
```

##### List Categories
```http
GET /api/v1/marketplace/categories
```

##### Update Cart
```http
POST /api/v1/marketplace/cart
Content-Type: application/json

{
  "user_id": "uuid",
  "items": [
    {"product_id": "uuid", "quantity": 2}
  ]
}
```

##### Get Cart
```http
GET /api/v1/marketplace/cart/{user_id}
```

##### Clear Cart
```http
DELETE /api/v1/marketplace/cart/{user_id}
```

##### Create Order
```http
POST /api/v1/marketplace/orders
Content-Type: application/json

{
  "user_id": "uuid",
  "items": [{"product_id": "uuid", "quantity": 2}],
  "shipping_address": {...},
  "payment_method": "stripe"
}
```

##### List Orders
```http
GET /api/v1/marketplace/orders?user_id=uuid&status=delivered
```

##### Get Order
```http
GET /api/v1/marketplace/orders/{order_id}
```

##### Update Order Status
```http
PUT /api/v1/marketplace/orders/{order_id}/status
Content-Type: application/json

{
  "status": "shipped"
}
```

##### Get Marketplace Stats
```http
GET /api/v1/marketplace/stats
```

---

### Booking Service

**Service Name:** Telehealth Booking Service
**Port:** 8006
**Base Path:** `/api/v1/bookings`

#### Endpoints

##### List Professionals
```http
GET /api/v1/bookings/professionals?specialization=dermatology&available_only=true
```

##### Get Professional
```http
GET /api/v1/bookings/professionals/{professional_id}
```

##### Create Professional
```http
POST /api/v1/bookings/professionals
Content-Type: application/json

{
  "name": "Dr. Jane Smith",
  "email": "jane@example.com",
  "specialization": "dermatology",
  "credentials": "MD",
  "bio": "10 years experience...",
  "hourly_rate": 150.00
}
```

##### List Available Slots
```http
GET /api/v1/bookings/professionals/{professional_id}/slots?start_date=2024-01-01&end_date=2024-01-31
```

##### Create Slot
```http
POST /api/v1/bookings/slots
Content-Type: application/json

{
  "professional_id": "uuid",
  "start_time": "2024-01-01T10:00:00Z",
  "end_time": "2024-01-01T11:00:00Z"
}
```

##### Delete Slot
```http
DELETE /api/v1/bookings/slots/{slot_id}
```

##### Create Booking
```http
POST /api/v1/bookings/bookings
Content-Type: application/json

{
  "user_id": "uuid",
  "professional_id": "uuid",
  "slot_id": "uuid",
  "notes": "Skin consultation"
}
```

##### List Bookings
```http
GET /api/v1/bookings/bookings?user_id=uuid&status=confirmed
```

##### Get Booking
```http
GET /api/v1/bookings/bookings/{booking_id}
```

##### Update Booking
```http
PUT /api/v1/bookings/bookings/{booking_id}
Content-Type: application/json

{
  "status": "confirmed",
  "notes": "Updated notes"
}
```

##### Cancel Booking
```http
DELETE /api/v1/bookings/bookings/{booking_id}
```

##### Get Booking Stats
```http
GET /api/v1/bookings/stats
```

---

## API Gateway

All services are accessible through the Kong API Gateway. The gateway provides:

- **Central routing** at `http://localhost:8000`
- **Rate limiting** (100 req/min, 1000 req/hour)
- **CORS** handling
- **JWT authentication**
- **Request size limiting** (10MB)
- **Request logging**

### Gateway Endpoints

| Service | Gateway Path |
|---------|--------------|
| Image | `/api/v1/images` |
| Notification | `/api/v1/notifications` |
| Search | `/api/v1/search` |
| Analytics | `/api/v1/analytics` |
| Marketplace | `/api/v1/marketplace` |
| Booking | `/api/v1/bookings` |

### Gateway Management

- **Admin API:** http://localhost:8001
- **Konga UI:** http://localhost:1337

---

## Interactive Documentation

Each service provides interactive API documentation:

- **Swagger UI:** `http://localhost:<port>/docs`
- **ReDoc:** `http://localhost:<port>/redoc`

### Service Documentation URLs

- Image: http://localhost:8001/docs
- Notification: http://localhost:8002/docs
- Search: http://localhost:8003/docs
- Analytics: http://localhost:8004/docs
- Marketplace: http://localhost:8005/docs
- Booking: http://localhost:8006/docs

---

## Error Handling

All errors follow a consistent format:

```json
{
  "detail": "Error message description"
}
```

Common error types:
- `ValidationError`: Invalid request data
- `NotFoundError`: Resource not found
- `UnauthorizedError`: Authentication required
- `RateLimitError`: Too many requests
- `InternalServerError`: Server error

---

## Rate Limiting

- **Per IP:** 100 requests per minute
- **Per Hour:** 1,000 requests per hour
- **Per Day:** 10,000 requests per day

Exceeded limits return `429 Too Many Requests`.

---

## Health Checks

Each service provides a health check endpoint:

```http
GET /health
```

**Response:**
```json
{
  "service": "image",
  "status": "healthy"
}
```

---

## OpenAPI Specification

The OpenAPI specification for each service is available at:

```
http://localhost:<port>/openapi.json
```

---

## SDK & Client Libraries

We recommend using these tools to interact with the API:

- **JavaScript:** `axios` or `fetch`
- **Python:** `httpx` or `requests`
- **Java:** `OkHttp`
- **Go:** `net/http`

---

## Support

For issues or questions:
- GitHub Issues: [Super_Prismora](https://github.com/itsaslamopenclawdata/Super_Prismora)
- Documentation: See `services/README.md`

---

## Changelog

### v1.0.0 (2024-01-01)
- Initial release of all 6 backend services
- Kong API Gateway configuration
- Complete API documentation

---

**Last Updated:** 2024-01-01
**API Version:** 1.0.0
