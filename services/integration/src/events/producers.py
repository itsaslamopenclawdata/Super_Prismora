"""
Event Producer for Kafka
Publishes events to Kafka topics
"""
import asyncio
import json
from typing import Dict, Any, Optional, Callable
from aiokafka import AIOKafkaProducer
from aiokafka.errors import KafkaError
from dataclasses import dataclass
import logging

from .registry import EventRegistry, EventType, EventMetadata
from .schemas import EventSchema


logger = logging.getLogger(__name__)


@dataclass
class ProducerConfig:
    """Kafka producer configuration"""
    bootstrap_servers: str = "localhost:9092"
    client_id: str = "integration-service"
    acks: str = "all"
    compression_type: str = "snappy"
    retries: int = 3
    max_in_flight_requests_per_connection: int = 1
    enable_idempotence: bool = True


class EventProducer:
    """
    Kafka event producer with schema validation
    """
    
    def __init__(
        self,
        config: ProducerConfig,
        event_registry: EventRegistry,
        schema_registry: Optional[EventSchema] = None
    ):
        self.config = config
        self.event_registry = event_registry
        self.schema_registry = schema_registry
        self._producer: Optional[AIOKafkaProducer] = None
        self._callbacks: Dict[str, Callable] = {}
    
    async def start(self):
        """Start the Kafka producer"""
        if self._producer is None:
            self._producer = AIOKafkaProducer(
                bootstrap_servers=self.config.bootstrap_servers,
                client_id=self.config.client_id,
                acks=self.config.acks,
                compression_type=self.config.compression_type,
                retries=self.config.retries,
                max_in_flight_requests_per_connection=self.config.max_in_flight_requests_per_connection,
                enable_idempotence=self.config.enable_idempotence,
                value_serializer=lambda v: json.dumps(v).encode('utf-8')
            )
            await self._producer.start()
            logger.info("Kafka producer started")
    
    async def stop(self):
        """Stop the Kafka producer"""
        if self._producer:
            await self._producer.stop()
            self._producer = None
            logger.info("Kafka producer stopped")
    
    async def produce_event(
        self,
        event_type: EventType,
        payload: Dict[str, Any],
        metadata: EventMetadata,
        key: Optional[str] = None
    ) -> bool:
        """
        Produce an event to Kafka
        
        Args:
            event_type: Type of event to produce
            payload: Event data payload
            metadata: Event metadata
            key: Optional partition key
            
        Returns:
            bool: True if event was produced successfully
        """
        if not self._producer:
            raise RuntimeError("Producer not started. Call start() first.")
        
        # Validate event against schema
        if not self.event_registry.validate_event(event_type, payload):
            logger.error(f"Event validation failed for {event_type}")
            return False
        
        # Get topic for event type
        topic = self.event_registry.get_topic_for_event(event_type)
        if not topic:
            logger.error(f"No topic found for event type {event_type}")
            return False
        
        # Construct event message
        event_message = {
            "metadata": metadata.model_dump(),
            "data": payload
        }
        
        try:
            # Send event
            await self._producer.send_and_wait(
                topic,
                value=event_message,
                key=key.encode('utf-8') if key else None
            )
            
            logger.info(
                f"Event produced: {event_type} to topic {topic} "
                f"(event_id: {metadata.event_id})"
            )
            
            # Execute callbacks
            callback = self._callbacks.get(str(event_type))
            if callback:
                await callback(event_message)
            
            return True
            
        except KafkaError as e:
            logger.error(f"Failed to produce event {event_type}: {e}")
            return False
    
    async def produce_batch(
        self,
        events: list[tuple[EventType, Dict[str, Any], EventMetadata, Optional[str]]]
    ) -> Dict[str, bool]:
        """
        Produce multiple events in batch
        
        Args:
            events: List of (event_type, payload, metadata, key) tuples
            
        Returns:
            Dict mapping event_id to success status
        """
        if not self._producer:
            raise RuntimeError("Producer not started. Call start() first.")
        
        results = {}
        
        for event_type, payload, metadata, key in events:
            event_id = metadata.event_id
            results[event_id] = await self.produce_event(
                event_type, payload, metadata, key
            )
        
        return results
    
    def register_callback(self, event_type: EventType, callback: Callable):
        """Register a callback to be called after event is produced"""
        self._callbacks[str(event_type)] = callback
    
    async def health_check(self) -> bool:
        """Check if producer is healthy"""
        return self._producer is not None


