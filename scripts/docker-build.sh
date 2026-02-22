#!/bin/bash
# Docker Build Script for PhotoIdentifier Platform
# This script handles building, tagging, and pushing Docker images

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="${IMAGE_NAME:-photoidentifier}"
REGISTRY="${REGISTRY:-ghcr.io}"
VERSION="${VERSION:-$(git describe --tags --always --dirty 2>/dev/null || echo 'latest')}"
NAMESPACE="${NAMESPACE:-itsaslamopenclawdata}"

FULL_IMAGE_NAME="${REGISTRY}/${NAMESPACE}/${IMAGE_NAME}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Docker Build Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Parse arguments
TARGET="${1:-production}"
PUSH="${2:-false}"

case "$TARGET" in
  "dev"|"development")
    BUILD_TARGET="development"
    TAG_SUFFIX="-dev"
    ;;
  "test")
    BUILD_TARGET="builder"
    TAG_SUFFIX="-test"
    ;;
  "prod"|"production"|"")
    BUILD_TARGET="production"
    TAG_SUFFIX=""
    ;;
  *)
    echo -e "${RED}Error: Unknown target '$TARGET'${NC}"
    echo "Usage: $0 [dev|test|prod] [true|false]"
    exit 1
    ;;
esac

# Function to print step
print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Function to print error
print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Build Docker image
print_step "Building Docker image..."
echo "Target: ${BUILD_TARGET}"
echo "Version: ${VERSION}"
echo "Image: ${FULL_IMAGE_NAME}:${VERSION}${TAG_SUFFIX}"

if ! docker build \
  --target "${BUILD_TARGET}" \
  --tag "${FULL_IMAGE_NAME}:${VERSION}${TAG_SUFFIX}" \
  --tag "${FULL_IMAGE_NAME}:latest${TAG_SUFFIX}" \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  --build-arg VERSION="${VERSION}" \
  --build-arg BUILD_DATE="$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
  --build-arg VCS_REF="$(git rev-parse --short HEAD)" \
  .; then
    print_error "Docker build failed"
    exit 1
fi

echo -e "${GREEN}✓ Build successful${NC}"
echo ""

# Push image if requested
if [ "$PUSH" = "true" ]; then
    print_step "Pushing Docker image to registry..."

    if ! docker push "${FULL_IMAGE_NAME}:${VERSION}${TAG_SUFFIX}"; then
        print_error "Failed to push image with version tag"
        exit 1
    fi

    if ! docker push "${FULL_IMAGE_NAME}:latest${TAG_SUFFIX}"; then
        print_error "Failed to push image with latest tag"
        exit 1
    fi

    echo -e "${GREEN}✓ Push successful${NC}"
    echo ""
fi

# Show image information
print_step "Image information:"
docker images | grep "${IMAGE_NAME}" || true

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Build complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Image tags:"
echo "  - ${FULL_IMAGE_NAME}:${VERSION}${TAG_SUFFIX}"
echo "  - ${FULL_IMAGE_NAME}:latest${TAG_SUFFIX}"
echo ""
echo "To run the container:"
echo "  docker run -p 3000:3000 ${FULL_IMAGE_NAME}:${VERSION}${TAG_SUFFIX}"
echo ""
