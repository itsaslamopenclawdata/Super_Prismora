"""
Challenge Manager
Manages challenges and completions
"""
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from .models import Challenge, Reward, ChallengeStatus, UserStats


class ChallengeManager:
    """
    Manages challenges and tracks participation
    """
    
    def __init__(self):
        self._challenges: Dict[str, Challenge] = {}
        self._user_participants: Dict[str, Dict[str, Dict[str, Any]]] = {}  # user_id -> challenge_id -> progress
        self._initialize_default_challenges()
    
    def _initialize_default_challenges(self):
        """Initialize default challenges"""
        now = datetime.utcnow()
        
        # Weekly Photo Challenge
        self.create_challenge(Challenge(
            challenge_id="weekly_photo_challenge",
            name="Weekly Photo Challenge",
            description="Upload 20 photos this week!",
            requirements={"photo_uploads": 20},
            reward=Reward(
                reward_id="reward_weekly_photo",
                type="points",
                value=200,
                description="200 points for completing the challenge"
            ),
            starts_at=now,
            ends_at=now + timedelta(days=7),
            cross_app=False,
            difficulty="medium"
        ))
        
        # Cross-App Explorer Challenge
        self.create_challenge(Challenge(
            challenge_id="cross_app_explorer_challenge",
            name="App Explorer Challenge",
            description="Use all 4 apps this month: Web, Marketplace, Booking, and complete a gamification achievement!",
            requirements={
                "apps_used": ["web", "marketplace", "booking"],
                "achievements_unlocked": 1
            },
            reward=Reward(
                reward_id="reward_explorer",
                type="points",
                value=500,
                description="500 points and exclusive badge"
            ),
            starts_at=now,
            ends_at=now + timedelta(days=30),
            cross_app=True,
            apps_involved=["web", "marketplace", "booking", "gamification"],
            difficulty="hard"
        ))
        
        # Daily Login Challenge
        self.create_challenge(Challenge(
            challenge_id="daily_login_challenge",
            name="7-Day Login Streak",
            description="Log in for 7 consecutive days",
            requirements={"consecutive_logins": 7},
            reward=Reward(
                reward_id="reward_login_streak",
                type="badge",
                value="login_streak_badge",
                description="Exclusive 7-day login badge"
            ),
            starts_at=now,
            ends_at=now + timedelta(days=7),
            cross_app=False,
            difficulty="easy"
        ))
        
        # Marketplace Challenge
        self.create_challenge(Challenge(
            challenge_id="marketplace_seller_challenge",
            name="Seller's Debut",
            description="List 5 items on the marketplace",
            requirements={"listings_created": 5},
            reward=Reward(
                reward_id="reward_seller",
                type="discount",
                value={"percentage": 10, "max_amount": 50},
                description="10% discount on next purchase (max $50)"
            ),
            starts_at=now,
            ends_at=now + timedelta(days=14),
            cross_app=False,
            difficulty="easy"
        ))
    
    def create_challenge(self, challenge: Challenge) -> None:
        """Create a new challenge"""
        self._challenges[challenge.challenge_id] = challenge
    
    def get_challenge(self, challenge_id: str) -> Optional[Challenge]:
        """Get challenge by ID"""
        return self._challenges.get(challenge_id)
    
    def list_challenges(
        self,
        status: Optional[ChallengeStatus] = None,
        cross_app: Optional[bool] = None
    ) -> List[Challenge]:
        """List challenges with optional filters"""
        challenges = list(self._challenges.values())
        
        if status:
            challenges = [c for c in challenges if self._get_status(c) == status]
        
        if cross_app is not None:
            challenges = [c for c in challenges if c.cross_app == cross_app]
        
        return challenges
    
    def _get_status(self, challenge: Challenge) -> ChallengeStatus:
        """Get current status of a challenge"""
        now = datetime.utcnow()
        
        if now < challenge.starts_at:
            return ChallengeStatus.CANCELLED  # Not started
        elif now > challenge.ends_at:
            return ChallengeStatus.EXPIRED
        else:
            return ChallengeStatus.ACTIVE
    
    def join_challenge(
        self,
        user_id: str,
        challenge_id: str
    ) -> bool:
        """
        User joins a challenge
        
        Returns:
            True if joined successfully
        """
        challenge = self.get_challenge(challenge_id)
        if not challenge:
            return False
        
        if self._get_status(challenge) != ChallengeStatus.ACTIVE:
            return False
        
        # Check if max participants reached
        if challenge.max_participants:
            if challenge.current_participants >= challenge.max_participants:
                return False
        
        # Add user to participants
        if user_id not in self._user_participants:
            self._user_participants[user_id] = {}
        
        if challenge_id not in self._user_participants[user_id]:
            self._user_participants[user_id][challenge_id] = {
                "joined_at": datetime.utcnow(),
                "progress": {},
                "is_completed": False
            }
            challenge.current_participants += 1
        
        return True
    
    def update_progress(
        self,
        user_id: str,
        challenge_id: str,
        progress_update: Dict[str, Any]
    ) -> tuple[bool, bool]:
        """
        Update user's progress on a challenge
        
        Returns:
            (is_updated, is_completed)
        """
        if user_id not in self._user_participants:
            return False, False
        
        if challenge_id not in self._user_participants[user_id]:
            return False, False
        
        participant = self._user_participants[user_id][challenge_id]
        
        if participant["is_completed"]:
            return True, True
        
        # Update progress
        for key, value in progress_update.items():
            if key not in participant["progress"]:
                participant["progress"][key] = 0
            participant["progress"][key] += value
        
        # Check if completed
        is_completed = self._check_completion(
            challenge_id,
            participant["progress"]
        )
        
        participant["is_completed"] = is_completed
        
        return True, is_completed
    
    def _check_completion(
        self,
        challenge_id: str,
        progress: Dict[str, Any]
    ) -> bool:
        """Check if challenge requirements are met"""
        challenge = self.get_challenge(challenge_id)
        if not challenge:
            return False
        
        requirements = challenge.requirements
        
        for req_key, req_value in requirements.items():
            if req_key not in progress:
                return False
            
            if isinstance(req_value, list):
                # Need all items in list
                for item in req_value:
                    if item not in progress.get(req_key, []):
                        return False
            else:
                if progress[req_key] < req_value:
                    return False
        
        return True
    
    def get_user_challenges(
        self,
        user_id: str,
        active_only: bool = True
    ) -> List[tuple[Challenge, Dict[str, Any]]]:
        """
        Get challenges a user is participating in
        
        Returns:
            List of (challenge, participant_data) tuples
        """
        if user_id not in self._user_participants:
            return []
        
        user_challenges = []
        
        for challenge_id, participant_data in self._user_participants[user_id].items():
            challenge = self.get_challenge(challenge_id)
            if challenge:
                if not active_only or self._get_status(challenge) == ChallengeStatus.ACTIVE:
                    user_challenges.append((challenge, participant_data))
        
        return user_challenges
    
    def get_challenge_leaderboard(
        self,
        challenge_id: str,
        limit: int = 10
    ) -> List[tuple[str, Dict[str, Any]]]:
        """
        Get leaderboard for a challenge
        
        Returns:
            List of (user_id, progress) tuples, sorted by progress
        """
        leaderboard = []
        
        for user_id, challenges in self._user_participants.items():
            if challenge_id in challenges:
                progress = challenges[challenge_id]["progress"]
                leaderboard.append((user_id, progress))
        
        # Sort by progress (simple heuristic: total count)
        def get_total_progress(progress: Dict[str, Any]) -> int:
            return sum(v if isinstance(v, int) else 0 for v in progress.values())
        
        leaderboard.sort(
            key=lambda x: get_total_progress(x[1]),
            reverse=True
        )
        
        return leaderboard[:limit]
