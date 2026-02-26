#!/bin/bash
# SSL/TLS Certificate Management Script
# Auto-generated: 2026-02-26
# Purpose: Manage SSL/TLS certificates for Super_Prismora

set -euo pipefail

# Configuration
DOMAIN="${DOMAIN:-superprismora.com}"
EMAIL="${EMAIL:-admin@superprismora.com}"
CERT_DIR="${CERT_DIR:-/etc/letsencrypt/live/${DOMAIN}}"
K8S_NAMESPACE="${K8S_NAMESPACE:-production}"
AWS_REGION="${AWS_REGION:-us-east-1}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "[$(date)] $1"; }
log_info() { log "${GREEN}$1${NC}"; }
log_warn() { log "${YELLOW}$1${NC}"; }
log_error() { log "${RED}$1${NC}"; }

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v certbot &> /dev/null && ! command -v aws &> /dev/null; then
        log_error "Neither certbot nor aws CLI found"
        exit 1
    fi
    
    log_info "Prerequisites check passed"
}

# Install certbot
install_certbot() {
    if command -v certbot &> /dev/null; then
        log_info "certbot already installed"
        return
    fi
    
    log_info "Installing certbot..."
    
    # Ubuntu/Debian
    if command -v apt-get &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y certbot python3-certbot-nginx
    # CentOS/RHEL
    elif command -v yum &> /dev/null; then
        sudo yum install -y certbot python3-certbot-nginx
    fi
    
    log_info "certbot installed"
}

# Generate new certificate
generate_certificate() {
    local domain=$1
    local email=$2
    
    log_info "Generating certificate for ${domain}..."
    
    # Check if nginx is running (needed for HTTP challenge)
    if ! command -v nginx &> /dev/null || ! pgrep nginx > /dev/null; then
        log_warn "nginx not running, using standalone mode"
        
        certbot certonly --standalone \
            --agree-tos \
            --email "$email" \
            -d "$domain" \
            -d "www.$domain" \
            -d "api.$domain"
    else
        # Use nginx plugin
        certbot --nginx \
            --agree-tos \
            --redirect \
            --email "$email" \
            -d "$domain" \
            -d "www.$domain" \
            -d "api.$domain"
    fi
    
    log_info "Certificate generated successfully"
}

# Generate wildcard certificate
generate_wildcard_certificate() {
    local domain=$1
    local email=$2
    
    log_info "Generating wildcard certificate for *.${domain}..."
    
    # Wildcard requires DNS challenge
    certbot certonly \
        --manual \
        --preferred-challenges dns \
        --agree-tos \
        --email "$email" \
        -d "$domain" \
        -d "*.$domain"
    
    log_info "Wildcard certificate generated"
}

# Renew certificates
renew_certificates() {
    log_info "Renewing certificates..."
    
    # Renew all certificates
    certbot renew --quiet
    
    # Check if renewal happened
    if [ $? -eq 0 ]; then
        log_info "Certificates renewed successfully"
        
        # Reload nginx
        if pgrep nginx > /dev/null; then
            sudo nginx -t && sudo nginx -s reload
        fi
        
        # Reload Kubernetes ingress
        if command -v kubectl &> /dev/null; then
            kubectl rollout restart ingress -n "$K8S_NAMESPACE"
        fi
    else
        log_error "Certificate renewal failed"
        exit 1
    fi
}

# Check certificate expiry
check_expiry() {
    local domain=$1
    
    log_info "Checking certificate expiry for ${domain}..."
    
    if [ -d "$CERT_DIR" ]; then
        expiry=$(certbot certificates --cert-name "$domain" 2>/dev/null | grep "Expiry" | awk '{print $3, $4, $5, $6, $7}')
        log_info "Certificate expires: $expiry"
        
        # Get days until expiry
        days=$(openssl x509 -in "$CERT_DIR/fullchain.pem" -noout -days 2>/dev/null || echo "0")
        
        if [ "$days" -lt 30 ]; then
            log_warn "Certificate expires in $days days - consider renewing"
        fi
    else
        log_error "Certificate directory not found"
    fi
}

# Upload certificate to AWS ACM
upload_to_aws() {
    local domain=$1
    
    log_info "Uploading certificate to AWS ACM..."
    
    # Read certificate
    cert=$(cat "$CERT_DIR/fullchain.pem")
    key=$(cat "$CERT_DIR/privkey.pem")
    chain=$(cat "$CERT_DIR/chain.pem")
    
    # Upload to ACM
    aws acm import-certificate \
        --region "$AWS_REGION" \
        --certificate "file://$CERT_DIR/fullchain.pem" \
        --private-key "file://$CERT_DIR/privkey.pem" \
        --certificate-chain "file://$CERT_DIR/chain.pem" \
        --tags Key=Environment,Value=production Key=ManagedBy,Value=certbot
    
    log_info "Certificate uploaded to AWS ACM"
}

