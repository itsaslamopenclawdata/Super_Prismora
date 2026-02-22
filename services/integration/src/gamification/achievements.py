"""
Achievement Manager
Manages achievements and progress tracking
"""
from typing import Dict, Any, Optional, List
from datetime import datetime
from .models import (
    Achievement, AchievementProgress, AchievementTier, UserStats
)


class AchievementManager:
    """
    Manages achievements and tracks user progress
    """
    
    def __init__(self):
        self._achievements: Dict[str, Achievement] = {}
        self._user_progress: Dict[str, Dict[str, AchievementProgress]] = {}
        self._initialize_default_achievements()
    
    def _initialize_default_achievements(self):
        """Initialize default achievements"""
        
        # Photo Uploads
        self.register_achievement(Achievement(
            achievement_id="photo_uploader_1",
            name="First Photo",
            description="Upload your first photo",
            tier=AchievementTier.BRONZE,
            points_awarded=10,
            xp_awarded=5,
            requirements={"photo_uploads": 1},
            max_progress=1,
            icon_url="/badges/first-photo.png"
        ))
        
        self.register_achievement(Achievement(
            achievement_id="photo_uploader_10",
            name="Photo Enthusiast",
            description="Upload 10 photos",
            tier=AchievementTier.BRONZE,
            points_awarded=50,
            xp_awarded=20,
            requirements={"photo_uploads": 10},
            max_progress=10,
            icon_url="/badges/photo-enthusiast.png"
        ))
        
        self.register_achievement(Achievement(
            achievement_id="photo_uploader_100",
            name="Photo Master",
            description="Upload 100 photos",
            tier=AchievementTier.GOLD,
            points_awarded=500,
            xp_awarded=200,
            requirements={"photo_uploads": 100},
            max_progress=100,
            icon_url="/badges/photo-master.png"
        ))
        
        # Cross-App Achievements
        self.register_achievement(Achievement(
            achievement_id="cross_app_explorer",
            name="App Explorer",
            description="Use 3 different apps in the platform",
            tier=AchievementTier.SILVER,
            points_awarded=100,
            xp_awarded=50,
            requirements={"apps_used": 3},
            cross_app=True,
            max_progress=3,
            icon_url="/badges/app-explorer.png"
        ))
        
        self.register_achievement(Achievement(
            achievement_id="marketplace_buyer",
            name="First Purchase",
            description="Make your first marketplace purchase",
            tier=AchievementTier.BRONZE,
            points_awarded=25,
            xp_awarded=10,
            requirements={"marketplace_purchases": 1},
            app_specific=True,
            max_progress=1,
            icon_url="/badges/first-purchase.png"
        ))
        
        self.register_achievement(Achievement(
            achievement_id="booking_master",
            name="Booking Pro",
            description="Complete 5 bookings",
            tier=AchievementTier.SILVER,
            points_awarded=75,
            xp_awarded=30,
            requirements={"bookings_completed": 5},
            app_specific=True,
            max_progress=5,
            icon_url="/badges/booking-pro.png"
        ))
        
        # Streak Achievements
        self.register_achievement(Achievement(
            achievement_id="streak_7",
            name="Week Warrior",
            description="Maintain a 7-day activity streak",
            tier=AchievementTier.BRONZE,
            points_awarded=50,
            xp_awarded=25,
            requirements={"streak_days": 7},
            max_progress=7,
            icon_url="/badges/week-warrior.png"
        ))
        
        self.register_achievement(Achievement(
            achievement_id="streak_30",
            name="Monthly Master",
            description="Maintain a 30-day activity streak",
            tier=AchievementTier.GOLD,
            points_awarded=500,
            xp_awarded=250,
            requirements={"streak_days": 30},
            max_progress=30,
            icon_url="/badges/monthly-master.png"
        ))
        
        # Points Achievements
        self.register_achievement(Achievement(
            achievement_id="points_1000",
            name="Points Collector",
            description="Earn 1,000 points",
            tier=AchievementTier.SILVER,
            points_awarded=100,
            xp_awarded=50,
            requirements={"total_points": 1000},
            max_progress=1000,
            icon_url="/badges/points-collector.png"
        ))
        
        self.register_achievement(Achievement(
            achievement_id="points_10000",
            name="Points Tycoon",
            description="Earn 10,000 points",
            tier=AchievementTier.DIAMOND,
            points_awarded=1000,
            xp_awarded=500,
            requirements={"total_points": 10000},
            max_progress=10000,
            icon_url="/badges/points-tycoon.png"
        ))
    
    def register_achievement(self, achievement: Achievement) -> None:
        """Register a new achievement"""
        self._achievements[achievement.achievement_id] = achievement
    
    def get_achievement(self, achievement_id: str) -> Optional[Achievement]:
        """Get achievement by ID"""
        return self._achievements.get(achievement_id)
    
    def list_achievements(
        self,
        tier: Optional[AchievementTier] = None,
        cross_app: Optional[bool] = None
    ) -> List[Achievement]:
        """List achievements with optional filters"""
        achievements = list(self._achievements.values())
        
        if tier:
            achievements = [a for a in achievements if a.tier == tier]
        
        if cross_app is not None:
            achievements = [a for a in achievements if a.cross_app == cross_app]
        
        return achievements
    
    def get_user_progress(
        self,
        user_id: str,
        achievement_id: str
    ) -> Optional[AchievementProgress]:
        """Get user's progress on an achievement"""
        if user_id not in self._user_progress:
            return None
        
        return self._user_progress[user_id].get(achievement_id)
    
    def update_progress(
        self,
        user_id: str,
        achievement_id: str,
        increment: int = 1
    ) -> tuple[AchievementProgress, bool]:
        """
        Update user's progress on an achievement
        
        Returns:
            (progress, newly_unlocked)
        """
        achievement = self.get_achievement(achievement_id)
        if not achievement:
            raise ValueError(f"Achievement {achievement_id} not found")
        
        # Get or create progress
        if user_id not in self._user_progress:
            self._user_progress[user_id] = {}
        
        if achievement_id not in self._user_progress[user_id]:
            self._user_progress[user_id][achievement_id] = AchievementProgress(
                user_id=user_id,
                achievement_id=achievement_id
            )
        
        progress = self._user_progress[user_id][achievement_id]
        
        # Update progress
        if not progress.is_completed:
            progress.current_progress = min(
                progress.current_progress + increment,
                achievement.max_progress
            )
            
            # Check if completed
            if progress.current_progress >= achievement.max_progress:
                progress.is_completed = True
                progress.completed_at = datetime.utcnow()
        
        newly_unlocked = progress.is_completed and (
            not self._user_progress[user_id][achievement_id].is_completed
        )
        
        return progress, newly_unlocked
    
    def check_achievement_unlock(
        self,
        user_id: str,
        user_stats: UserStats
    ) -> List[Achievement]:
        """
        Check if any achievements should be unlocked based on user stats
        
        Returns:
            List of newly unlocked achievements
        """
        newly_unlocked = []
        
        for achievement in self._achievements.values():
            if achievement.achievement_id in user_stats.achievements:
                continue  # Already unlocked
            
            if self._should_unlock(achievement, user_stats):
                progress, newly = self.update_progress(
                    user_id,
                    achievement.achievement_id,
                    achievement.max_progress
                )
                
                if newly:
                    newly_unlocked.append(achievement)
        
        return newly_unlocked
    
    def _should_unlock(
        self,
        achievement: Achievement,
        user_stats: UserStats
    ) -> bool:
        """Check if achievement should be unlocked"""
        requirements = achievement.requirements
        
        # Check photo uploads
        if "photo_uploads" in requirements:
            # Would need to track this separately
            pass
        
        # Check apps used
        if "apps_used" in requirements:
            # Would need to track this separately
            pass
        
        # Check total points
        if "total_points" in requirements:
            if user_stats.total_points < requirements["total_points"]:
                return False
        
        # Check streak
        if "streak_days" in requirements:
            if user_stats.current_streak < requirements["streak_days"]:
                return False
        
        return True
    
    def get_user_achievements(self, user_id: str) -> List[Achievement]:
        """Get all achievements unlocked by a user"""
        if user_id not in self._user_progress:
            return []
        
        unlocked_ids = [
            aid for aid, progress in self._user_progress[user_id].items()
            if progress.is_completed
        ]
        
        return [
            self._achievements[aid]
            for aid in unlocked_ids
            if aid in self._achievements
        ]
    
    def get_user_in_progress(self, user_id: str) -> List[tuple[Achievement, AchievementProgress]]:
        """Get achievements the user is currently working on"""
        if user_id not in self._user_progress:
            return []
        
        in_progress = []
        
        for achievement_id, progress in self._user_progress[user_id].items():
            if not progress.is_completed:
                achievement = self._achievements.get(achievement_id)
                if achievement:
                    in_progress.append((achievement, progress))
        
        return sorted(
            in_progress,
            key=lambda x: (x[1].current_progress / x[0].max_progress),
            reverse=True
        )
