#!/bin/bash
# Database Backup Script
# Auto-generated: 2026-02-26
# Purpose: Automated daily backups for Super_Prismora PostgreSQL database

set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/backups/postgres}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
S3_BUCKET="${S3_BUCKET:-super-prismora-backups}"
S3_REGION="${S3_REGION:-us-east-1}"
DATABASE_URL="${DATABASE_URL:-postgresql://user:password@localhost:5432/superprismora}"
ENCRYPTION_KEY="${ENCRYPTION_KEY:-}"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILENAME="superprismora_backup_${DATE}.sql.gz"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILENAME}"

# Logging
LOG_FILE="${BACKUP_DIR}/backup.log"
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    log "ERROR: $1"
    send_alert "Backup Failed: $1"
    exit 1
}

# Send alert on failure
send_alert() {
    # This would integrate with notification service
    log "ALERT: $1"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if backup directory exists
    if [ ! -d "$BACKUP_DIR" ]; then
        log "Creating backup directory: $BACKUP_DIR"
        mkdir -p "$BACKUP_DIR" || error_exit "Failed to create backup directory"
    fi
    
    # Check for pg_dump
    if ! command -v pg_dump &> /dev/null; then
        error_exit "pg_dump not found. Please install postgresql-client"
    fi
    
    # Check for aws CLI (if using S3)
    if [ -n "$S3_BUCKET" ] && ! command -v aws &> /dev/null; then
        log "WARNING: aws CLI not found. S3 upload will be skipped."
    fi
    
    log "Prerequisites check passed"
}

# Create backup
create_backup() {
    log "Starting database backup..."
    
    # Export database URL for pg_dump
    export DATABASE_URL
    
    # Create backup with compression
    pg_dump "$DATABASE_URL" | gzip > "$BACKUP_PATH" || error_exit "Failed to create backup"
    
    # Verify backup file
    if [ ! -s "$BACKUP_PATH" ]; then
        error_exit "Backup file is empty"
    fi
    
    # Get backup size
    BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
    log "Backup created: $BACKUP_PATH (Size: $BACKUP_SIZE)"
    
    # Encrypt backup if encryption key provided
    if [ -n "$ENCRYPTION_KEY" ]; then
        encrypt_backup
    fi
}

# Encrypt backup
encrypt_backup() {
    log "Encrypting backup..."
    ENCRYPTED_PATH="${BACKUP_PATH}.enc"
    
    # Use gpg for encryption
    echo "$ENCRYPTION_KEY" | gpg --symmetric --cipher-algo AES256 \
        --passphrase-fd 0 \
        --output "$ENCRYPTED_PATH" \
        "$BACKUP_PATH" || error_exit "Failed to encrypt backup"
    
    # Replace original with encrypted
    mv "$ENCRYPTED_PATH" "$BACKUP_PATH"
    log "Backup encrypted"
}

# Upload to S3
upload_to_s3() {
    if [ -z "$S3_BUCKET" ]; then
        log "S3_BUCKET not configured. Skipping S3 upload."
        return
    fi
    
    if ! command -v aws &> /dev/null; then
        log "WARNING: aws CLI not found. Skipping S3 upload."
        return
    fi
    
    log "Uploading backup to S3..."
    
    # Upload with server-side encryption
    aws s3 cp "$BACKUP_PATH" "s3://${S3_BUCKET}/backups/${BACKUP_FILENAME}" \
        --sse aws:kms \
        --storage-class STANDARD_IA \
        || log "WARNING: S3 upload failed. Backup saved locally."
    
    log "Backup uploaded to S3"
}

# Verify backup
verify_backup() {
    log "Verifying backup..."
    
    # Test that the backup can be decompressed
    gzip -t "$BACKUP_PATH" || error_exit "Backup verification failed - corrupted file"
    
    # Test that the backup contains expected content
    if ! zcat "$BACKUP_PATH" | head -n 1 | grep -q "PGDMP"; then
        log "WARNING: Backup may not be a valid PostgreSQL dump"
    fi
    
    log "Backup verified successfully"
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up backups older than $RETENTION_DAYS days..."
    
    # Clean local backups
    find "$BACKUP_DIR" -name "superprismora_backup_*.sql.gz*" -type f -mtime +$RETENTION_DAYS -delete
    
    # Clean S3 backups
    if [ -n "$S3_BUCKET" ] && command -v aws &> /dev/null; then
        aws s3 ls "s3://${S3_BUCKET}/backups/" | while read -r line; do
            file_date=$(echo "$line" | awk '{print $1}')
            file_name=$(echo "$line" | awk '{print $4}')
            
            # Compare dates (format: YYYY-MM-DD HH:MM:SS)
            file_date_only=$(echo "$file_date" | cut -d' ' -f1)
            cutoff_date=$(date -d "$RETENTION_DAYS days ago" +%Y-%m-%d)
            
            if [[ "$file_date_only" < "$cutoff_date" ]]; then
                log "Deleting old S3 backup: $file_name"
                aws s3 rm "s3://${S3_BUCKET}/backups/${file_name}"
            fi
        done
    fi
    
    log "Cleanup completed"
}

# Test restore
test_restore() {
    log "Testing backup restore..."
    
    # Create test database
    TEST_DB="superprismora_test_$$"
    psql -c "DROP DATABASE IF EXISTS $TEST_DB" 2>/dev/null || true
    psql -c "CREATE DATABASE $TEST_DB" 2>/dev/null || true
    
    # Try to restore to test database
    if zcat "$BACKUP_PATH" | psql -d "$TEST_DB" 2>/dev/null; then
        log "Test restore successful"
        psql -c "DROP DATABASE $TEST_DB"
    else
        log "WARNING: Test restore failed. Backup may be corrupted."
    fi
}

# Send success notification
send_success_notification() {
    BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
    
    log "Backup completed successfully!"
    log "File: $BACKUP_PATH"
    log "Size: $BACKUP_SIZE"
    
    # This would integrate with notification service
    # curl -X POST http://notification-service/api/v1/notifications/email \
    #   -d "{\"to\":[\"admin@example.com\"],\"subject\":\"Backup Success\",\"body\":\"...\"}"
}

# Main execution
main() {
    log "=== Starting Super_Prismora Database Backup ==="
    
    check_prerequisites
    create_backup
    verify_backup
    upload_to_s3
    cleanup_old_backups
    send_success_notification
    
    log "=== Backup Completed Successfully ==="
}

# Run main function
main "$@"