class UserEventProducer(EventProducer):
    """Specialized producer for user events"""
    
    async def publish_user_created(
        self,
        user_id: str,
        email: str,
        username: str,
        profile: Dict[str, Any],
        source_app: str
    ) -> bool:
        """Publish user created event"""
        from uuid import uuid4
        
        metadata = EventMetadata(
            event_id=str(uuid4()),
            event_type=EventType.USER_CREATED,
            source_app=source_app,
            user_id=user_id
        )
        
        payload = {
            "user_id": user_id,
            "email": email,
            "username": username,
            "created_at": metadata.timestamp.isoformat(),
            "profile": profile
        }
        
        return await self.produce_event(EventType.USER_CREATED, payload, metadata, user_id)
    
    async def publish_user_profile_sync(
        self,
        user_id: str,
        profile_data: Dict[str, Any],
        apps_involved: list[str],
        source_app: str
    ) -> bool:
        """Publish user profile sync event"""
        from uuid import uuid4
        
        metadata = EventMetadata(
            event_id=str(uuid4()),
            event_type=EventType.USER_PROFILE_SYNC,
            source_app=source_app,
            user_id=user_id
        )
        
        payload = {
            "user_id": user_id,
            "profile_data": profile_data,
            "sync_timestamp": metadata.timestamp.isoformat(),
            "apps_involved": apps_involved
        }
        
        return await self.produce_event(
            EventType.USER_PROFILE_SYNC, payload, metadata, user_id
        )


class GamificationEventProducer(EventProducer):
    """Specialized producer for gamification events"""
    
    async def publish_achievement_unlocked(
        self,
        user_id: str,
        achievement_id: str,
        achievement_name: str,
        description: str,
        points_awarded: int,
        badge_url: str,
        source_app: str
    ) -> bool:
        """Publish achievement unlocked event"""
        from uuid import uuid4
        
        metadata = EventMetadata(
            event_id=str(uuid4()),
            event_type=EventType.ACHIEVEMENT_UNLOCKED,
            source_app=source_app,
            user_id=user_id
        )
        
        payload = {
            "user_id": user_id,
            "achievement_id": achievement_id,
            "achievement_name": achievement_name,
            "description": description,
            "points_awarded": points_awarded,
            "badge_url": badge_url,
            "unlocked_at": metadata.timestamp.isoformat()
        }
        
        return await self.produce_event(
            EventType.ACHIEVEMENT_UNLOCKED, payload, metadata, user_id
        )
    
    async def publish_points_earned(
        self,
        user_id: str,
        points: int,
        source: str,
        reason: str,
        total_points: int,
        source_app: str
    ) -> bool:
        """Publish points earned event"""
        from uuid import uuid4
        
        metadata = EventMetadata(
            event_id=str(uuid4()),
            event_type=EventType.POINTS_EARNED,
            source_app=source_app,
            user_id=user_id
        )
        
        payload = {
            "user_id": user_id,
            "points": points,
            "source": source,
            "reason": reason,
            "total_points": total_points
        }
        
        return await self.produce_event(
            EventType.POINTS_EARNED, payload, metadata, user_id
        )


class RecommendationEventProducer(EventProducer):
    """Specialized producer for recommendation events"""
    
    async def publish_cross_sell_suggested(
        self,
        user_id: str,
        source_app: str,
        target_app: str,
        offer: Dict[str, Any],
        context: Dict[str, Any]
    ) -> bool:
        """Publish cross-sell suggestion event"""
        from uuid import uuid4
        
        metadata = EventMetadata(
            event_id=str(uuid4()),
            event_type=EventType.CROSS_SELL_SUGGESTED,
            source_app=source_app,
            user_id=user_id
        )
        
        payload = {
            "user_id": user_id,
            "source_app": source_app,
            "target_app": target_app,
            "offer": offer,
            "context": context
        }
        
        return await self.produce_event(
            EventType.CROSS_SELL_SUGGESTED, payload, metadata, user_id
        )