# Create Kubernetes secret
create_k8s_secret() {
    local domain=$1
    local namespace=${2:-$K8S_NAMESPACE}
    
    log_info "Creating Kubernetes TLS secret..."
    
    kubectl create secret tls "$domain-tls" \
        --cert="$CERT_DIR/fullchain.pem" \
        --key="$CERT_DIR/privkey.pem" \
        --namespace="$namespace" \
        --dry-run=client -o yaml | kubectl apply -f -
    
    log_info "Kubernetes TLS secret created"
}

# Update Kubernetes ingress
update_ingress() {
    local domain=$1
    local namespace=${2:-$K8S_NAMESPACE}
    
    log_info "Updating Kubernetes ingress..."
    
    # Patch ingress to use new certificate
    kubectl patch ingress "$domain-ingress" \
        --namespace="$namespace" \
        --type=json \
        -p='[{"op": "replace", "path": "/spec/tls/0/secretName", "value":"'"$domain-tls"'"}]'
    
    log_info "Ingress updated"
}

# Test SSL configuration
test_ssl() {
    local domain=$1
    
    log_info "Testing SSL configuration for ${domain}..."
    
    # Check SSL Labs grade
    echo "Testing SSL configuration..."
    
    # Basic TLS check
    result=$(curl -s -o /dev/null -w "%{http_code}" https://"$domain")
    
    if [ "$result" = "200" ]; then
        log_info "HTTPS is working (HTTP $result)"
    else
        log_error "HTTPS returned HTTP $result"
    fi
    
    # Check TLS version
    echo "Checking TLS versions..."
    echo | openssl s_client -connect "$domain:443" -tls1_2 2>/dev/null | grep "Protocol" || log_warn "TLS 1.2 may not be supported"
    echo | openssl s_client -connect "$domain:443" -tls1_3 2>/dev/null | grep "Protocol" || log_warn "TLS 1.3 may not be supported"
    
    # Check cipher suites
    echo "Checking cipher suites..."
    openssl ciphers -s -tls1_2 -v https://"$domain" 2>/dev/null | head -5
    
    log_info "SSL test complete"
}

# Setup automatic renewal
setup_auto_renewal() {
    log_info "Setting up automatic certificate renewal..."
    
    # Create cron job for renewal
    cron_job="0 0,12 * * * /usr/bin/certbot renew --quiet --post-hook 'nginx -s reload'"
    
    # Add to crontab
    (crontab -l 2>/dev/null | grep -v certbot; echo "$cron_job") | crontab -
    
    log_info "Auto-renewal setup complete"
}

# Main menu
show_menu() {
    echo "SSL/TLS Certificate Management"
    echo "==============================="
    echo "1. Generate new certificate"
    echo "2. Generate wildcard certificate"
    echo "3. Renew certificates"
    echo "4. Check certificate expiry"
    echo "5. Upload to AWS ACM"
    echo "6. Create Kubernetes secret"
    echo "7. Update Kubernetes ingress"
    echo "8. Test SSL configuration"
    echo "9. Setup auto-renewal"
    echo "0. Exit"
    echo ""
    echo -n "Select option: "
}

# Main
main() {
    check_prerequisites
    
    while true; do
        show_menu
        read -r choice
        
        case $choice in
            1) generate_certificate "$DOMAIN" "$EMAIL" ;;
            2) generate_wildcard_certificate "$DOMAIN" "$EMAIL" ;;
            3) renew_certificates ;;
            4) check_expiry "$DOMAIN" ;;
            5) upload_to_aws "$DOMAIN" ;;
            6) create_k8s_secret "$DOMAIN" ;;
            7) update_ingress "$DOMAIN" ;;
            8) test_ssl "$DOMAIN" ;;
            9) setup_auto_renewal ;;
            0) exit 0 ;;
            *) log_error "Invalid option" ;;
        esac
    done
}

# Run with arguments
if [ $# -gt 0 ]; then
    case $1 in
        generate) generate_certificate "${2:-$DOMAIN}" "${3:-$EMAIL}" ;;
        renew) renew_certificates ;;
        check) check_expiry "${2:-$DOMAIN}" ;;
        test) test_ssl "${2:-$DOMAIN}" ;;
        *) echo "Unknown command: $1" ;;
    esac
else
    main
fi
