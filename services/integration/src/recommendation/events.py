"""
Recommendation Event Publisher
Publishes recommendation events to Kafka
"""
from typing import Dict, Any, List
from datetime import datetime

from ..events.producers import RecommendationEventProducer
from ..events.registry import EventMetadata, EventType
from .models import (
    UserRecommendation,
    RecommendationItem,
    CrossSellOffer,
    RecommendationType
)


class RecommendationEventPublisher:
    """
    Publishes recommendation events to Kafka
    """
    
    def __init__(self, producer: RecommendationEventProducer):
        self.producer = producer
    
    async def publish_recommendation_generated(
        self,
        user_id: str,
        recommendation_type: RecommendationType,
        items: List[RecommendationItem],
        context: Dict[str, Any],
        source_app: str = "web"
    ) -> bool:
        """
        Publish recommendation generated event
        
        Args:
            user_id: User ID
            recommendation_type: Type of recommendation
            items: Recommended items
            context: Recommendation context
            source_app: Source application
            
        Returns:
            True if published successfully
        """
        from uuid import uuid4
        
        metadata = EventMetadata(
            event_id=str(uuid4()),
            event_type=EventType.RECOMMENDATION_GENERATED,
            source_app=source_app,
            user_id=user_id
        )
        
        items_data = [
            {
                "item_id": item.item_id,
                "item_type": item.item_type,
                "title": item.title,
                "score": item.score,
                "target_app": item.target_app.value,
                "reason": item.reason
            }
            for item in items
        ]
        
        payload = {
            "user_id": user_id,
            "recommendation_type": recommendation_type.value,
            "items": items_data,
            "model_version": "1.0",
            "generated_at": datetime.utcnow().isoformat(),
            "context": context
        }
        
        return await self.producer.produce_event(
            EventType.RECOMMENDATION_GENERATED, payload, metadata, user_id
        )
    
    async def publish_recommendation_clicked(
        self,
        user_id: str,
        item_id: str,
        recommendation_id: str,
        source_app: str = "web"
    ) -> bool:
        """
        Publish recommendation clicked event
        
        Args:
            user_id: User ID
            item_id: Item ID that was clicked
            recommendation_id: Recommendation ID
            source_app: Source application
            
        Returns:
            True if published successfully
        """
        from uuid import uuid4
        
        metadata = EventMetadata(
            event_id=str(uuid4()),
            event_type=EventType.RECOMMENDATION_CLICKED,
            source_app=source_app,
            user_id=user_id
        )
        
        payload = {
            "user_id": user_id,
            "item_id": item_id,
            "recommendation_id": recommendation_id,
            "clicked_at": datetime.utcnow().isoformat()
        }
        
        return await self.producer.produce_event(
            EventType.RECOMMENDATION_CLICKED, payload, metadata, user_id
        )
    
    async def publish_cross_sell_suggested(
        self,
        user_id: str,
        source_app: str,
        target_app: str,
        offer: CrossSellOffer,
        context: Dict[str, Any]
    ) -> bool:
        """
        Publish cross-sell suggestion event
        
        Args:
            user_id: User ID
            source_app: Source app
            target_app: Target app
            offer: Cross-sell offer
            context: Context data
            
        Returns:
            True if published successfully
        """
        return await self.producer.publish_cross_sell_suggested(
            user_id=user_id,
            source_app=source_app,
            target_app=target_app,
            offer={
                "offer_id": offer.offer_id,
                "title": offer.title,
                "description": offer.description,
                "discount_percentage": offer.discount_percentage,
                "discount_amount": offer.discount_amount,
                "valid_until": offer.valid_until.isoformat()
            },
            context=context
        )
