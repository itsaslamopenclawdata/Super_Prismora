"""
Gamification Models
"""
from typing import Dict, Any, Optional, List
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field


class AchievementTier(str, Enum):
    """Achievement tiers"""
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"
    DIAMOND = "diamond"


class ChallengeStatus(str, Enum):
    """Challenge status"""
    ACTIVE = "active"
    COMPLETED = "completed"
    EXPIRED = "expired"
    CANCELLED = "cancelled"


class UserStats(BaseModel):
    """User's gamification statistics"""
    user_id: str = Field(..., description="User ID")
    
    # Points
    total_points: int = Field(default=0, description="Total points earned")
    available_points: int = Field(default=0, description="Points available for redemption")
    redeemed_points: int = Field(default=0, description="Points redeemed")
    
    # Level
    level: int = Field(default=1, description="Current level")
    xp: int = Field(default=0, description="Experience points")
    xp_to_next_level: int = Field(default=100, description="XP needed for next level")
    
    # Achievements
    achievements_unlocked: int = Field(default=0, description="Number of achievements unlocked")
    achievements: Dict[str, datetime] = Field(default_factory=dict, description="Unlocked achievements")
    
    # Challenges
    challenges_completed: int = Field(default=0, description="Number of challenges completed")
    active_challenges: List[str] = Field(default_factory=list, description="Active challenge IDs")
    
    # Streak
    current_streak: int = Field(default=0, description="Current activity streak")
    longest_streak: int = Field(default=0, description="Longest streak achieved")
    last_activity_date: Optional[datetime] = Field(None, description="Last activity date")
    
    # Badges
    badges: List[str] = Field(default_factory=list, description="Earned badges")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Achievement(BaseModel):
    """Achievement definition"""
    achievement_id: str = Field(..., description="Achievement ID")
    name: str = Field(..., description="Achievement name")
    description: str = Field(..., description="Achievement description")
    tier: AchievementTier = Field(..., description="Achievement tier")
    
    # Rewards
    points_awarded: int = Field(default=0, description="Points awarded")
    xp_awarded: int = Field(default=0, description="XP awarded")
    badge_id: Optional[str] = Field(None, description="Badge ID to award")
    
    # Requirements
    requirements: Dict[str, Any] = Field(default_factory=dict, description="Requirements to unlock")
    app_specific: bool = Field(default=False, description="Is this app-specific?")
    
    # Progress tracking
    max_progress: int = Field(default=1, description="Total progress needed")
    
    # UI
    icon_url: Optional[str] = Field(None, description="Icon URL")
    hidden: bool = Field(default=False, description="Is this achievement hidden?")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AchievementProgress(BaseModel):
    """User's progress on an achievement"""
    user_id: str = Field(..., description="User ID")
    achievement_id: str = Field(..., description="Achievement ID")
    current_progress: int = Field(default=0, description="Current progress")
    is_completed: bool = Field(default=False, description="Is completed?")
    completed_at: Optional[datetime] = Field(None, description="Completion timestamp")


class Challenge(BaseModel):
    """Challenge definition"""
    challenge_id: str = Field(..., description="Challenge ID")
    name: str = Field(..., description="Challenge name")
    description: str = Field(..., description="Challenge description")
    
    # Requirements
    requirements: Dict[str, Any] = Field(default_factory=dict, description="Challenge requirements")
    
    # Rewards
    reward: "Reward" = Field(..., description="Reward for completion")
    
    # Timing
    starts_at: datetime = Field(..., description="Challenge start time")
    ends_at: datetime = Field(..., description="Challenge end time")
    
    # Participation
    max_participants: Optional[int] = Field(None, description="Max participants (None = unlimited)")
    current_participants: int = Field(default=0, description="Current participants")
    
    # Difficulty
    difficulty: str = Field(default="medium", description="Difficulty level: easy, medium, hard")
    
    # Cross-app
    cross_app: bool = Field(default=False, description="Is this a cross-app challenge?")
    apps_involved: List[str] = Field(default_factory=list, description="Apps involved in challenge")


class Reward(BaseModel):
    """Reward definition"""
    reward_id: str = Field(..., description="Reward ID")
    type: str = Field(..., description="Reward type: points, badge, discount, item")
    value: Any = Field(..., description="Reward value")
    description: str = Field(..., description="Reward description")


class Badge(BaseModel):
    """Badge definition"""
    badge_id: str = Field(..., description="Badge ID")
    name: str = Field(..., description="Badge name")
    description: str = Field(..., description="Badge description")
    icon_url: str = Field(..., description="Badge icon URL")
    
    # Tier
    tier: AchievementTier = Field(..., description="Badge tier")
    
    # Requirements
    requirement_achievement_id: Optional[str] = Field(None, description="Required achievement ID")
    requirement_points: Optional[int] = Field(None, description="Required points")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)


class LeaderboardEntry(BaseModel):
    """Leaderboard entry"""
    user_id: str = Field(..., description="User ID")
    username: str = Field(..., description="Username")
    avatar_url: Optional[str] = Field(None, description="Avatar URL")
    
    # Score
    score: int = Field(default=0, description="Leaderboard score")
    points: int = Field(default=0, description="Total points")
    
    # Rank
    rank: int = Field(default=0, description="Leaderboard rank")
    rank_change: int = Field(default=0, description="Rank change (positive = moved up)")
    
    # Metadata
    last_updated: datetime = Field(default_factory=datetime.utcnow)


class Streak(BaseModel):
    """Activity streak"""
    user_id: str = Field(..., description="User ID")
    current_streak: int = Field(default=0, description="Current streak")
    longest_streak: int = Field(default=0, description="Longest streak")
    
    # Activity tracking
    activity_dates: List[datetime] = Field(default_factory=list, description="Activity dates")
    last_activity_date: Optional[datetime] = Field(None, description="Last activity date")
    
    # Streak type
    streak_type: str = Field(default="daily", description="Streak type: daily, weekly, monthly")


class PointsTransaction(BaseModel):
    """Points transaction record"""
    transaction_id: str = Field(..., description="Transaction ID")
    user_id: str = Field(..., description="User ID")
    
    # Transaction details
    points: int = Field(..., description="Points (positive = earned, negative = redeemed)")
    source: str = Field(..., description="Source of points")
    reason: str = Field(..., description="Reason for transaction")
    
    # Balance after
    balance_after: int = Field(..., description="Balance after transaction")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)
