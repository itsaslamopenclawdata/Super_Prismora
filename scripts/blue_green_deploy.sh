#!/bin/bash
# Blue-Green Deployment Script
# Auto-generated: 2026-02-26
# Purpose: Zero-downtime deployments for Super_Prismora

set -euo pipefail

# Configuration
NAMESPACE="${NAMESPACE:-production}"
DEPLOYMENT_NAME="${DEPLOYMENT_NAME:-superprismora}"
BLUE_GREEN="${BLUE_GREEN:-blue}"
TIMEOUT_SECONDS="${TIMEOUT_SECONDS:-300}"
HEALTH_CHECK_URL="${HEALTH_CHECK_URL:-http://localhost/api/health}"
SMOKE_TEST="${SMOKE_TEST:-true}"
AUTO_ROLLBACK="${AUTO_ROLLBACK:-true}"
TRAFFIC_SPLIT_PERCENT="${TRAFFIC_SPLIT_PERCENT:-10}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log_info() {
    log "${BLUE}$1${NC}"
}

log_success() {
    log "${GREEN}$1${NC}"
}

log_warn() {
    log "${YELLOW}$1${NC}"
}

log_error() {
    log "${RED}$1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl not found. Please install kubectl."
        exit 1
    fi
    
    # Check namespace exists
    if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
        log_error "Namespace $NAMESPACE does not exist."
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Get current active environment
get_active_environment() {
    local active=$(kubectl get deployment "$DEPLOYMENT_NAME-green" -n "$NAMESPACE" -o jsonpath='{.spec.replicas}' 2>/dev/null || echo "0")
    
    if [ "$active" != "0" ] && [ -n "$active" ]; then
        echo "green"
    else
        echo "blue"
    fi
}

# Deploy to inactive environment
deploy_to_inactive() {
    local inactive=$1
    
    log_info "Deploying to $inactive environment..."
    
    # Apply Kubernetes manifests
    kubectl apply -f k8s/"$inactive".yaml -n "$NAMESPACE" || true
    
    # Set image tag
    kubectl set image deployment/"$DEPLOYMENT_NAME-$inactive" \
        "$DEPLOYMENT_NAME=$DEPLOYMENT_NAME:$inactive" \
        -n "$NAMESPACE"
    
    # Wait for rollout
    log_info "Waiting for deployment to complete..."
    kubectl rollout status deployment/"$DEPLOYMENT_NAME-$inactive" \
        -n "$NAMESPACE" \
        --timeout="${TIMEOUT_SECONDS}s" || {
            log_error "Deployment failed"
            return 1
        }
    
    log_success "Deployed to $inactive environment"
}

# Health check
health_check() {
    local environment=$1
    local url="${HEALTH_CHECK_URL}"
    
    log_info "Running health checks on $environment..."
    
    # Wait for service to be ready
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -sf "$url" > /dev/null 2>&1; then
            log_success "Health check passed"
            return 0
        fi
        
        attempt=$((attempt + 1))
        log_info "Health check attempt $attempt/$max_attempts..."
        sleep 2
    done
    
    log_error "Health check failed"
    return 1
}

# Smoke tests
run_smoke_tests() {
    local environment=$1
    
    if [ "$SMOKE_TEST" != "true" ]; then
        log_warn "Smoke tests disabled. Skipping..."
        return 0
    fi
    
    log_info "Running smoke tests..."
    
    # Example smoke tests (customize as needed)
    local tests_passed=0
    local tests_total=3
    
    # Test 1: API health
    if curl -sf "http://$environment.superprismora.com/api/health" > /dev/null 2>&1; then
        tests_passed=$((tests_passed + 1))
    fi
    
    # Test 2: Database connection
    # (Add actual test)
    
    # Test 3: Key functionality
    # (Add actual test)
    
    if [ $tests_passed -eq $tests_total ]; then
        log_success "All smoke tests passed ($tests_passed/$tests_total)"
        return 0
    else
        log_error "Some smoke tests failed ($tests_passed/$tests_total)"
        return 1
    fi
}

# Switch traffic
switch_traffic() {
    local inactive=$1
    local active=$2
    
    log_info "Switching traffic from $active to $inactive..."
    
    # Scale up inactive (receive traffic)
    kubectl scale deployment "$DEPLOYMENT_NAME-$inactive" \
        --replicas=3 -n "$NAMESPACE"
    
    # Wait for replicas
    kubectl rollout status deployment/"$DEPLOYMENT_NAME-$inactive" \
        -n "$NAMESPACE"
    
    # Scale down active (stop receiving traffic)
    kubectl scale deployment "$DEPLOYMENT_NAME-$active" \
        --replicas=0 -n "$NAMESPACE"
    
    log_success "Traffic switched to $inactive"
}

# Gradual traffic shift
gradual_traffic_shift() {
    local inactive=$1
    
    log_info "Performing gradual traffic shift to $inactive..."
    
    # Start with small percentage
    local current_percent=10
    
    while [ $current_percent -le 100 ]; do
        log_info "Traffic shift: ${current_percent}%"
        
        # Scale based on percentage
        local replicas=$((current_percent * 3 / 100))
        [ $replicas -lt 1 ] && replicas=1
        
        kubectl scale deployment "$DEPLOYMENT_NAME-$inactive" \
            --replicas=$replicas -n "$NAMESPACE"
        
        # Wait and check health
        sleep 10
        
        if ! health_check "$inactive"; then
            if [ "$AUTO_ROLLBACK" == "true" ]; then
                log_error "Health check failed. Rolling back..."
                rollback "$inactive"
                exit 1
            fi
        fi
        
        current_percent=$((current_percent + 20))
    done
    
    log_success "Traffic fully shifted to $inactive"
}

# Rollback
rollback() {
    local environment=$1
    
    log_warn "Rolling back to previous version..."
    
    # Scale up previous environment
    kubectl scale deployment "$DEPLOYMENT_NAME-$environment" \
        --replicas=3 -n "$NAMESPACE"
    
    kubectl rollout status deployment/"$DEPLOYMENT_NAME-$environment" \
        -n "$NAMESPACE"
    
    log_success "Rollback complete"
}

# Cleanup old environment
cleanup() {
    local environment=$1
    
    log_info "Cleaning up old $environment environment..."
    
    # Scale down to 0
    kubectl scale deployment "$DEPLOYMENT_NAME-$environment" \
        --replicas=0 -n "$NAMESPACE"
    
    log_success "Cleanup complete"
}

# Send notification
send_notification() {
    local status=$1
    local message=$2
    
    log_info "Sending notification: $status - $message"
    
    # Integrate with notification service
    # curl -X POST http://notification-service/api/v1/notifications \
    #   -d "{\"type\":\"incident\",\"message\":\"$message\"}"
}

# Main deployment flow
main() {
    log_info "=== Starting Blue-Green Deployment ==="
    log_info "Namespace: $NAMESPACE"
    log_info "Deployment: $DEPLOYMENT_NAME"
    
    check_prerequisites
    
    # Determine environments
    local active=$(get_active_environment)
    local inactive=$( [ "$active" == "blue" ] && echo "green" || echo "blue" )
    
    log_info "Active environment: $active"
    log_info "Inactive environment: $inactive"
    
    # Step 1: Deploy to inactive
    if ! deploy_to_inactive "$inactive"; then
        log_error "Deployment failed"
        send_notification "FAILED" "Deployment to $inactive failed"
        exit 1
    fi
    
    # Step 2: Health check
    if ! health_check "$inactive"; then
        if [ "$AUTO_ROLLBACK" == "true" ]; then
            rollback "$active"
            send_notification "ROLLED_BACK" "Auto-rollback performed due to failed health check"
        fi
        exit 1
    fi
    
    # Step 3: Smoke tests
    if ! run_smoke_tests "$inactive"; then
        log_warn "Smoke tests failed"
        if [ "$AUTO_ROLLBACK" == "true" ]; then
            rollback "$active"
            send_notification "ROLLED_BACK" "Auto-rollback performed due to failed smoke tests"
        fi
        exit 1
    fi
    
    # Step 4: Switch traffic
    if [ "$TRAFFIC_SPLIT_PERCENT" == "100" ]; then
        switch_traffic "$inactive" "$active"
    else
        gradual_traffic_shift "$inactive"
    fi
    
    # Step 5: Cleanup old environment (after confirmation)
    # cleanup "$active"
    
    log_success "=== Blue-Green Deployment Complete ==="
    send_notification "SUCCESS" "Deployment to $inactive completed successfully"
}

# Run main
main "$@"
