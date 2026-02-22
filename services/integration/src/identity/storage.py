"""
Profile Storage
Handles storage and retrieval of user profiles
"""
from typing import Dict, Any, Optional, List
from datetime import datetime
import json
import os


class ProfileStorage:
    """
    Storage backend for user profiles
    Uses file-based storage (can be replaced with database)
    """
    
    def __init__(self, storage_dir: str = "./profiles"):
        self.storage_dir = storage_dir
        os.makedirs(storage_dir, exist_ok=True)
    
    def _get_profile_path(self, user_id: str) -> str:
        """Get file path for a user profile"""
        return os.path.join(self.storage_dir, f"{user_id}.json")
    
    async def save_profile(self, user_id: str, profile: Dict[str, Any]) -> bool:
        """
        Save user profile to storage
        
        Args:
            user_id: User ID
            profile: Profile data to save
            
        Returns:
            True if saved successfully
        """
        try:
            path = self._get_profile_path(user_id)
            profile["saved_at"] = datetime.utcnow().isoformat()
            
            with open(path, 'w') as f:
                json.dump(profile, f, indent=2, default=str)
            
            return True
        except Exception as e:
            print(f"Error saving profile: {e}")
            return False
    
    async def load_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Load user profile from storage
        
        Args:
            user_id: User ID
            
        Returns:
            Profile data or None if not found
        """
        try:
            path = self._get_profile_path(user_id)
            
            if not os.path.exists(path):
                return None
            
            with open(path, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading profile: {e}")
            return None
    
    async def delete_profile(self, user_id: str) -> bool:
        """
        Delete user profile from storage
        
        Args:
            user_id: User ID
            
        Returns:
            True if deleted successfully
        """
        try:
            path = self._get_profile_path(user_id)
            
            if os.path.exists(path):
                os.remove(path)
                return True
            
            return False
        except Exception as e:
            print(f"Error deleting profile: {e}")
            return False
    
    async def list_profiles(self) -> List[str]:
        """
        List all profile IDs
        
        Returns:
            List of user IDs
        """
        try:
            profiles = []
            for filename in os.listdir(self.storage_dir):
                if filename.endswith('.json'):
                    user_id = filename[:-5]  # Remove .json
                    profiles.append(user_id)
            
            return profiles
        except Exception as e:
            print(f"Error listing profiles: {e}")
            return []
    
    async def save_sync_operation(
        self,
        operation_id: str,
        operation_data: Dict[str, Any]
    ) -> bool:
        """
        Save sync operation record
        
        Args:
            operation_id: Operation ID
            operation_data: Operation data
            
        Returns:
            True if saved successfully
        """
        try:
            sync_dir = os.path.join(self.storage_dir, "sync_operations")
            os.makedirs(sync_dir, exist_ok=True)
            
            path = os.path.join(sync_dir, f"{operation_id}.json")
            
            with open(path, 'w') as f:
                json.dump(operation_data, f, indent=2, default=str)
            
            return True
        except Exception as e:
            print(f"Error saving sync operation: {e}")
            return False
    
    async def load_sync_operation(
        self,
        operation_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Load sync operation record
        
        Args:
            operation_id: Operation ID
            
        Returns:
            Operation data or None if not found
        """
        try:
            sync_dir = os.path.join(self.storage_dir, "sync_operations")
            path = os.path.join(sync_dir, f"{operation_id}.json")
            
            if not os.path.exists(path):
                return None
            
            with open(path, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading sync operation: {e}")
            return None
    
    async def list_sync_operations(self, user_id: str) -> List[Dict[str, Any]]:
        """
        List sync operations for a user
        
        Args:
            user_id: User ID
            
        Returns:
            List of sync operations
        """
        try:
            sync_dir = os.path.join(self.storage_dir, "sync_operations")
            operations = []
            
            if not os.path.exists(sync_dir):
                return operations
            
            for filename in os.listdir(sync_dir):
                if filename.endswith('.json'):
                    path = os.path.join(sync_dir, filename)
                    with open(path, 'r') as f:
                        op_data = json.load(f)
                        if op_data.get("user_id") == user_id:
                            operations.append(op_data)
            
            return operations
        except Exception as e:
            print(f"Error listing sync operations: {e}")
            return []
