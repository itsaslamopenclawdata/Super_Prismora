"""
Identity Event Publisher
Publishes identity-related events to Kafka
"""
from typing import Dict, Any, Optional
from datetime import datetime
import asyncio

from ..events.producers import UserEventProducer
from ..events.registry import EventMetadata, EventType
from .models import UserProfile, AppProfile, AppType


class IdentityEventPublisher:
    """
    Publishes user identity events to Kafka
    """
    
    def __init__(self, producer: UserEventProducer):
        self.producer = producer
    
    async def publish_profile_created(
        self,
        user_profile: UserProfile,
        source_app: AppType
    ) -> bool:
        """
        Publish profile created event
        
        Args:
            user_profile: User profile that was created
            source_app: App that created the profile
            
        Returns:
            True if published successfully
        """
        from uuid import uuid4
        
        metadata = EventMetadata(
            event_id=str(uuid4()),
            event_type=EventType.USER_CREATED,
            source_app=source_app.value,
            user_id=user_profile.user_id
        )
        
        payload = {
            "user_id": user_profile.user_id,
            "email": user_profile.email,
            "username": user_profile.username,
            "created_at": user_profile.created_at.isoformat(),
            "profile": {
                "first_name": user_profile.first_name,
                "last_name": user_profile.last_name,
                "display_name": user_profile.display_name,
                "avatar_url": user_profile.avatar_url,
                "language": user_profile.language,
                "timezone": user_profile.timezone
            },
            "source_app": source_app.value
        }
        
        return await self.producer.produce_event(
            EventType.USER_CREATED, payload, metadata, user_profile.user_id
        )
    
    async def publish_profile_synced(
        self,
        user_id: str,
        profile_data: Dict[str, Any],
        apps_involved: list[str],
        source_app: AppType
    ) -> bool:
        """
        Publish profile synced event
        
        Args:
            user_id: User ID
            profile_data: Profile data that was synced
            apps_involved: Apps that were synced
            source_app: App that initiated the sync
            
        Returns:
            True if published successfully
        """
        return await self.producer.publish_user_profile_sync(
            user_id=user_id,
            profile_data=profile_data,
            apps_involved=apps_involved,
            source_app=source_app.value
        )
    
    async def publish_profile_updated(
        self,
        user_id: str,
        changes: Dict[str, Any],
        source_app: AppType
    ) -> bool:
        """
        Publish profile updated event
        
        Args:
            user_id: User ID
            changes: Changes made to profile
            source_app: App that made the changes
            
        Returns:
            True if published successfully
        """
        from uuid import uuid4
        
        metadata = EventMetadata(
            event_id=str(uuid4()),
            event_type=EventType.USER_UPDATED,
            source_app=source_app.value,
            user_id=user_id
        )
        
        payload = {
            "user_id": user_id,
            "changes": changes,
            "updated_at": datetime.utcnow().isoformat(),
            "source_app": source_app.value
        }
        
        return await self.producer.produce_event(
            EventType.USER_UPDATED, payload, metadata, user_id
        )
    
    async def publish_app_profile_created(
        self,
        user_id: str,
        app_profile: AppProfile
    ) -> bool:
        """
        Publish app profile created event
        
        Args:
            user_id: User ID
            app_profile: App profile that was created
            
        Returns:
            True if published successfully
        """
        from uuid import uuid4
        
        metadata = EventMetadata(
            event_id=str(uuid4()),
            event_type=EventType.USER_PROFILE_SYNC,
            source_app=app_profile.app_type.value,
            user_id=user_id
        )
        
        payload = {
            "user_id": user_id,
            "app_type": app_profile.app_type.value,
            "app_user_id": app_profile.app_user_id,
            "created_at": app_profile.created_at.isoformat(),
            "preferences": app_profile.preferences,
            "metadata": app_profile.metadata
        }
        
        return await self.producer.produce_event(
            EventType.USER_PROFILE_SYNC, payload, metadata, user_id
        )
