"""
Data Export Models for GDPR/CCPA compliance
"""
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from enum import Enum
from pydantic import BaseModel, Field


class Jurisdiction(str, Enum):
    """Data protection jurisdiction"""
    GDPR = "GDPR"  # European Union
    CCPA = "CCPA"  # California Consumer Privacy Act
    PIPEDA = "PIPEDA"  # Canada


class DataType(str, Enum):
    """Types of data that can be exported"""
    PROFILE = "profile"  # User profile information
    PHOTOS = "photos"  # Photo uploads and metadata
    PURCHASES = "purchases"  # Marketplace purchases
    BOOKINGS = "bookings"  # Booking history
    ACTIVITY = "activity"  # User activity logs
    PREFERENCES = "preferences"  # User preferences and settings
    ACHIEVEMENTS = "achievements"  # Gamification achievements
    POINTS = "points"  # Points transactions
    NOTIFICATIONS = "notifications"  # Notification history
    ALL = "all"  # All of the above


class DataExportStatus(str, Enum):
    """Status of a data export request"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    EXPIRED = "expired"


class DataExportFormat(str, Enum):
    """Format for exported data"""
    JSON = "json"
    CSV = "csv"
    PDF = "pdf"


class DataExportRequest(BaseModel):
    """Data export request"""
    request_id: str = Field(..., description="Unique request identifier")
    user_id: str = Field(..., description="User requesting export")
    
    # Data types to export
    data_types: List[DataType] = Field(..., description="Types of data to export")
    
    # Export settings
    format: DataExportFormat = Field(default=DataExportFormat.JSON, description="Export format")
    jurisdiction: Jurisdiction = Field(..., description="Legal jurisdiction")
    
    # Dates
    requested_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime = Field(default_factory=lambda: datetime.utcnow() + timedelta(days=30))
    
    # Status
    status: DataExportStatus = Field(default=DataExportStatus.PENDING)
    
    # Processing info
    processed_at: Optional[datetime] = Field(None, description="When processing started")
    completed_at: Optional[datetime] = Field(None, description="When processing completed")
    
    # Result
    export_url: Optional[str] = Field(None, description="URL to download export")
    file_size_bytes: Optional[int] = Field(None, description="Size of export file")
    record_count: Optional[int] = Field(None, description="Number of records exported")
    
    # Error handling
    error_message: Optional[str] = Field(None, description="Error message if failed")
    
    # Verification
    verification_code: Optional[str] = Field(None, description="Code for verification")
    verified_at: Optional[datetime] = Field(None, description="When export was verified")
    
    # Metadata
    metadata: Dict[str, Any] = Field(default_factory=dict)


class DataExportResponse(BaseModel):
    """Data export response"""
    request_id: str = Field(..., description="Request ID")
    user_id: str = Field(..., description="User ID")
    
    # Export data
    data: Dict[str, Any] = Field(..., description="Exported data by type")
    
    # Summary
    summary: Dict[str, Any] = Field(default_factory=dict, description="Export summary")
    
    # Metadata
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    format: DataExportFormat = Field(default=DataExportFormat.JSON)
    
    # Record counts
    record_counts: Dict[DataType, int] = Field(default_factory=dict)


class DataDeletionRequest(BaseModel):
    """Data deletion request (Right to be Forgotten)"""
    request_id: str = Field(..., description="Unique request identifier")
    user_id: str = Field(..., description="User requesting deletion")
    
    # Data types to delete
    data_types: List[DataType] = Field(..., description="Types of data to delete")
    
    # Legal info
    jurisdiction: Jurisdiction = Field(..., description="Legal jurisdiction")
    reason: Optional[str] = Field(None, description="Reason for deletion")
    
    # Dates
    requested_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Status
    status: DataExportStatus = Field(default=DataExportStatus.PENDING)
    
    # Processing info
    processed_at: Optional[datetime] = Field(None)
    completed_at: Optional[datetime] = Field(None)
    
    # Results
    deleted_record_count: int = Field(default=0, description="Number of records deleted")
    apps_notified: List[str] = Field(default_factory=list, description="Apps notified of deletion")
    
    # Error handling
    error_message: Optional[str] = Field(None, description="Error message if failed")


class ConsentRecord(BaseModel):
    """User consent record"""
    consent_id: str = Field(..., description="Consent ID")
    user_id: str = Field(..., description="User ID")
    
    # Consent type
    consent_type: str = Field(..., description="Type of consent: data_processing, marketing, analytics")
    
    # Consent given
    is_granted: bool = Field(..., description="Whether consent is granted")
    
    # Details
    purpose: str = Field(..., description="Purpose of data processing")
    data_types: List[str] = Field(default_factory=list, description="Data types covered")
    third_parties: List[str] = Field(default_factory=list, description="Third parties involved")
    
    # Jurisdiction
    jurisdiction: Jurisdiction = Field(..., description="Legal jurisdiction")
    
    # Timestamps
    granted_at: Optional[datetime] = Field(None, description="When consent was granted")
    revoked_at: Optional[datetime] = Field(None, description="When consent was revoked")
    expires_at: Optional[datetime] = Field(None, description="When consent expires")
    
    # Documentation
    policy_version: str = Field(..., description="Privacy policy version at time of consent")
    ip_address: Optional[str] = Field(None, description="IP address at time of consent")
    user_agent: Optional[str] = Field(None, description="User agent at time of consent")
    
    # Metadata
    metadata: Dict[str, Any] = Field(default_factory=dict)


class DataProcessingRecord(BaseModel):
    """Record of data processing activity"""
    record_id: str = Field(..., description="Record ID")
    user_id: str = Field(..., description="User ID")
    
    # Processing details
    processing_type: str = Field(..., description="Type of processing")
    purpose: str = Field(..., description="Purpose of processing")
    data_categories: List[str] = Field(default_factory=list, description="Categories of data processed")
    
    # Legal basis
    legal_basis: str = Field(..., description="Legal basis for processing")
    consent_id: Optional[str] = Field(None, description="Consent ID if consent-based")
    
    # Source and destination
    data_source: str = Field(..., description="Where data came from")
    data_destinations: List[str] = Field(default_factory=list, description="Where data was sent")
    
    # Third parties
    third_parties: List[str] = Field(default_factory=list, description="Third parties involved")
    
    # Dates
    processed_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Metadata
    metadata: Dict[str, Any] = Field(default_factory=dict)
