"""
Points Manager
Manages points earning and redemption
"""
from typing import Dict, Any, Optional, List
from datetime import datetime
from .models import PointsTransaction, UserStats


class PointsManager:
    """
    Manages user points and transactions
    """
    
    def __init__(self):
        self._transactions: Dict[str, List[PointsTransaction]] = {}
    
    def add_points(
        self,
        user_id: str,
        points: int,
        source: str,
        reason: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> PointsTransaction:
        """
        Add points to a user's account
        
        Args:
            user_id: User ID
            points: Points to add
            source: Source of points
            reason: Reason for awarding points
            metadata: Additional metadata
            
        Returns:
            Points transaction record
        """
        if points <= 0:
            raise ValueError("Points must be positive")
        
        transaction = PointsTransaction(
            transaction_id=self._generate_transaction_id(),
            user_id=user_id,
            points=points,
            source=source,
            reason=reason,
            balance_after=0,  # Will be set by UserStats
            metadata=metadata or {}
        )
        
        if user_id not in self._transactions:
            self._transactions[user_id] = []
        
        self._transactions[user_id].append(transaction)
        
        return transaction
    
    def redeem_points(
        self,
        user_id: str,
        points: int,
        source: str,
        reason: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> PointsTransaction:
        """
        Redeem points from a user's account
        
        Args:
            user_id: User ID
            points: Points to redeem
            source: Source of redemption
            reason: Reason for redemption
            metadata: Additional metadata
            
        Returns:
            Points transaction record
        """
        if points >= 0:
            raise ValueError("Points must be negative for redemption")
        
        transaction = PointsTransaction(
            transaction_id=self._generate_transaction_id(),
            user_id=user_id,
            points=points,
            source=source,
            reason=reason,
            balance_after=0,  # Will be set by UserStats
            metadata=metadata or {}
        )
        
        if user_id not in self._transactions:
            self._transactions[user_id] = []
        
        self._transactions[user_id].append(transaction)
        
        return transaction
    
    def get_transactions(
        self,
        user_id: str,
        limit: int = 100
    ) -> List[PointsTransaction]:
        """
        Get user's point transactions
        
        Args:
            user_id: User ID
            limit: Maximum number of transactions to return
            
        Returns:
            List of transactions (most recent first)
        """
        if user_id not in self._transactions:
            return []
        
        transactions = self._transactions[user_id]
        return sorted(transactions, key=lambda t: t.created_at, reverse=True)[:limit]
    
    def get_balance(self, user_id: str) -> int:
        """
        Get user's current point balance
        
        Args:
            user_id: User ID
            
        Returns:
            Current point balance
        """
        transactions = self.get_transactions(user_id, limit=999999)
        
        balance = 0
        for transaction in transactions:
            balance += transaction.points
            transaction.balance_after = balance
        
        return balance
    
    def _generate_transaction_id(self) -> str:
        """Generate a unique transaction ID"""
        return f"txn_{datetime.utcnow().timestamp()}_{id(object())}"
    
    # Point sources for different actions
    PHOTO_UPLOAD_POINTS = 10
    PHOTO_TAG_POINTS = 5
    ACHIEVEMENT_UNLOCK_POINTS = 0  # Defined per achievement
    CHALLENGE_COMPLETE_POINTS = 50
    DAILY_LOGIN_POINTS = 5
    REFERRAL_POINTS = 100
    
    # Point redemption options
    MARKETPLACE_DISCOUNT = {"points_per_percent": 10, "max_discount_percent": 20}
    BOOKING_DISCOUNT = {"points_per_percent": 15, "max_discount_percent": 30}
    PREMIUM_FEATURES = {"points": 500}
