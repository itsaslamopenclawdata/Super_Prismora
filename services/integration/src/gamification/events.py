"""
Gamification Event Publisher
Publishes gamification events to Kafka
"""
from typing import Dict, Any
from datetime import datetime

from ..events.producers import GamificationEventProducer
from ..events.registry import EventMetadata, EventType
from .models import Achievement, UserStats, Challenge


class GamificationEventPublisher:
    """
    Publishes gamification events to Kafka
    """
    
    def __init__(self, producer: GamificationEventProducer):
        self.producer = producer
    
    async def publish_achievement_unlocked(
        self,
        user_id: str,
        achievement: Achievement,
        source_app: str = "web"
    ) -> bool:
        """
        Publish achievement unlocked event
        
        Args:
            user_id: User ID
            achievement: Achievement that was unlocked
            source_app: Source application
            
        Returns:
            True if published successfully
        """
        return await self.producer.publish_achievement_unlocked(
            user_id=user_id,
            achievement_id=achievement.achievement_id,
            achievement_name=achievement.name,
            description=achievement.description,
            points_awarded=achievement.points_awarded,
            badge_url=achievement.icon_url or "",
            source_app=source_app
        )
    
    async def publish_points_earned(
        self,
        user_id: str,
        points: int,
        source: str,
        reason: str,
        total_points: int,
        source_app: str = "web"
    ) -> bool:
        """
        Publish points earned event
        
        Args:
            user_id: User ID
            points: Points earned
            source: Source of points
            reason: Reason for earning points
            total_points: New total points
            source_app: Source application
            
        Returns:
            True if published successfully
        """
        return await self.producer.publish_points_earned(
            user_id=user_id,
            points=points,
            source=source,
            reason=reason,
            total_points=total_points,
            source_app=source_app
        )
    
    async def publish_level_up(
        self,
        user_id: str,
        new_level: int,
        xp: int,
        xp_to_next: int,
        source_app: str = "web"
    ) -> bool:
        """
        Publish level up event
        
        Args:
            user_id: User ID
            new_level: New level
            xp: Current XP
            xp_to_next: XP needed for next level
            source_app: Source application
            
        Returns:
            True if published successfully
        """
        from uuid import uuid4
        
        metadata = EventMetadata(
            event_id=str(uuid4()),
            event_type=EventType.LEVEL_UP,
            source_app=source_app,
            user_id=user_id
        )
        
        payload = {
            "user_id": user_id,
            "new_level": new_level,
            "xp": xp,
            "xp_to_next": xp_to_next,
            "leveled_up_at": datetime.utcnow().isoformat()
        }
        
        return await self.producer.produce_event(
            EventType.LEVEL_UP, payload, metadata, user_id
        )
    
    async def publish_challenge_completed(
        self,
        user_id: str,
        challenge_id: str,
        challenge_name: str,
        reward: Dict[str, Any],
        source_app: str = "web"
    ) -> bool:
        """
        Publish challenge completed event
        
        Args:
            user_id: User ID
            challenge_id: Challenge ID
            challenge_name: Challenge name
            reward: Reward earned
            source_app: Source application
            
        Returns:
            True if published successfully
        """
        from uuid import uuid4
        
        metadata = EventMetadata(
            event_id=str(uuid4()),
            event_type=EventType.CHALLENGE_COMPLETED,
            source_app=source_app,
            user_id=user_id
        )
        
        payload = {
            "user_id": user_id,
            "challenge_id": challenge_id,
            "challenge_name": challenge_name,
            "reward": reward,
            "completed_at": datetime.utcnow().isoformat()
        }
        
        return await self.producer.produce_event(
            EventType.CHALLENGE_COMPLETED, payload, metadata, user_id
        )
    
    async def publish_streak_started(
        self,
        user_id: str,
        streak_days: int,
        streak_type: str,
        source_app: str = "web"
    ) -> bool:
        """
        Publish streak started event
        
        Args:
            user_id: User ID
            streak_days: Current streak days
            streak_type: Type of streak
            source_app: Source application
            
        Returns:
            True if published successfully
        """
        from uuid import uuid4
        
        metadata = EventMetadata(
            event_id=str(uuid4()),
            event_type=EventType.STREAK_STARTED,
            source_app=source_app,
            user_id=user_id
        )
        
        payload = {
            "user_id": user_id,
            "streak_days": streak_days,
            "streak_type": streak_type,
            "started_at": datetime.utcnow().isoformat()
        }
        
        return await self.producer.produce_event(
            EventType.STREAK_STARTED, payload, metadata, user_id
        )
