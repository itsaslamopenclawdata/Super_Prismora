"""
Leaderboard Manager
Manages leaderboards and rankings
"""
from typing import Dict, List, Optional
from datetime import datetime
from .models import LeaderboardEntry, UserStats


class LeaderboardManager:
    """
    Manages leaderboards across different categories
    """
    
    def __init__(self):
        self._entries: Dict[str, List[LeaderboardEntry]] = {}  # leaderboard_type -> entries
        self._historical_ranks: Dict[str, Dict[str, int]] = {}  # user_id -> (type -> rank)
    
    def update_entry(
        self,
        user_id: str,
        username: str,
        avatar_url: Optional[str],
        points: int,
        score: int,
        leaderboard_type: str = "points"
    ) -> LeaderboardEntry:
        """
        Update or create a leaderboard entry
        
        Args:
            user_id: User ID
            username: Username
            avatar_url: Avatar URL
            points: User's total points
            score: Score for this leaderboard
            leaderboard_type: Type of leaderboard (points, achievements, challenges, etc.)
            
        Returns:
            Updated leaderboard entry
        """
        # Get previous rank
        previous_rank = self._historical_ranks.get(user_id, {}).get(leaderboard_type, 0)
        
        # Create entry
        entry = LeaderboardEntry(
            user_id=user_id,
            username=username,
            avatar_url=avatar_url,
            points=points,
            score=score,
            rank=0,  # Will be calculated
            rank_change=0  # Will be calculated
        )
        
        # Initialize leaderboard type if needed
        if leaderboard_type not in self._entries:
            self._entries[leaderboard_type] = []
        
        # Remove existing entry if present
        self._entries[leaderboard_type] = [
            e for e in self._entries[leaderboard_type]
            if e.user_id != user_id
        ]
        
        # Add new entry
        self._entries[leaderboard_type].append(entry)
        
        # Sort and calculate ranks
        self._recalculate_ranks(leaderboard_type)
        
        # Get updated entry
        for e in self._entries[leaderboard_type]:
            if e.user_id == user_id:
                # Calculate rank change
                rank_change = previous_rank - e.rank if previous_rank > 0 else 0
                e.rank_change = rank_change
                
                # Save historical rank
                if user_id not in self._historical_ranks:
                    self._historical_ranks[user_id] = {}
                self._historical_ranks[user_id][leaderboard_type] = e.rank
                
                return e
        
        return entry
    
    def _recalculate_ranks(self, leaderboard_type: str):
        """Recalculate ranks for a leaderboard"""
        entries = self._entries.get(leaderboard_type, [])
        
        # Sort by score descending
        entries.sort(key=lambda e: e.score, reverse=True)
        
        # Assign ranks
        for i, entry in enumerate(entries):
            entry.rank = i + 1
            entry.last_updated = datetime.utcnow()
    
    def get_leaderboard(
        self,
        leaderboard_type: str = "points",
        limit: int = 100
    ) -> List[LeaderboardEntry]:
        """
        Get leaderboard entries
        
        Args:
            leaderboard_type: Type of leaderboard
            limit: Maximum entries to return
            
        Returns:
            List of leaderboard entries
        """
        entries = self._entries.get(leaderboard_type, [])
        return entries[:limit]
    
    def get_user_rank(
        self,
        user_id: str,
        leaderboard_type: str = "points"
    ) -> Optional[LeaderboardEntry]:
        """
        Get user's ranking on a leaderboard
        
        Args:
            user_id: User ID
            leaderboard_type: Type of leaderboard
            
        Returns:
            User's leaderboard entry or None if not found
        """
        entries = self._entries.get(leaderboard_type, [])
        
        for entry in entries:
            if entry.user_id == user_id:
                return entry
        
        return None
    
    def get_top_users(
        self,
        leaderboard_type: str = "points",
        n: int = 10
    ) -> List[LeaderboardEntry]:
        """
        Get top N users on a leaderboard
        
        Args:
            leaderboard_type: Type of leaderboard
            n: Number of users to return
            
        Returns:
            List of top N entries
        """
        return self.get_leaderboard(leaderboard_type, limit=n)
    
    def get_around_user(
        self,
        user_id: str,
        leaderboard_type: str = "points",
        above: int = 2,
        below: int = 2
    ) -> List[LeaderboardEntry]:
        """
        Get entries around a user on the leaderboard
        
        Args:
            user_id: User ID
            leaderboard_type: Type of leaderboard
            above: Number of users above to include
            below: Number of users below to include
            
        Returns:
            List of entries around the user
        """
        entries = self._entries.get(leaderboard_type, [])
        
        # Find user's index
        user_index = -1
        for i, entry in enumerate(entries):
            if entry.user_id == user_id:
                user_index = i
                break
        
        if user_index == -1:
            return []
        
        # Get slice around user
        start = max(0, user_index - above)
        end = min(len(entries), user_index + below + 1)
        
        return entries[start:end]
    
    def calculate_score(
        self,
        user_stats: UserStats,
        leaderboard_type: str = "points"
    ) -> int:
        """
        Calculate score for a user on a specific leaderboard type
        
        Args:
            user_stats: User statistics
            leaderboard_type: Type of leaderboard
            
        Returns:
            Calculated score
        """
        if leaderboard_type == "points":
            return user_stats.total_points
        
        elif leaderboard_type == "achievements":
            return user_stats.achievements_unlocked
        
        elif leaderboard_type == "level":
            return user_stats.level * 1000 + user_stats.xp
        
        elif leaderboard_type == "streak":
            return user_stats.current_streak
        
        elif leaderboard_type == "challenges":
            return user_stats.challenges_completed
        
        else:
            return 0
    
    def update_from_stats(self, user_stats: UserStats) -> LeaderboardEntry:
        """
        Update leaderboard entries from user stats
        
        Args:
            user_stats: User statistics
            
        Returns:
            Updated points leaderboard entry
        """
        # Update points leaderboard
        points_score = self.calculate_score(user_stats, "points")
        points_entry = self.update_entry(
            user_id=user_stats.user_id,
            username=user_stats.user_id,  # Would need to get from user profile
            avatar_url=None,
            points=user_stats.total_points,
            score=points_score,
            leaderboard_type="points"
        )
        
        # Update other leaderboards
        for lb_type in ["achievements", "level", "streak", "challenges"]:
            score = self.calculate_score(user_stats, lb_type)
            self.update_entry(
                user_id=user_stats.user_id,
                username=user_stats.user_id,
                avatar_url=None,
                points=user_stats.total_points,
                score=score,
                leaderboard_type=lb_type
            )
        
        return points_entry
    
    def get_leaderboard_types(self) -> List[str]:
        """Get list of available leaderboard types"""
        return list(self._entries.keys())
