#!/bin/bash

# Kong API Gateway Configuration Script
# This script sets up Kong with declarative configuration

set -e

echo "🚀 Configuring Kong API Gateway..."

# Check if Kong is running
if ! curl -s http://localhost:8001 > /dev/null; then
    echo "❌ Kong is not running. Please start Kong first:"
    echo "   cd services/kong && docker-compose up -d"
    exit 1
fi

echo "✅ Kong is running"

# Apply declarative configuration
echo "📝 Applying declarative configuration..."
curl -X POST http://localhost:8001/config \
  -H "Content-Type: application/json" \
  -d @kong.yml

echo "✅ Declarative configuration applied"

# Check services
echo "🔍 Checking configured services..."
curl -s http://localhost:8001/services | jq .

# Check routes
echo "🛣️  Checking configured routes..."
curl -s http://localhost:8001/routes | jq .

# Check plugins
echo "🔌 Checking configured plugins..."
curl -s http://localhost:8001/plugins | jq .

echo "✅ Kong configuration complete!"
echo ""
echo "📊 Access points:"
echo "   - Gateway Proxy: http://localhost:8000"
echo "   - Admin API: http://localhost:8001"
echo "   - Konga UI: http://localhost:1337"
echo ""
echo "📚 Test endpoints:"
echo "   - Image Service: http://localhost:8000/api/v1/images"
echo "   - Notification Service: http://localhost:8000/api/v1/notifications"
echo "   - Search Service: http://localhost:8000/api/v1/search"
echo "   - Analytics Service: http://localhost:8000/api/v1/analytics"
echo "   - Marketplace Service: http://localhost:8000/api/v1/marketplace"
echo "   - Booking Service: http://localhost:8000/api/v1/bookings"
