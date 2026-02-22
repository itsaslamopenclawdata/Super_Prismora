"""
Cross-Selling Recommendation Engine
Provides personalized recommendations across apps
"""
from .engine import RecommendationEngine
from .models import (
    UserRecommendation,
    RecommendationItem,
    RecommendationContext,
    CrossSellOffer,
    RecommendationType
)
from .strategies import (
    BaseRecommendationStrategy,
    CollaborativeFilteringStrategy,
    ContentBasedStrategy,
    HybridStrategy,
    CrossAppStrategy
)
from .events import RecommendationEventPublisher

__all__ = [
    "RecommendationEngine",
    "UserRecommendation",
    "RecommendationItem",
    "RecommendationContext",
    "CrossSellOffer",
    "RecommendationType",
    "BaseRecommendationStrategy",
    "CollaborativeFilteringStrategy",
    "ContentBasedStrategy",
    "HybridStrategy",
    "CrossAppStrategy",
    "RecommendationEventPublisher",
]
