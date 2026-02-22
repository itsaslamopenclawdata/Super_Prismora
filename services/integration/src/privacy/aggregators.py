"""
User Data Aggregator
Aggregates user data from all apps for export
"""
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta

from .models import DataType


class UserDataAggregator:
    """
    Aggregates user data from all apps for GDPR/CCPA export
    """
    
    def __init__(self):
        # In production, these would connect to actual databases and APIs
        self._data_sources: Dict[str, Any] = {}
    
    async def aggregate_user_data(
        self,
        user_id: str,
        data_types: List[DataType]
    ) -> Dict[str, Any]:
        """
        Aggregate user data from all specified types
        
        Args:
            user_id: User ID
            data_types: Types of data to aggregate
            
        Returns:
            Dictionary with aggregated data by type
        """
        aggregated_data = {}
        
        for data_type in data_types:
            if data_type == DataType.ALL:
                # Aggregate all data types
                all_types = [
                    DataType.PROFILE, DataType.PHOTOS, DataType.PURCHASES,
                    DataType.BOOKINGS, DataType.ACTIVITY, DataType.PREFERENCES,
                    DataType.ACHIEVEMENTS, DataType.POINTS, DataType.NOTIFICATIONS
                ]
                for dt in all_types:
                    aggregated_data[dt.value] = await self._aggregate_data_type(user_id, dt)
            else:
                aggregated_data[data_type.value] = await self._aggregate_data_type(
                    user_id,
                    data_type
                )
        
        return aggregated_data
    
    async def _aggregate_data_type(
        self,
        user_id: str,
        data_type: DataType
    ) -> Dict[str, Any]:
        """Aggregate data for a specific type"""
        
        if data_type == DataType.PROFILE:
            return await self._get_profile_data(user_id)
        elif data_type == DataType.PHOTOS:
            return await self._get_photos_data(user_id)
        elif data_type == DataType.PURCHASES:
            return await self._get_purchases_data(user_id)
        elif data_type == DataType.BOOKINGS:
            return await self._get_bookings_data(user_id)
        elif data_type == DataType.ACTIVITY:
            return await self._get_activity_data(user_id)
        elif data_type == DataType.PREFERENCES:
            return await self._get_preferences_data(user_id)
        elif data_type == DataType.ACHIEVEMENTS:
            return await self._get_achievements_data(user_id)
        elif data_type == DataType.POINTS:
            return await self._get_points_data(user_id)
        elif data_type == DataType.NOTIFICATIONS:
            return await self._get_notifications_data(user_id)
        else:
            return {"error": f"Unknown data type: {data_type}"}
    
    async def _get_profile_data(self, user_id: str) -> Dict[str, Any]:
        """Get user profile data"""
        # Simulated data - in production, query user profile database
        return {
            "user_id": user_id,
            "email": f"{user_id}@example.com",
            "username": user_id,
            "first_name": "John",
            "last_name": "Doe",
            "display_name": "John Doe",
            "avatar_url": f"/avatars/{user_id}.jpg",
            "phone": "+1-555-0123",
            "location": {
                "country": "United States",
                "state": "California",
                "city": "San Francisco"
            },
            "language": "en",
            "timezone": "America/Los_Angeles",
            "created_at": "2024-01-15T10:30:00Z",
            "updated_at": datetime.utcnow().isoformat(),
            "last_login": datetime.utcnow().isoformat()
        }
    
    async def _get_photos_data(self, user_id: str) -> Dict[str, Any]:
        """Get user photo data"""
        # Simulated data
        return {
            "total_photos": 42,
            "photos": [
                {
                    "photo_id": f"photo_{i}_{user_id}",
                    "filename": f"photo_{i}.jpg",
                    "upload_date": (datetime.utcnow() - timedelta(days=i)).isoformat(),
                    "file_size_bytes": 1024 * 512,
                    "mime_type": "image/jpeg",
                    "tags": ["nature", "outdoor"],
                    "is_public": True
                }
                for i in range(5)  # Show first 5 as example
            ],
            "total_size_bytes": 42 * 1024 * 512
        }
    
    async def _get_purchases_data(self, user_id: str) -> Dict[str, Any]:
        """Get user purchase data"""
        # Simulated data
        return {
            "total_purchases": 15,
            "total_spent": 349.97,
            "purchases": [
                {
                    "purchase_id": f"purchase_{i}_{user_id}",
                    "item_id": f"item_{i}",
                    "item_name": f"Product {i}",
                    "price": 29.99,
                    "purchase_date": (datetime.utcnow() - timedelta(days=i*7)).isoformat(),
                    "status": "completed",
                    "payment_method": "credit_card"
                }
                for i in range(3)
            ]
        }
    
    async def _get_bookings_data(self, user_id: str) -> Dict[str, Any]:
        """Get user booking data"""
        # Simulated data
        return {
            "total_bookings": 8,
            "bookings": [
                {
                    "booking_id": f"booking_{i}_{user_id}",
                    "service_id": f"service_{i}",
                    "service_name": "Photo Session",
                    "booking_date": (datetime.utcnow() + timedelta(days=i*14)).isoformat(),
                    "status": "confirmed",
                    "price": 99.99,
                    "duration_minutes": 60
                }
                for i in range(2)
            ]
        }
    
    async def _get_activity_data(self, user_id: str) -> Dict[str, Any]:
        """Get user activity data"""
        # Simulated data
        return {
            "total_activities": 156,
            "activities": [
                {
                    "activity_id": f"activity_{i}_{user_id}",
                    "action": "page_view",
                    "page": "/photos",
                    "timestamp": (datetime.utcnow() - timedelta(hours=i)).isoformat(),
                    "user_agent": "Mozilla/5.0",
                    "ip_address": "192.168.1.1"
                }
                for i in range(5)
            ]
        }
    
    async def _get_preferences_data(self, user_id: str) -> Dict[str, Any]:
        """Get user preferences data"""
        # Simulated data
        return {
            "notification_preferences": {
                "email_enabled": True,
                "push_enabled": True,
                "marketing_emails": False
            },
            "display_preferences": {
                "theme": "light",
                "language": "en",
                "timezone": "America/Los_Angeles"
            },
            "privacy_preferences": {
                "profile_visibility": "public",
                "data_sharing_consent": True,
                "analytics_consent": True
            }
        }
    
    async def _get_achievements_data(self, user_id: str) -> Dict[str, Any]:
        """Get user achievements data"""
        # Simulated data
        return {
            "total_achievements": 12,
            "achievements": [
                {
                    "achievement_id": f"achievement_{i}",
                    "name": f"Achievement {i}",
                    "description": f"Description for achievement {i}",
                    "unlocked_at": (datetime.utcnow() - timedelta(days=i*10)).isoformat(),
                    "points_awarded": 50,
                    "tier": "gold" if i < 2 else "silver" if i < 5 else "bronze"
                }
                for i in range(3)
            ]
        }
    
    async def _get_points_data(self, user_id: str) -> Dict[str, Any]:
        """Get user points data"""
        # Simulated data
        return {
            "total_points": 1250,
            "available_points": 950,
            "redeemed_points": 300,
            "transactions": [
                {
                    "transaction_id": f"txn_{i}_{user_id}",
                    "points": 50 if i % 2 == 0 else -10,
                    "source": "achievement" if i % 2 == 0 else "redemption",
                    "reason": f"Transaction {i}",
                    "timestamp": (datetime.utcnow() - timedelta(days=i)).isoformat()
                }
                for i in range(5)
            ]
        }
    
    async def _get_notifications_data(self, user_id: str) -> Dict[str, Any]:
        """Get user notifications data"""
        # Simulated data
        return {
            "total_notifications": 89,
            "notifications": [
                {
                    "notification_id": f"notif_{i}_{user_id}",
                    "type": "achievement" if i % 2 == 0 else "system",
                    "title": f"Notification {i}",
                    "message": f"This is notification message {i}",
                    "sent_at": (datetime.utcnow() - timedelta(hours=i*6)).isoformat(),
                    "read": i % 3 != 0
                }
                for i in range(3)
            ]
        }
    
    def get_record_count(self, data: Dict[str, Any]) -> int:
        """Count the number of records in aggregated data"""
        count = 0
        for key, value in data.items():
            if isinstance(value, list):
                count += len(value)
            elif isinstance(value, dict):
                count += self.get_record_count(value)
        return count
