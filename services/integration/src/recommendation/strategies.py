"""
Recommendation Strategies
Different strategies for generating recommendations
"""
from typing import Dict, Any, Optional, List
from abc import ABC, abstractmethod
import random

from .models import (
    RecommendationContext,
    RecommendationItem,
    AppContext,
    UserRecommendation
)


class BaseRecommendationStrategy(ABC):
    """Base class for recommendation strategies"""
    
    def __init__(self):
        self.name = self.__class__.__name__
    
    @abstractmethod
    async def generate(
        self,
        context: RecommendationContext,
        limit: int = 10
    ) -> List[RecommendationItem]:
        """
        Generate recommendations
        
        Args:
            context: Recommendation context
            limit: Maximum number of recommendations
            
        Returns:
            List of recommendation items
        """
        pass
    
    def _calculate_score(self, item: Dict[str, Any], context: RecommendationContext) -> float:
        """Calculate recommendation score for an item"""
        score = 0.5  # Base score
        
        # Add personalization
        if context.user_preferences:
            score += 0.1
        
        # Add contextual relevance
        if context.current_category:
            score += 0.15
        
        return min(score, 1.0)


class ContentBasedStrategy(BaseRecommendationStrategy):
    """
    Content-based recommendation strategy
    Recommends items based on user preferences and item attributes
    """
    
    def __init__(self, item_database: Optional[Dict[str, Dict[str, Any]]] = None):
        super().__init__()
        self.item_database = item_database or self._get_default_items()
    
    def _get_default_items(self) -> Dict[str, Dict[str, Any]]:
        """Get default item database"""
        return {
            # Marketplace items
            "marketplace_photo_frame": {
                "item_id": "marketplace_photo_frame",
                "item_type": "product",
                "title": "Premium Photo Frame Set",
                "description": "High-quality frames for your best photos",
                "price": 29.99,
                "category": "accessories",
                "target_app": AppContext.MARKETPLACE,
                "image_url": "/products/photo-frames.jpg"
            },
            "marketplace_album": {
                "item_id": "marketplace_album",
                "item_type": "product",
                "title": "Photo Album Pro",
                "description": "Premium leather photo album",
                "price": 49.99,
                "category": "storage",
                "target_app": AppContext.MARKETPLACE,
                "image_url": "/products/photo-album.jpg"
            },
            # Booking items
            "booking_photo_session": {
                "item_id": "booking_photo_session",
                "item_type": "service",
                "title": "Professional Photo Session",
                "description": "1-hour session with professional photographer",
                "price": 99.99,
                "category": "services",
                "target_app": AppContext.BOOKING,
                "image_url": "/services/photo-session.jpg"
            },
            "booking_workshop": {
                "item_id": "booking_workshop",
                "item_type": "service",
                "title": "Photography Workshop",
                "description": "Learn from the pros in this 3-hour workshop",
                "price": 149.99,
                "category": "education",
                "target_app": AppContext.BOOKING,
                "image_url": "/services/workshop.jpg"
            },
            # Gamification items
            "gamification_premium": {
                "item_id": "gamification_premium",
                "item_type": "feature",
                "title": "Premium Membership",
                "description": "Unlock exclusive badges and features",
                "price": 9.99,
                "category": "subscription",
                "target_app": AppContext.GAMIFICATION,
                "image_url": "/features/premium.jpg"
            },
            "gamification_boost": {
                "item_id": "gamification_boost",
                "item_type": "feature",
                "title": "Points Booster",
                "description": "Double your points for 7 days",
                "price": 4.99,
                "category": "boost",
                "target_app": AppContext.GAMIFICATION,
                "image_url": "/features/booster.jpg"
            }
        }
    
    async def generate(
        self,
        context: RecommendationContext,
        limit: int = 10
    ) -> List[RecommendationItem]:
        """Generate content-based recommendations"""
        recommendations = []
        
        # Filter items by target app
        target_apps = context.target_apps or [AppContext.MARKETPLACE, AppContext.BOOKING]
        
        for item_id, item_data in self.item_database.items():
            if item_data["target_app"] not in target_apps:
                continue
            
            # Check category match
            if context.current_category:
                if item_data.get("category") != context.current_category:
                    score = 0.3
                else:
                    score = 0.8
            else:
                score = self._calculate_score(item_data, context)
            
            # Add some randomness
            score += random.uniform(-0.1, 0.1)
            score = max(0.1, min(score, 1.0))
            
            recommendation = RecommendationItem(
                item_id=item_data["item_id"],
                item_type=item_data["item_type"],
                title=item_data["title"],
                description=item_data.get("description"),
                score=score,
                target_app=item_data["target_app"],
                target_url=f"/{item_data['target_app'].value}/{item_data['item_id']}",
                price=item_data.get("price"),
                image_url=item_data.get("image_url"),
                reason=f"Based on your interest in {item_data.get('category', 'this category')}"
            )
            
            recommendations.append(recommendation)
        
        # Sort by score and limit
        recommendations.sort(key=lambda x: x.score, reverse=True)
        return recommendations[:limit]


