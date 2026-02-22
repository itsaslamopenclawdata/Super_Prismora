"""
User Profile Synchronization Service
Orchestrates profile synchronization across apps
"""
from typing import Dict, Any, Optional, List, Callable
from datetime import datetime
import asyncio
from uuid import uuid4

from .models import UserProfile, AppProfile, AppType, SyncOperation, SyncStatus
from .mapper import ProfileMapper
from .storage import ProfileStorage
from .events import IdentityEventPublisher


class UserProfileSyncService:
    """
    Main service for synchronizing user profiles across all apps
    """
    
    def __init__(
        self,
        storage: ProfileStorage,
        event_publisher: IdentityEventPublisher,
        mapper: Optional[ProfileMapper] = None
    ):
        self.storage = storage
        self.event_publisher = event_publisher
        self.mapper = mapper or ProfileMapper()
        self._active_syncs: Dict[str, SyncOperation] = {}
    
    async def create_profile(
        self,
        user_id: str,
        email: str,
        username: str,
        source_app: AppType,
        **kwargs
    ) -> UserProfile:
        """
        Create a new unified user profile
        
        Args:
            user_id: User ID
            email: User email
            username: Username
            source_app: App that created the profile
            **kwargs: Additional profile fields
            
        Returns:
            Created UserProfile
        """
        profile = UserProfile(
            user_id=user_id,
            email=email,
            username=username,
            **kwargs
        )
        
        # Save to storage
        await self.storage.save_profile(user_id, profile.model_dump())
        
        # Publish event
        await self.event_publisher.publish_profile_created(profile, source_app)
        
        return profile
    
    async def get_profile(self, user_id: str) -> Optional[UserProfile]:
        """
        Get user profile by ID
        
        Args:
            user_id: User ID
            
        Returns:
            UserProfile or None if not found
        """
        profile_data = await self.storage.load_profile(user_id)
        if profile_data:
            return UserProfile(**profile_data)
        return None
    
    async def update_profile(
        self,
        user_id: str,
        updates: Dict[str, Any],
        source_app: AppType
    ) -> Optional[UserProfile]:
        """
        Update user profile
        
        Args:
            user_id: User ID
            updates: Fields to update
            source_app: App making the update
            
        Returns:
            Updated UserProfile or None if not found
        """
        # Load existing profile
        profile_data = await self.storage.load_profile(user_id)
        if not profile_data:
            return None
        
        old_profile = UserProfile(**profile_data)
        
        # Apply updates
        for field, value in updates.items():
            if hasattr(old_profile, field):
                setattr(old_profile, field, value)
        
        old_profile.updated_at = datetime.utcnow()
        
        # Save updated profile
        await self.storage.save_profile(user_id, old_profile.model_dump())
        
        # Publish update event
        changes = self.mapper.compute_changes(
            UserProfile(**profile_data),
            old_profile,
            source_app
        )
        await self.event_publisher.publish_profile_updated(user_id, changes, source_app)
        
        return old_profile
    
    async def sync_profile(
        self,
        user_id: str,
        target_apps: Optional[List[AppType]] = None,
        source_app: AppType = AppType.WEB
    ) -> SyncOperation:
        """
        Synchronize user profile to target apps
        
        Args:
            user_id: User ID
            target_apps: Apps to sync to (all if None)
            source_app: App initiating the sync
            
        Returns:
            SyncOperation with results
        """
        # Get user profile
        profile = await self.get_profile(user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")
        
        # Determine target apps
        if target_apps is None:
            target_apps = self.mapper.get_supported_apps()
        
        # Create sync operation
        operation = SyncOperation(
            operation_id=str(uuid4()),
            user_id=user_id,
            target_apps=target_apps
        )
        operation.status = SyncStatus.IN_PROGRESS
        self._active_syncs[operation.operation_id] = operation
        
        # Save operation record
        await self.storage.save_sync_operation(
            operation.operation_id,
            operation.model_dump()
        )
        
        # Sync to each app
        tasks = []
        for app_type in target_apps:
            task = self._sync_to_app(profile, app_type, operation)
            tasks.append(task)
        
        await asyncio.gather(*tasks, return_exceptions=True)
        
        # Finalize sync operation
        operation.status = (
            SyncStatus.COMPLETED if not operation.failed_apps
            else SyncStatus.PARTIAL if operation.completed_apps
            else SyncStatus.FAILED
        )
        operation.completed_at = datetime.utcnow()
        
        # Save updated operation
        await self.storage.save_sync_operation(
            operation.operation_id,
            operation.model_dump()
        )
        
        # Publish sync event
        apps_involved = [app.value for app in target_apps]
        profile_data = {
            "user_id": user_id,
            "email": profile.email,
            "username": profile.username,
            "synced_at": datetime.utcnow().isoformat()
        }
        await self.event_publisher.publish_profile_synced(
            user_id, profile_data, apps_involved, source_app
        )
        
        # Update last_sync_at on profile
        profile.last_sync_at = datetime.utcnow()
        await self.storage.save_profile(user_id, profile.model_dump())
        
        # Remove from active syncs
        self._active_syncs.pop(operation.operation_id, None)
        
        return operation
    
    async def _sync_to_app(
        self,
        profile: UserProfile,
        app_type: AppType,
        operation: SyncOperation
    ) -> bool:
        """
        Sync profile to a specific app
        
        Args:
            profile: User profile
            app_type: Target app type
            operation: Sync operation to update
            
        Returns:
            True if sync succeeded
        """
        try:
            # Create app profile
            app_profile = self.mapper.to_app_profile(
                profile,
                app_type,
                f"{profile.user_id}_{app_type.value}"
            )
            
            # In a real implementation, this would call the app's API
            # For now, we simulate success
            await asyncio.sleep(0.1)  # Simulate API call
            
            # Add to user's app profiles
            profile.app_profiles[app_type] = app_profile
            
            # Update operation
            operation.add_completion(app_type)
            
            # Publish event
            await self.event_publisher.publish_app_profile_created(
                profile.user_id, app_profile
            )
            
            return True
            
        except Exception as e:
            operation.add_failure(app_type, str(e))
            return False
    
    async def sync_from_app(
        self,
        user_id: str,
        app_type: AppType,
        app_user_id: str,
        app_data: Dict[str, Any]
    ) -> Optional[UserProfile]:
        """
        Sync profile data from an app to unified profile
        
        Args:
            user_id: User ID
            app_type: Source app type
            app_user_id: App-specific user ID
            app_data: App-specific data
            
        Returns:
            Updated UserProfile
        """
        # Create app profile
        app_profile = AppProfile(
            app_type=app_type,
            app_user_id=app_user_id,
            preferences=app_data
        )
        
        # Get unified profile
        profile = await self.get_profile(user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")
        
        # Map app profile to unified profile updates
        updates = self.mapper.from_app_profile(app_profile, profile)
        
        # Merge updates
        profile = self.mapper.merge_profiles(profile, updates, app_type)
        profile.app_profiles[app_type] = app_profile
        profile.last_sync_at = datetime.utcnow()
        
        # Save
        await self.storage.save_profile(user_id, profile.model_dump())
        
        return profile
    
    async def get_sync_status(self, operation_id: str) -> Optional[SyncOperation]:
        """
        Get status of a sync operation
        
        Args:
            operation_id: Operation ID
            
        Returns:
            SyncOperation or None if not found
        """
        # Check active syncs first
        if operation_id in self._active_syncs:
            return self._active_syncs[operation_id]
        
        # Load from storage
        op_data = await self.storage.load_sync_operation(operation_id)
        if op_data:
            return SyncOperation(**op_data)
        
        return None
    
    async def list_user_syncs(self, user_id: str) -> List[SyncOperation]:
        """
        List all sync operations for a user
        
        Args:
            user_id: User ID
            
        Returns:
            List of sync operations
        """
        ops_data = await self.storage.list_sync_operations(user_id)
        return [SyncOperation(**op) for op in ops_data]
    
    async def delete_profile(self, user_id: str) -> bool:
        """
        Delete user profile
        
        Args:
            user_id: User ID
            
        Returns:
            True if deleted successfully
        """
        return await self.storage.delete_profile(user_id)
