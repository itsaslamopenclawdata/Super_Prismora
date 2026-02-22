#!/bin/bash
# Docker Run Script for PhotoIdentifier Platform
# This script handles running Docker containers locally

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="${IMAGE_NAME:-photoidentifier}"
REGISTRY="${REGISTRY:-ghcr.io}"
VERSION="${VERSION:-latest}"
NAMESPACE="${NAMESPACE:-itsaslamopenclawdata}"
CONTAINER_NAME="photoidentifier-${VERSION}"

FULL_IMAGE_NAME="${REGISTRY}/${NAMESPACE}/${IMAGE_NAME}:${VERSION}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Docker Run Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Parse arguments
ENV_FILE="${1:-.env}"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: Environment file '$ENV_FILE' not found${NC}"
    echo "Usage: $0 [env-file]"
    exit 1
fi

# Stop and remove existing container if it exists
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${YELLOW}Stopping existing container...${NC}"
    docker stop "${CONTAINER_NAME}" 2>/dev/null || true
    docker rm "${CONTAINER_NAME}" 2>/dev/null || true
    echo -e "${GREEN}✓ Container removed${NC}"
    echo ""
fi

# Run container
echo -e "${GREEN}Starting container...${NC}"
echo "Image: ${FULL_IMAGE_NAME}"
echo "Container: ${CONTAINER_NAME}"
echo "Environment file: ${ENV_FILE}"
echo ""

docker run -d \
    --name "${CONTAINER_NAME}" \
    --env-file "${ENV_FILE}" \
    -p 3000:3000 \
    --restart unless-stopped \
    --health-cmd="wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1" \
    --health-interval=30s \
    --health-timeout=10s \
    --health-retries=3 \
    --health-start-period=40s \
    "${FULL_IMAGE_NAME}"

echo -e "${GREEN}✓ Container started${NC}"
echo ""

# Show container status
echo -e "${GREEN}Container status:${NC}"
docker ps -f "name=${CONTAINER_NAME}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Container is running${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Application URL: http://localhost:3000"
echo ""
echo "View logs:"
echo "  docker logs -f ${CONTAINER_NAME}"
echo ""
echo "Stop container:"
echo "  docker stop ${CONTAINER_NAME}"
echo ""
echo "Remove container:"
echo "  docker rm ${CONTAINER_NAME}"
echo ""