class CollaborativeFilteringStrategy(BaseRecommendationStrategy):
    """
    Collaborative filtering strategy
    Recommends items based on what similar users liked
    """
    
    def __init__(self):
        super().__init__()
        self.user_item_matrix: Dict[str, Dict[str, float]] = {}
        self.item_similarities: Dict[str, Dict[str, float]] = {}
    
    async def generate(
        self,
        context: RecommendationContext,
        limit: int = 10
    ) -> List[RecommendationItem]:
        """Generate collaborative filtering recommendations"""
        # Simulated collaborative filtering
        recommendations = []
        
        # In production, this would:
        # 1. Find similar users
        # 2. Get items they liked
        # 3. Score and rank
        
        # For demo, return some dummy recommendations
        sample_items = [
            {
                "item_id": "collab_1",
                "item_type": "product",
                "title": "Similar users liked this",
                "description": "Product popular among users like you",
                "target_app": AppContext.MARKETPLACE,
                "score": 0.85,
                "reason": "Users like you also bought this"
            },
            {
                "item_id": "collab_2",
                "item_type": "service",
                "title": "Popular booking",
                "description": "Highly rated by similar users",
                "target_app": AppContext.BOOKING,
                "score": 0.78,
                "reason": "Recommended based on your activity"
            }
        ]
        
        for item_data in sample_items:
            recommendations.append(RecommendationItem(**item_data))
        
        return recommendations[:limit]


class HybridStrategy(BaseRecommendationStrategy):
    """
    Hybrid strategy combining multiple approaches
    """
    
    def __init__(
        self,
        strategies: Optional[List[BaseRecommendationStrategy]] = None,
        weights: Optional[Dict[str, float]] = None
    ):
        super().__init__()
        self.strategies = strategies or [
            ContentBasedStrategy(),
            CollaborativeFilteringStrategy()
        ]
        self.weights = weights or {
            "ContentBasedStrategy": 0.6,
            "CollaborativeFilteringStrategy": 0.4
        }
    
    async def generate(
        self,
        context: RecommendationContext,
        limit: int = 10
    ) -> List[RecommendationItem]:
        """Generate hybrid recommendations"""
        # Get recommendations from all strategies
        all_recommendations: Dict[str, tuple[RecommendationItem, float]] = {}
        
        for strategy in self.strategies:
            weight = self.weights.get(strategy.name, 1.0)
            recs = await strategy.generate(context, limit * 2)
            
            for rec in recs:
                if rec.item_id in all_recommendations:
                    # Average the scores with weight
                    existing_rec, existing_weight = all_recommendations[rec.item_id]
                    weighted_score = (existing_rec.score * existing_weight + rec.score * weight) / (existing_weight + weight)
                    rec.score = weighted_score
                    all_recommendations[rec.item_id] = (rec, existing_weight + weight)
                else:
                    rec.score = rec.score * weight
                    all_recommendations[rec.item_id] = (rec, weight)
        
        # Sort and return top results
        recommendations = [rec for rec, _ in all_recommendations.values()]
        recommendations.sort(key=lambda x: x.score, reverse=True)
        
        return recommendations[:limit]


class CrossAppStrategy(BaseRecommendationStrategy):
    """
    Cross-app recommendation strategy
    Recommends items from other apps based on current context
    """
    
    async def generate(
        self,
        context: RecommendationContext,
        limit: int = 10
    ) -> List[RecommendationItem]:
        """Generate cross-app recommendations"""
        recommendations = []
        
        # Determine other apps
        current_app = context.current_app
        other_apps = [app for app in AppContext if app != current_app]
        
        # Cross-sell scenarios
        cross_sells = {
            (AppContext.WEB, AppContext.MARKETPLACE): [
                {
                    "item_id": "web_to_market_1",
                    "item_type": "product",
                    "title": "Print Your Photos",
                    "description": "High-quality prints of your uploaded photos",
                    "score": 0.85,
                    "discount_percentage": 15.0,
                    "reason": "You have photos, now print them!"
                }
            ],
            (AppContext.WEB, AppContext.BOOKING): [
                {
                    "item_id": "web_to_booking_1",
                    "item_type": "service",
                    "title": "Photo Session",
                    "description": "Book a professional photo shoot",
                    "score": 0.80,
                    "reason": "Enhance your photography skills"
                }
            ],
            (AppContext.MARKETPLACE, AppContext.GAMIFICATION): [
                {
                    "item_id": "market_to_gam_1",
                    "item_type": "feature",
                    "title": "Earn Points on Purchases",
                    "description": "Get points for every purchase",
                    "score": 0.90,
                    "reason": "Maximize your rewards"
                }
            ],
            (AppContext.BOOKING, AppContext.MARKETPLACE): [
                {
                    "item_id": "booking_to_market_1",
                    "item_type": "product",
                    "title": "Photo Gear Bundle",
                    "description": "Everything you need for your session",
                    "score": 0.85,
                    "reason": "Prepare for your session"
                }
            ]
        }
        
        for source_app, target_app in other_apps:
            key = (source_app, target_app)
            if key in cross_sells:
                for item_data in cross_sells[key]:
                    rec = RecommendationItem(
                        **item_data,
                        target_app=target_app
                    )
                    recommendations.append(rec)
        
        recommendations.sort(key=lambda x: x.score, reverse=True)
        return recommendations[:limit]
