"""
Recommendation Engine
Main orchestrator for recommendation generation
"""
from typing import Dict, Any, Optional, List
from datetime import datetime
from uuid import uuid4

from .models import (
    UserRecommendation,
    RecommendationContext,
    RecommendationType,
    AppContext,
    RecommendationItem,
    CrossSellOffer
)
from .strategies import (
    BaseRecommendationStrategy,
    ContentBasedStrategy,
    CollaborativeFilteringStrategy,
    HybridStrategy,
    CrossAppStrategy
)
from .events import RecommendationEventPublisher


class RecommendationEngine:
    """
    Main engine for generating recommendations across apps
    """
    
    def __init__(
        self,
        event_publisher: Optional[RecommendationEventPublisher] = None
    ):
        self.event_publisher = event_publisher
        
        # Initialize strategies
        self.strategies: Dict[str, BaseRecommendationStrategy] = {
            "content_based": ContentBasedStrategy(),
            "collaborative": CollaborativeFilteringStrategy(),
            "hybrid": HybridStrategy(),
            "cross_app": CrossAppStrategy()
        }
        
        # Store recommendations
        self._recommendations: Dict[str, UserRecommendation] = {}
        
        # Cross-sell offers
        self._offers: Dict[str, CrossSellOffer] = {}
        self._initialize_default_offers()
    
    def _initialize_default_offers(self):
        """Initialize default cross-sell offers"""
        now = datetime.utcnow()
        
        # Web to Marketplace
        self.register_offer(CrossSellOffer(
            offer_id="web_to_market_print",
            title="Print Your First 10 Photos",
            description="Special offer for new users - get 20% off photo printing",
            source_app=AppContext.WEB,
            target_app=AppContext.MARKETPLACE,
            discount_percentage=20.0,
            valid_from=now,
            valid_until=now + datetime.timedelta(days=30),
            priority=8
        ))
        
        # Marketplace to Gamification
        self.register_offer(CrossSellOffer(
            offer_id="market_to_gam_points",
            title="Earn Double Points",
            description="Make a purchase and earn double points today!",
            source_app=AppContext.MARKETPLACE,
            target_app=AppContext.GAMIFICATION,
            discount_percentage=0.0,
            free_items=["double_points_boost"],
            valid_from=now,
            valid_until=now + datetime.timedelta(days=7),
            priority=7
        ))
        
        # Booking to Marketplace
        self.register_offer(CrossSellOffer(
            offer_id="booking_to_market_gear",
            title="Photo Gear Bundle",
            description="Bundle deal: Get 15% off gear when you book a session",
            source_app=AppContext.BOOKING,
            target_app=AppContext.MARKETPLACE,
            discount_percentage=15.0,
            valid_from=now,
            valid_until=now + datetime.timedelta(days=14),
            priority=6
        ))
        
        # Any to Booking
        self.register_offer(CrossSellOffer(
            offer_id="any_to_booking_session",
            title="First Session Discount",
            description="Book your first photo session for 25% off",
            source_app=AppContext.WEB,
            target_app=AppContext.BOOKING,
            discount_percentage=25.0,
            valid_from=now,
            valid_until=now + datetime.timedelta(days=60),
            priority=9
        ))
    
    def register_strategy(self, name: str, strategy: BaseRecommendationStrategy) -> None:
        """Register a new recommendation strategy"""
        self.strategies[name] = strategy
    
    def register_offer(self, offer: CrossSellOffer) -> None:
        """Register a cross-sell offer"""
        self._offers[offer.offer_id] = offer
    
    def get_offer(self, offer_id: str) -> Optional[CrossSellOffer]:
        """Get offer by ID"""
        return self._offers.get(offer_id)
    
    async def generate_recommendations(
        self,
        context: RecommendationContext,
        recommendation_type: RecommendationType = RecommendationType.PERSONALIZED,
        strategy_name: str = "hybrid",
        limit: int = 10
    ) -> UserRecommendation:
        """
        Generate recommendations for a user
        
        Args:
            context: Recommendation context
            recommendation_type: Type of recommendation
            strategy_name: Strategy to use
            limit: Maximum number of recommendations
            
        Returns:
            UserRecommendation with generated items
        """
        # Get strategy
        strategy = self.strategies.get(strategy_name)
        if not strategy:
            strategy = self.strategies["hybrid"]
        
        # Generate recommendations
        items = await strategy.generate(context, limit)
        
        # Create recommendation
        recommendation = UserRecommendation(
            recommendation_id=str(uuid4()),
            user_id=context.user_id,
            recommendation_type=recommendation_type,
            items=items,
            context=context,
            strategy_used=strategy_name
        )
        
        # Store recommendation
        self._recommendations[recommendation.recommendation_id] = recommendation
        
        # Publish event
        if self.event_publisher:
            await self.event_publisher.publish_recommendation_generated(
                user_id=context.user_id,
                recommendation_type=recommendation_type,
                items=items,
                context=context.model_dump(),
                source_app=context.current_app.value
            )
        
        return recommendation
    
    async def generate_cross_sell_recommendations(
        self,
        user_id: str,
        source_app: AppContext,
        target_apps: Optional[List[AppContext]] = None,
        limit: int = 5
    ) -> List[tuple[RecommendationItem, Optional[CrossSellOffer]]]:
        """
        Generate cross-sell recommendations
        
        Args:
            user_id: User ID
            source_app: Source app
            target_apps: Target apps (all if None)
            limit: Maximum recommendations per target app
            
        Returns:
            List of (recommendation, offer) tuples
        """
        recommendations = []
        
        # Determine target apps
        if target_apps is None:
            target_apps = [app for app in AppContext if app != source_app]
        
        for target_app in target_apps:
            # Create context for cross-app recommendations
            context = RecommendationContext(
                user_id=user_id,
                current_app=source_app,
                target_apps=[target_app]
            )
            
            # Use cross-app strategy
            items = await self.strategies["cross_app"].generate(context, limit)
            
            # Find applicable offers
            for item in items:
                offer = self._find_applicable_offer(source_app, target_app)
                recommendations.append((item, offer))
        
        return recommendations
    
    def _find_applicable_offer(
        self,
        source_app: AppContext,
        target_app: AppContext
    ) -> Optional[CrossSellOffer]:
        """Find an applicable offer for cross-app recommendation"""
        now = datetime.utcnow()
        
        applicable_offers = [
            offer for offer in self._offers.values()
            if offer.source_app == source_app
            and offer.target_app == target_app
            and offer.valid_from <= now
            and offer.valid_until > now
        ]
        
        # Return highest priority offer
        if applicable_offers:
            return max(applicable_offers, key=lambda o: o.priority)
        
        return None
    
    async def record_click(
        self,
        user_id: str,
        recommendation_id: str,
        item_id: str
    ) -> None:
        """
        Record that a user clicked on a recommendation
        
        Args:
            user_id: User ID
            recommendation_id: Recommendation ID
            item_id: Item ID that was clicked
        """
        # Update recommendation
        if recommendation_id in self._recommendations:
            recommendation = self._recommendations[recommendation_id]
            if item_id not in recommendation.items_clicked:
                recommendation.items_clicked.append(item_id)
        
        # Publish event
        if self.event_publisher:
            await self.event_publisher.publish_recommendation_clicked(
                user_id=user_id,
                item_id=item_id,
                recommendation_id=recommendation_id
            )
    
    async def record_conversion(
        self,
        user_id: str,
        recommendation_id: str,
        item_id: str
    ) -> None:
        """
        Record that a user converted (purchased/booked) a recommendation
        
        Args:
            user_id: User ID
            recommendation_id: Recommendation ID
            item_id: Item ID that converted
        """
        # Update recommendation
        if recommendation_id in self._recommendations:
            recommendation = self._recommendations[recommendation_id]
            if item_id not in recommendation.conversion_items:
                recommendation.conversion_items.append(item_id)
        
        # Update offer stats if applicable
        for offer in self._offers.values():
            if item_id in offer.required_items:
                offer.times_accepted += 1
                if offer.times_shown > 0:
                    offer.conversion_rate = offer.times_accepted / offer.times_shown
    
    def get_recommendation(
        self,
        recommendation_id: str
    ) -> Optional[UserRecommendation]:
        """Get recommendation by ID"""
        return self._recommendations.get(recommendation_id)
    
    def get_user_recommendations(
        self,
        user_id: str,
        limit: int = 10
    ) -> List[UserRecommendation]:
        """Get recommendations for a user"""
        recommendations = [
            rec for rec in self._recommendations.values()
            if rec.user_id == user_id
        ]
        recommendations.sort(key=lambda r: r.generated_at, reverse=True)
        return recommendations[:limit]
    
    def get_available_strategies(self) -> List[str]:
        """Get list of available strategies"""
        return list(self.strategies.keys())
