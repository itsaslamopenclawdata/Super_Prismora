"""
Recommendation Models
"""
from typing import Dict, Any, Optional, List
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field


class RecommendationType(str, Enum):
    """Types of recommendations"""
    CROSS_SELL = "cross_sell"
    UPSELL = "upsell"
    SIMILAR_ITEMS = "similar_items"
    TRENDING = "trending"
    PERSONALIZED = "personalized"
    NEW_ARRIVALS = "new_arrivals"


class AppContext(str, Enum):
    """Application context"""
    WEB = "web"
    MARKETPLACE = "marketplace"
    BOOKING = "booking"
    GAMIFICATION = "gamification"


class RecommendationItem(BaseModel):
    """Single recommendation item"""
    item_id: str = Field(..., description="Item ID")
    item_type: str = Field(..., description="Type of item (product, service, feature, etc.)")
    title: str = Field(..., description="Item title")
    description: Optional[str] = Field(None, description="Item description")
    
    # Scoring
    score: float = Field(..., description="Recommendation score (0-1)")
    confidence: float = Field(default=0.5, description="Confidence in recommendation")
    
    # Target
    target_app: AppContext = Field(..., description="Target app")
    target_url: Optional[str] = Field(None, description="URL for the item")
    
    # Pricing (if applicable)
    price: Optional[float] = Field(None, description="Price (if applicable)")
    discount_percentage: Optional[float] = Field(None, description="Discount percentage")
    
    # Image
    image_url: Optional[str] = Field(None, description="Item image URL")
    
    # Metadata
    metadata: Dict[str, Any] = Field(default_factory=dict)
    reason: str = Field(default="", description="Why this was recommended")


class CrossSellOffer(BaseModel):
    """Cross-sell offer"""
    offer_id: str = Field(..., description="Offer ID")
    title: str = Field(..., description="Offer title")
    description: str = Field(..., description="Offer description")
    
    # Target
    source_app: AppContext = Field(..., description="Source app")
    target_app: AppContext = Field(..., description="Target app")
    
    # Offer details
    discount_percentage: float = Field(default=0.0, description="Discount percentage")
    discount_amount: Optional[float] = Field(None, description="Fixed discount amount")
    free_items: List[str] = Field(default_factory=list, description="Free items included")
    
    # Validity
    valid_from: datetime = Field(default_factory=datetime.utcnow)
    valid_until: datetime = Field(..., description="Offer expiration")
    
    # Conditions
    min_purchase: Optional[float] = Field(None, description="Minimum purchase required")
    required_items: List[str] = Field(default_factory=list, description="Required items")
    
    # Tracking
    times_shown: int = Field(default=0, description="Times this offer was shown")
    times_accepted: int = Field(default=0, description="Times this offer was accepted")
    conversion_rate: float = Field(default=0.0, description="Conversion rate")
    
    # Priority
    priority: int = Field(default=5, description="Priority (higher = more important)")


class RecommendationContext(BaseModel):
    """Context for recommendation generation"""
    user_id: str = Field(..., description="User ID")
    current_app: AppContext = Field(..., description="Current app")
    
    # User state
    user_profile: Optional[Dict[str, Any]] = Field(None, description="User profile data")
    user_history: List[Dict[str, Any]] = Field(default_factory=list, description="User's history")
    user_preferences: Dict[str, Any] = Field(default_factory=dict)
    
    # Current context
    current_action: str = Field(default="", description="User's current action")
    current_item_id: Optional[str] = Field(None, description="Current item being viewed")
    current_category: Optional[str] = Field(None, description="Current category")
    
    # Time context
    time_of_day: Optional[str] = Field(None, description="Time of day")
    day_of_week: Optional[str] = Field(None, description="Day of week")
    
    # Session info
    session_id: Optional[str] = Field(None, description="Session ID")
    page_views: int = Field(default=0, description="Pages viewed this session")
    
    # Target apps (if filtering)
    target_apps: Optional[List[AppContext]] = Field(None, description="Apps to recommend for")


class UserRecommendation(BaseModel):
    """User recommendation result"""
    recommendation_id: str = Field(..., description="Recommendation ID")
    user_id: str = Field(..., description="User ID")
    recommendation_type: RecommendationType = Field(..., description="Type of recommendation")
    
    # Items
    items: List[RecommendationItem] = Field(default_factory=list, description="Recommended items")
    
    # Context
    context: RecommendationContext = Field(..., description="Context used for generation")
    
    # Generation info
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    model_version: str = Field(default="1.0", description="Model version used")
    strategy_used: str = Field(default="", description="Strategy used")
    
    # Tracking
    shown_to_user: bool = Field(default=False, description="Was this shown to user?")
    items_clicked: List[str] = Field(default_factory=list, description="Items clicked by user")
    conversion_items: List[str] = Field(default_factory=list, description="Items that converted")
    
    # Performance
    click_through_rate: float = Field(default=0.0, description="Click-through rate")
    conversion_rate: float = Field(default=0.0, description="Conversion rate")


class RecommendationFeedback(BaseModel):
    """Feedback on recommendations"""
    feedback_id: str = Field(..., description="Feedback ID")
    user_id: str = Field(..., description="User ID")
    recommendation_id: str = Field(..., description="Recommendation ID")
    item_id: str = Field(..., description="Item ID")
    
    # Feedback type
    feedback_type: str = Field(..., description="Type: click, view, hide, purchase, skip")
    rating: Optional[int] = Field(None, description="Rating (1-5)")
    
    # Context
    shown_at: datetime = Field(..., description="When was this shown")
    feedback_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Additional data
    metadata: Dict[str, Any] = Field(default_factory=dict)


class RecommendationModel(BaseModel):
    """Recommendation model configuration"""
    model_id: str = Field(..., description="Model ID")
    model_name: str = Field(..., description="Model name")
    model_type: str = Field(..., description="Type: collaborative, content, hybrid")
    
    # Configuration
    parameters: Dict[str, Any] = Field(default_factory=dict)
    
    # Performance
    accuracy: float = Field(default=0.0, description="Model accuracy")
    precision: float = Field(default=0.0, description="Model precision")
    recall: float = Field(default=0.0, description="Model recall")
    
    # Deployment
    is_active: bool = Field(default=True, description="Is model active?")
    deployed_at: Optional[datetime] = Field(None, description="Deployment timestamp")
    
    # Target
    target_app: Optional[AppContext] = Field(None, description="Target app")
    target_type: Optional[RecommendationType] = Field(None, description="Target recommendation type")
