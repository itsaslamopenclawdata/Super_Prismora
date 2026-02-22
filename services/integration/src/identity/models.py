"""
User Identity Models
"""
from typing import Dict, Any, Optional, List
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field


class AppType(str, Enum):
    """Supported application types"""
    WEB = "web"
    MARKETPLACE = "marketplace"
    BOOKING = "booking"
    GAMIFICATION = "gamification"


class UserProfile(BaseModel):
    """Unified user profile across all apps"""
    user_id: str = Field(..., description="Unified user identifier")
    email: str = Field(..., description="User email")
    username: str = Field(..., description="Username")
    
    # Personal Info
    first_name: Optional[str] = Field(None, description="First name")
    last_name: Optional[str] = Field(None, description="Last name")
    display_name: Optional[str] = Field(None, description="Display name")
    avatar_url: Optional[str] = Field(None, description="Avatar URL")
    bio: Optional[str] = Field(None, description="User bio")
    
    # Contact Info
    phone: Optional[str] = Field(None, description="Phone number")
    location: Optional[Dict[str, Any]] = Field(None, description="Location data")
    
    # Preferences
    language: str = Field(default="en", description="Preferred language")
    timezone: str = Field(default="UTC", description="Timezone")
    theme: str = Field(default="light", description="UI theme")
    notifications_enabled: bool = Field(default=True, description="Notifications enabled")
    
    # Privacy Settings
    profile_visibility: str = Field(default="public", description="Profile visibility")
    data_sharing_consent: bool = Field(default=False, description="Data sharing consent")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_sync_at: Optional[datetime] = Field(None, description="Last sync timestamp")
    
    # App-specific profiles
    app_profiles: Dict[AppType, 'AppProfile'] = Field(default_factory=dict, description="App-specific profiles")


class AppProfile(BaseModel):
    """App-specific profile data"""
    app_type: AppType = Field(..., description="Application type")
    app_user_id: str = Field(..., description="App-specific user ID")
    
    # App-specific data
    preferences: Dict[str, Any] = Field(default_factory=dict)
    settings: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    # Sync status
    is_synced: bool = Field(default=False, description="Is synced")
    last_synced_at: Optional[datetime] = Field(None, description="Last synced at")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class SyncStatus(str, Enum):
    """Synchronization status"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    PARTIAL = "partial"


class SyncOperation(BaseModel):
    """Profile sync operation record"""
    operation_id: str = Field(..., description="Operation ID")
    user_id: str = Field(..., description="User ID")
    
    status: SyncStatus = Field(default=SyncStatus.PENDING)
    initiated_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = Field(None)
    
    target_apps: List[AppType] = Field(default_factory=list)
    completed_apps: List[AppType] = Field(default_factory=list)
    failed_apps: List[tuple[AppType, str]] = Field(default_factory=list)  # (app, error_message)
    
    changes: Dict[str, Any] = Field(default_factory=dict, description="Changes made")
    
    def add_completion(self, app: AppType):
        """Mark an app as completed"""
        if app not in self.completed_apps:
            self.completed_apps.append(app)
        
        if len(self.completed_apps) + len(self.failed_apps) >= len(self.target_apps):
            self.status = SyncStatus.COMPLETED if not self.failed_apps else SyncStatus.PARTIAL
            self.completed_at = datetime.utcnow()
    
    def add_failure(self, app: AppType, error: str):
        """Mark an app as failed"""
        if app not in [a[0] for a in self.failed_apps]:
            self.failed_apps.append((app, error))
        
        if len(self.completed_apps) + len(self.failed_apps) >= len(self.target_apps):
            self.status = SyncStatus.FAILED if not self.completed_apps else SyncStatus.PARTIAL
            self.completed_at = datetime.utcnow()


class ProfileChange(BaseModel):
    """Record of profile change"""
    field_name: str = Field(..., description="Field name")
    old_value: Any = Field(None, description="Old value")
    new_value: Any = Field(None, description="New value")
    changed_at: datetime = Field(default_factory=datetime.utcnow)
    source_app: AppType = Field(..., description="Source app")
