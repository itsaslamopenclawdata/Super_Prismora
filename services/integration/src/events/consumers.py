"""
Event Consumer for Kafka
Consumes events from Kafka topics
"""
import asyncio
import json
import logging
from typing import Dict, Any, Optional, Callable, List
from aiokafka import AIOKafkaConsumer
from aiokafka.errors import KafkaError
from dataclasses import dataclass

from .registry import EventRegistry, EventType, EventMetadata


logger = logging.getLogger(__name__)


@dataclass
class ConsumerConfig:
    """Kafka consumer configuration"""
    bootstrap_servers: str = "localhost:9092"
    group_id: str = "integration-service-group"
    client_id: str = "integration-service-consumer"
    auto_offset_reset: str = "earliest"
    enable_auto_commit: bool = True
    max_poll_records: int = 100
    session_timeout_ms: int = 30000


class EventConsumer:
    """
    Kafka event consumer with event routing
    """
    
    def __init__(
        self,
        config: ConsumerConfig,
        event_registry: EventRegistry
    ):
        self.config = config
        self.event_registry = event_registry
        self._consumer: Optional[AIOKafkaConsumer] = None
        self._handlers: Dict[EventType, Callable] = {}
        self._running = False
    
    async def start(self, topics: List[str]):
        """Start the Kafka consumer"""
        if self._consumer is None:
            self._consumer = AIOKafkaConsumer(
                *topics,
                bootstrap_servers=self.config.bootstrap_servers,
                group_id=self.config.group_id,
                client_id=self.config.client_id,
                auto_offset_reset=self.config.auto_offset_reset,
                enable_auto_commit=self.config.enable_auto_commit,
                max_poll_records=self.config.max_poll_records,
                session_timeout_ms=self.config.session_timeout_ms,
                value_deserializer=lambda m: json.loads(m.decode('utf-8'))
            )
            await self._consumer.start()
            logger.info(f"Kafka consumer started for topics: {topics}")
    
    async def stop(self):
        """Stop the Kafka consumer"""
        self._running = False
        if self._consumer:
            await self._consumer.stop()
            self._consumer = None
            logger.info("Kafka consumer stopped")
    
    def register_handler(self, event_type: EventType, handler: Callable):
        """Register a handler for a specific event type"""
        self._handlers[event_type] = handler
        logger.info(f"Handler registered for {event_type}")
    
    async def consume(self):
        """Start consuming events"""
        if not self._consumer:
            raise RuntimeError("Consumer not started. Call start() first.")
        
        self._running = True
        logger.info("Starting event consumption loop")
        
        try:
            async for message in self._consumer:
                if not self._running:
                    break
                
                try:
                    await self._process_message(message)
                except Exception as e:
                    logger.error(f"Error processing message: {e}")
                    
        except Exception as e:
            logger.error(f"Consumer error: {e}")
        finally:
            logger.info("Event consumption loop stopped")
    
    async def _process_message(self, message):
        """Process a single message"""
        try:
            value = message.value
            
            # Extract metadata
            metadata_dict = value.get("metadata", {})
            metadata = EventMetadata(**metadata_dict)
            
            # Get event type
            event_type = metadata.event_type
            
            # Get payload
            payload = value.get("data", {})
            
            logger.info(
                f"Processing event: {event_type} "
                f"(event_id: {metadata.event_id}, user_id: {metadata.user_id})"
            )
            
            # Call handler if registered
            handler = self._handlers.get(event_type)
            if handler:
                if asyncio.iscoroutinefunction(handler):
                    await handler(payload, metadata)
                else:
                    handler(payload, metadata)
            else:
                logger.warning(f"No handler registered for {event_type}")
                
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            raise
    
    async def consume_batch(self, max_messages: int = 10) -> List[Dict[str, Any]]:
        """Consume a batch of messages"""
        if not self._consumer:
            raise RuntimeError("Consumer not started. Call start() first.")
        
        messages = []
        message_count = 0
        
        async for message in self._consumer:
            if message_count >= max_messages:
                break
            
            messages.append({
                "key": message.key,
                "value": message.value,
                "topic": message.topic,
                "partition": message.partition,
                "offset": message.offset
            })
            message_count += 1
        
        return messages
    
    async def health_check(self) -> bool:
        """Check if consumer is healthy"""
        return self._consumer is not None and self._running
    
    def list_handlers(self) -> List[EventType]:
        """List all registered handlers"""
        return list(self._handlers.keys())


class UserEventConsumer(EventConsumer):
    """Consumer for user-related events"""
    
    def __init__(self, config: ConsumerConfig, event_registry: EventRegistry):
        super().__init__(config, event_registry)
    
    async def on_user_created(self, handler: Callable):
        """Register handler for user created events"""
        self.register_handler(EventType.USER_CREATED, handler)
    
    async def on_user_profile_sync(self, handler: Callable):
        """Register handler for user profile sync events"""
        self.register_handler(EventType.USER_PROFILE_SYNC, handler)
    
    async def on_user_updated(self, handler: Callable):
        """Register handler for user updated events"""
        self.register_handler(EventType.USER_UPDATED, handler)


class GamificationEventConsumer(EventConsumer):
    """Consumer for gamification events"""
    
    def __init__(self, config: ConsumerConfig, event_registry: EventRegistry):
        super().__init__(config, event_registry)
    
    async def on_achievement_unlocked(self, handler: Callable):
        """Register handler for achievement unlocked events"""
        self.register_handler(EventType.ACHIEVEMENT_UNLOCKED, handler)
    
    async def on_points_earned(self, handler: Callable):
        """Register handler for points earned events"""
        self.register_handler(EventType.POINTS_EARNED, handler)
    
    async def on_level_up(self, handler: Callable):
        """Register handler for level up events"""
        self.register_handler(EventType.LEVEL_UP, handler)


class RecommendationEventConsumer(EventConsumer):
    """Consumer for recommendation events"""
    
    def __init__(self, config: ConsumerConfig, event_registry: EventRegistry):
        super().__init__(config, event_registry)
    
    async def on_cross_sell_suggested(self, handler: Callable):
        """Register handler for cross-sell suggestion events"""
        self.register_handler(EventType.CROSS_SELL_SUGGESTED, handler)
    
    async def on_recommendation_generated(self, handler: Callable):
        """Register handler for recommendation generated events"""
        self.register_handler(EventType.RECOMMENDATION_GENERATED, handler)


class PrivacyEventConsumer(EventConsumer):
    """Consumer for privacy/GDPR/CCPA events"""
    
    def __init__(self, config: ConsumerConfig, event_registry: EventRegistry):
        super().__init__(config, event_registry)
    
    async def on_data_export_requested(self, handler: Callable):
        """Register handler for data export request events"""
        self.register_handler(EventType.DATA_EXPORT_REQUESTED, handler)
    
    async def on_data_deletion_requested(self, handler: Callable):
        """Register handler for data deletion request events"""
        self.register_handler(EventType.DATA_DELETION_REQUESTED, handler)
