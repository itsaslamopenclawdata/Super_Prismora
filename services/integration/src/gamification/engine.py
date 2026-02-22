"""
Gamification Engine
Main orchestrator for gamification features
"""
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta

from .models import UserStats, Achievement, Challenge, PointsTransaction
from .achievements import AchievementManager
from .points import PointsManager
from .challenges import ChallengeManager
from .leaderboard import LeaderboardManager
from .events import GamificationEventPublisher


class GamificationEngine:
    """
    Main engine for gamification across all apps
    """
    
    def __init__(
        self,
        achievement_manager: Optional[AchievementManager] = None,
        points_manager: Optional[PointsManager] = None,
        challenge_manager: Optional[ChallengeManager] = None,
        leaderboard_manager: Optional[LeaderboardManager] = None,
        event_publisher: Optional[GamificationEventPublisher] = None
    ):
        self.achievement_manager = achievement_manager or AchievementManager()
        self.points_manager = points_manager or PointsManager()
        self.challenge_manager = challenge_manager or ChallengeManager()
        self.leaderboard_manager = leaderboard_manager or LeaderboardManager()
        self.event_publisher = event_publisher
        
        self._user_stats: Dict[str, UserStats] = {}
    
    async def get_or_create_stats(self, user_id: str) -> UserStats:
        """Get or create user stats"""
        if user_id not in self._user_stats:
            self._user_stats[user_id] = UserStats(user_id=user_id)
        
        return self._user_stats[user_id]
    
    async def award_points(
        self,
        user_id: str,
        points: int,
        source: str,
        reason: str,
        metadata: Optional[Dict[str, Any]] = None,
        source_app: str = "web"
    ) -> UserStats:
        """
        Award points to a user
        
        Returns:
            Updated UserStats
        """
        stats = await self.get_or_create_stats(user_id)
        
        # Add points transaction
        transaction = self.points_manager.add_points(
            user_id=user_id,
            points=points,
            source=source,
            reason=reason,
            metadata=metadata
        )
        
        # Update stats
        stats.total_points += points
        stats.available_points += points
        stats.updated_at = datetime.utcnow()
        
        # Publish event
        if self.event_publisher:
            await self.event_publisher.publish_points_earned(
                user_id=user_id,
                points=points,
                source=source,
                reason=reason,
                total_points=stats.total_points,
                source_app=source_app
            )
        
        # Check achievements
        newly_unlocked = await self.check_and_unlock_achievements(user_id, source_app)
        
        # Update leaderboard
        self.leaderboard_manager.update_from_stats(stats)
        
        return stats
    
    async def redeem_points(
        self,
        user_id: str,
        points: int,
        source: str,
        reason: str,
        source_app: str = "web"
    ) -> UserStats:
        """
        Redeem points from a user's account
        
        Returns:
            Updated UserStats
        """
        stats = await self.get_or_create_stats(user_id)
        
        # Check if user has enough points
        if stats.available_points < abs(points):
            raise ValueError(f"Not enough points. Available: {stats.available_points}, Required: {abs(points)}")
        
        # Redeem points
        transaction = self.points_manager.redeem_points(
            user_id=user_id,
            points=points,
            source=source,
            reason=reason
        )
        
        # Update stats
        stats.total_points += points  # points is negative
        stats.available_points += points
        stats.redeemed_points += abs(points)
        stats.updated_at = datetime.utcnow()
        
        return stats
    
    async def unlock_achievement(
        self,
        user_id: str,
        achievement_id: str,
        source_app: str = "web"
    ) -> Optional[Achievement]:
        """
        Unlock an achievement for a user
        
        Returns:
            The achievement if newly unlocked, None if already unlocked
        """
        achievement = self.achievement_manager.get_achievement(achievement_id)
        if not achievement:
            return None
        
        stats = await self.get_or_create_stats(user_id)
        
        # Check if already unlocked
        if achievement_id in stats.achievements:
            return None
        
        # Update progress and unlock
        progress, newly_unlocked = self.achievement_manager.update_progress(
            user_id=user_id,
            achievement_id=achievement_id,
            increment=achievement.max_progress
        )
        
        if newly_unlocked:
            # Update stats
            stats.achievements[achievement_id] = datetime.utcnow()
            stats.achievements_unlocked += 1
            stats.updated_at = datetime.utcnow()
            
            # Award points and XP
            if achievement.points_awarded > 0:
                await self.award_points(
                    user_id=user_id,
                    points=achievement.points_awarded,
                    source="achievement",
                    reason=f"Unlocked: {achievement.name}",
                    source_app=source_app
                )
            
            stats.xp += achievement.xp_awarded
            await self._check_level_up(user_id, source_app)
            
            # Publish event
            if self.event_publisher:
                await self.event_publisher.publish_achievement_unlocked(
                    user_id=user_id,
                    achievement=achievement,
                    source_app=source_app
                )
            
            # Update leaderboard
            self.leaderboard_manager.update_from_stats(stats)
        
        return achievement if newly_unlocked else None
    
    async def check_and_unlock_achievements(
        self,
        user_id: str,
        source_app: str = "web"
    ) -> List[Achievement]:
        """
        Check and unlock any achievements the user qualifies for
        
        Returns:
            List of newly unlocked achievements
        """
        stats = await self.get_or_create_stats(user_id)
        
        newly_unlocked = self.achievement_manager.check_achievement_unlock(
            user_id=user_id,
            user_stats=stats
        )
        
        # Process each newly unlocked achievement
        for achievement in newly_unlocked:
            stats.achievements[achievement.achievement_id] = datetime.utcnow()
            stats.achievements_unlocked += 1
            
            # Award points and XP
            if achievement.points_awarded > 0:
                stats.total_points += achievement.points_awarded
                stats.available_points += achievement.points_awarded
            
            stats.xp += achievement.xp_awarded
            
            # Publish event
            if self.event_publisher:
                await self.event_publisher.publish_achievement_unlocked(
                    user_id=user_id,
                    achievement=achievement,
                    source_app=source_app
                )
        
        if newly_unlocked:
            stats.updated_at = datetime.utcnow()
            await self._check_level_up(user_id, source_app)
            self.leaderboard_manager.update_from_stats(stats)
        
        return newly_unlocked
    
    async def _check_level_up(self, user_id: str, source_app: str = "web"):
        """Check if user should level up"""
        stats = await self.get_or_create_stats(user_id)
        
        while stats.xp >= stats.xp_to_next_level:
            stats.xp -= stats.xp_to_next_level
            stats.level += 1
            stats.xp_to_next_level = int(stats.xp_to_next_level * 1.5)  # 50% more XP needed per level
            
            # Publish level up event
            if self.event_publisher:
                await self.event_publisher.publish_level_up(
                    user_id=user_id,
                    new_level=stats.level,
                    xp=stats.xp,
                    xp_to_next=stats.xp_to_next_level,
                    source_app=source_app
                )
    
    async def join_challenge(
        self,
        user_id: str,
        challenge_id: str
    ) -> bool:
        """Join a challenge"""
        return self.challenge_manager.join_challenge(user_id, challenge_id)
    
    async def update_challenge_progress(
        self,
        user_id: str,
        challenge_id: str,
        progress_update: Dict[str, Any],
        source_app: str = "web"
    ) -> bool:
        """
        Update challenge progress
        
        Returns:
            True if challenge was just completed
        """
        updated, completed = self.challenge_manager.update_progress(
            user_id=user_id,
            challenge_id=challenge_id,
            progress_update=progress_update
        )
        
        if completed:
            stats = await self.get_or_create_stats(user_id)
            stats.challenges_completed += 1
            stats.updated_at = datetime.utcnow()
            
            challenge = self.challenge_manager.get_challenge(challenge_id)
            if challenge:
                # Publish event
                if self.event_publisher:
                    await self.event_publisher.publish_challenge_completed(
                        user_id=user_id,
                        challenge_id=challenge_id,
                        challenge_name=challenge.name,
                        reward=challenge.reward.model_dump(),
                        source_app=source_app
                    )
        
        return completed
    
    async def record_activity(
        self,
        user_id: str,
        activity_type: str,
        source_app: str = "web"
    ):
        """
        Record user activity for streak tracking
        """
        stats = await self.get_or_create_stats(user_id)
        today = datetime.utcnow().date()
        
        # Check if activity was today
        last_activity = stats.last_activity_date.date() if stats.last_activity_date else None
        
        if last_activity == today:
            # Already active today
            pass
        elif last_activity == today - timedelta(days=1):
            # Streak continues
            stats.current_streak += 1
            if stats.current_streak > stats.longest_streak:
                stats.longest_streak = stats.current_streak
            
            # Check for streak achievements
            newly_unlocked = await self.check_and_unlock_achievements(user_id, source_app)
            
            # Publish streak event if milestone reached
            if stats.current_streak in [7, 14, 30, 60, 90, 100]:
                if self.event_publisher:
                    await self.event_publisher.publish_streak_started(
                        user_id=user_id,
                        streak_days=stats.current_streak,
                        streak_type="daily",
                        source_app=source_app
                    )
        else:
            # Streak reset
            stats.current_streak = 1
        
        stats.last_activity_date = datetime.utcnow()
        stats.updated_at = datetime.utcnow()
    
    def get_leaderboard(
        self,
        leaderboard_type: str = "points",
        limit: int = 100
    ) -> List[Any]:
        """Get leaderboard entries"""
        return self.leaderboard_manager.get_leaderboard(leaderboard_type, limit)
    
    def get_user_rank(self, user_id: str, leaderboard_type: str = "points") -> Optional[Any]:
        """Get user's rank on leaderboard"""
        return self.leaderboard_manager.get_user_rank(user_id, leaderboard_type)
