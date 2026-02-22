"""
Profile Mapper
Maps user profiles between different apps
"""
from typing import Dict, Any, Optional, List
from .models import UserProfile, AppProfile, AppType


class ProfileMapper:
    """
    Maps user profile data between different application formats
    """
    
    # Field mapping rules for each app type
    FIELD_MAPPINGS: Dict[AppType, Dict[str, str]] = {
        AppType.WEB: {
            "first_name": "firstName",
            "last_name": "lastName",
            "display_name": "displayName",
            "avatar_url": "avatarUrl",
            "phone": "phoneNumber",
        },
        AppType.MARKETPLACE: {
            "first_name": "first_name",
            "last_name": "last_name",
            "display_name": "shop_name",
            "avatar_url": "shop_logo",
            "bio": "shop_description",
            "location": "business_location",
        },
        AppType.BOOKING: {
            "first_name": "guest_first_name",
            "last_name": "guest_last_name",
            "display_name": "guest_name",
            "phone": "contact_phone",
            "location": "preferred_location",
        },
        AppType.GAMIFICATION: {
            "first_name": "player_first_name",
            "last_name": "player_last_name",
            "display_name": "gamertag",
            "avatar_url": "player_avatar",
            "bio": "player_bio",
        },
    }
    
    # Default values for each app type
    DEFAULT_VALUES: Dict[AppType, Dict[str, Any]] = {
        AppType.WEB: {
            "notifications_enabled": True,
            "theme": "light",
        },
        AppType.MARKETPLACE: {
            "seller_rating": 0.0,
            "total_sales": 0,
        },
        AppType.BOOKING: {
            "loyalty_points": 0,
            "membership_tier": "basic",
        },
        AppType.GAMIFICATION: {
            "level": 1,
            "xp": 0,
        },
    }
    
    def __init__(self):
        self._reverse_mappings: Dict[AppType, Dict[str, str]] = {}
        self._build_reverse_mappings()
    
    def _build_reverse_mappings(self):
        """Build reverse mappings for each app type"""
        for app_type, mappings in self.FIELD_MAPPINGS.items():
            self._reverse_mappings[app_type] = {
                app_field: unified_field
                for unified_field, app_field in mappings.items()
            }
    
    def to_app_profile(
        self,
        user_profile: UserProfile,
        app_type: AppType,
        app_user_id: str
    ) -> AppProfile:
        """
        Convert unified profile to app-specific profile
        
        Args:
            user_profile: Unified user profile
            app_type: Target app type
            app_user_id: App-specific user ID
            
        Returns:
            AppProfile for the target app
        """
        field_mapping = self.FIELD_MAPPINGS.get(app_type, {})
        default_values = self.DEFAULT_VALUES.get(app_type, {})
        
        # Map fields
        app_data: Dict[str, Any] = default_values.copy()
        
        for unified_field, app_field in field_mapping.items():
            value = getattr(user_profile, unified_field, None)
            if value is not None:
                app_data[app_field] = value
        
        # Add common fields
        app_data["user_id"] = user_profile.user_id
        app_data["email"] = user_profile.email
        app_data["username"] = user_profile.username
        
        return AppProfile(
            app_type=app_type,
            app_user_id=app_user_id,
            preferences=app_data,
            metadata={
                "mapped_at": user_profile.updated_at.isoformat(),
                "mapped_from": "unified_profile"
            }
        )
    
    def from_app_profile(
        self,
        app_profile: AppProfile,
        user_profile: UserProfile
    ) -> Dict[str, Any]:
        """
        Convert app-specific profile back to unified profile
        
        Args:
            app_profile: App-specific profile
            user_profile: Current unified profile (to merge with)
            
        Returns:
            Dict of fields to update in unified profile
        """
        reverse_mapping = self._reverse_mappings.get(app_profile.app_type, {})
        updates: Dict[str, Any] = {}
        
        # Map app fields back to unified fields
        for app_field, unified_field in reverse_mapping.items():
            if app_field in app_profile.preferences:
                updates[unified_field] = app_profile.preferences[app_field]
        
        return updates
    
    def merge_profiles(
        self,
        base_profile: UserProfile,
        updates: Dict[str, Any],
        source_app: AppType
    ) -> UserProfile:
        """
        Merge updates into base profile
        
        Args:
            base_profile: Base profile to update
            updates: Fields to update
            source_app: Source of the updates
            
        Returns:
            Updated profile
        """
        profile_data = base_profile.model_dump()
        
        for field, value in updates.items():
            if value is not None and hasattr(base_profile, field):
                profile_data[field] = value
        
        profile_data["updated_at"] = base_profile.updated_at
        profile_data["last_sync_at"] = None  # Will be set after sync
        
        return UserProfile(**profile_data)
    
    def compute_changes(
        self,
        old_profile: UserProfile,
        new_profile: UserProfile,
        source_app: AppType
    ) -> Dict[str, Any]:
        """
        Compute changes between two profiles
        
        Args:
            old_profile: Old profile
            new_profile: New profile
            source_app: Source of changes
            
        Returns:
            Dict of changes
        """
        changes: Dict[str, Any] = {}
        
        for field in old_profile.model_fields:
            old_value = getattr(old_profile, field, None)
            new_value = getattr(new_profile, field, None)
            
            if old_value != new_value:
                changes[field] = {
                    "old": old_value,
                    "new": new_value
                }
        
        return changes
    
    def validate_app_profile(self, app_profile: AppProfile) -> List[str]:
        """
        Validate an app profile
        
        Args:
            app_profile: App profile to validate
            
        Returns:
            List of validation errors (empty if valid)
        """
        errors = []
        
        # Validate required fields
        if not app_profile.app_user_id:
            errors.append("app_user_id is required")
        
        # Validate app type has a mapping
        if app_profile.app_type not in self.FIELD_MAPPINGS:
            errors.append(f"Unsupported app type: {app_profile.app_type}")
        
        return errors
    
    def get_supported_apps(self) -> List[AppType]:
        """Get list of supported app types"""
        return list(self.FIELD_MAPPINGS.keys())
    
    def get_field_mapping(self, app_type: AppType) -> Dict[str, str]:
        """Get field mapping for an app type"""
        return self.FIELD_MAPPINGS.get(app_type, {})
