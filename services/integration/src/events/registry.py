"""
Kafka Event Registry
Central registry for all cross-app events with schema validation
"""
from typing import Dict, List, Optional, Any, Type
from enum import Enum
from datetime import datetime
from dataclasses import dataclass, field
from pydantic import BaseModel, Field
import json


class EventType(str, Enum):
    """Standard event types across all apps"""
    # User Events
    USER_CREATED = "user.created"
    USER_UPDATED = "user.updated"
    USER_DELETED = "user.deleted"
    USER_PROFILE_SYNC = "user.profile_sync"
    
    # Photo Events
    PHOTO_UPLOADED = "photo.uploaded"
    PHOTO_PROCESSED = "photo.processed"
    PHOTO_TAGGED = "photo.tagged"
    PHOTO_SHARED = "photo.shared"
    
    # Gamification Events
    ACHIEVEMENT_UNLOCKED = "achievement.unlocked"
    POINTS_EARNED = "points.earned"
    LEVEL_UP = "level.up"
    STREAK_STARTED = "streak.started"
    CHALLENGE_COMPLETED = "challenge.completed"
    
    # Recommendation Events
    RECOMMENDATION_GENERATED = "recommendation.generated"
    RECOMMENDATION_CLICKED = "recommendation.clicked"
    CROSS_SELL_SUGGESTED = "cross_sell.suggested"
    
    # Marketplace Events
    PURCHASE_COMPLETED = "purchase.completed"
    LISTING_CREATED = "listing.created"
    LISTING_SOLD = "listing.sold"
    
    # Booking Events
    BOOKING_CREATED = "booking.created"
    BOOKING_CONFIRMED = "booking.confirmed"
    BOOKING_CANCELLED = "booking.cancelled"
    
    # Notification Events
    NOTIFICATION_SENT = "notification.sent"
    NOTIFICATION_READ = "notification.read"
    
    # GDPR/CCPA Events
    DATA_EXPORT_REQUESTED = "data_export.requested"
    DATA_EXPORT_COMPLETED = "data_export.completed"
    DATA_DELETION_REQUESTED = "data_deletion.requested"
    DATA_DELETION_COMPLETED = "data_deletion.completed"


@dataclass
class EventSchema:
    """Schema definition for events"""
    name: str
    version: str
    schema_type: str  # "json" or "avro"
    schema_definition: Dict[str, Any]
    topic: str
    description: str = ""


class EventMetadata(BaseModel):
    """Standard metadata for all events"""
    event_id: str = Field(..., description="Unique event identifier")
    event_type: EventType = Field(..., description="Type of the event")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Event timestamp")
    source_app: str = Field(..., description="Application that generated the event")
    correlation_id: Optional[str] = Field(None, description="Correlation ID for tracing")
    causation_id: Optional[str] = Field(None, description="ID of event that caused this event")
    user_id: Optional[str] = Field(None, description="User ID if applicable")
    version: str = Field(default="1.0", description="Event schema version")
    
    model_config = {"json_encoders": {datetime: lambda v: v.isoformat()}}


class EventRegistry:
    """
    Central event registry for all cross-app events
    Manages event schemas, topics, and validation
    """
    
    def __init__(self):
        self._schemas: Dict[str, EventSchema] = {}
        self._event_types: Dict[EventType, str] = {}
        self._initialize_default_schemas()
    
    def _initialize_default_schemas(self):
        """Initialize default event schemas"""
        
        # User Events
        self.register_schema(EventSchema(
            name="user.created",
            version="1.0",
            schema_type="json",
            schema_definition={
                "type": "object",
                "properties": {
                    "user_id": {"type": "string"},
                    "email": {"type": "string"},
                    "username": {"type": "string"},
                    "created_at": {"type": "string", "format": "date-time"},
                    "profile": {
                        "type": "object",
                        "properties": {
                            "first_name": {"type": "string"},
                            "last_name": {"type": "string"},
                            "avatar_url": {"type": "string"},
                            "preferences": {"type": "object"}
                        }
                    }
                },
                "required": ["user_id", "email", "username"]
            },
            topic="users.events",
            description="User account creation event"
        ))
        
        self.register_schema(EventSchema(
            name="user.profile_sync",
            version="1.0",
            schema_type="json",
            schema_definition={
                "type": "object",
                "properties": {
                    "user_id": {"type": "string"},
                    "profile_data": {"type": "object"},
                    "sync_timestamp": {"type": "string", "format": "date-time"},
                    "apps_involved": {"type": "array", "items": {"type": "string"}}
                },
                "required": ["user_id", "profile_data", "sync_timestamp"]
            },
            topic="users.sync",
            description="User profile synchronization event"
        ))
        
        # Gamification Events
        self.register_schema(EventSchema(
            name="achievement.unlocked",
            version="1.0",
            schema_type="json",
            schema_definition={
                "type": "object",
                "properties": {
                    "user_id": {"type": "string"},
                    "achievement_id": {"type": "string"},
                    "achievement_name": {"type": "string"},
                    "description": {"type": "string"},
                    "points_awarded": {"type": "integer"},
                    "badge_url": {"type": "string"},
                    "unlocked_at": {"type": "string", "format": "date-time"}
                },
                "required": ["user_id", "achievement_id", "achievement_name"]
            },
            topic="gamification.events",
            description="Achievement unlocked event"
        ))
        
        self.register_schema(EventSchema(
            name="points.earned",
            version="1.0",
            schema_type="json",
            schema_definition={
                "type": "object",
                "properties": {
                    "user_id": {"type": "string"},
                    "points": {"type": "integer"},
                    "source": {"type": "string"},
                    "reason": {"type": "string"},
                    "total_points": {"type": "integer"}
                },
                "required": ["user_id", "points", "source"]
            },
            topic="gamification.events",
            description="Points earned event"
        ))
        
        # Recommendation Events
        self.register_schema(EventSchema(
            name="recommendation.generated",
            version="1.0",
            schema_type="json",
            schema_definition={
                "type": "object",
                "properties": {
                    "user_id": {"type": "string"},
                    "recommendation_type": {"type": "string"},
                    "items": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "item_id": {"type": "string"},
                                "item_type": {"type": "string"},
                                "score": {"type": "number"},
                                "reason": {"type": "string"}
                            }
                        }
                    },
                    "model_version": {"type": "string"},
                    "generated_at": {"type": "string", "format": "date-time"}
                },
                "required": ["user_id", "recommendation_type", "items"]
            },
            topic="recommendations.events",
            description="Recommendation generated event"
        ))
        
        self.register_schema(EventSchema(
            name="cross_sell.suggested",
            version="1.0",
            schema_type="json",
            schema_definition={
                "type": "object",
                "properties": {
                    "user_id": {"type": "string"},
                    "source_app": {"type": "string"},
                    "target_app": {"type": "string"},
                    "offer": {
                        "type": "object",
                        "properties": {
                            "offer_id": {"type": "string"},
                            "title": {"type": "string"},
                            "description": {"type": "string"},
                            "discount_percentage": {"type": "number"},
                            "valid_until": {"type": "string", "format": "date-time"}
                        }
                    },
                    "context": {"type": "object"}
                },
                "required": ["user_id", "source_app", "target_app", "offer"]
            },
            topic="cross_sell.events",
            description="Cross-sell suggestion event"
        ))
        
        # Data Export Events (GDPR/CCPA)
        self.register_schema(EventSchema(
            name="data_export.requested",
            version="1.0",
            schema_type="json",
            schema_definition={
                "type": "object",
                "properties": {
                    "request_id": {"type": "string"},
                    "user_id": {"type": "string"},
                    "requested_at": {"type": "string", "format": "date-time"},
                    "data_types": {
                        "type": "array",
                        "items": {"type": "string"},
                        "enum": ["profile", "photos", "purchases", "bookings", "activity", "preferences"]
                    },
                    "format": {"type": "string", "enum": ["json", "csv"]},
                    "jurisdiction": {"type": "string", "enum": ["GDPR", "CCPA"]}
                },
                "required": ["request_id", "user_id", "data_types", "format"]
            },
            topic="privacy.events",
            description="Data export request event"
        ))
        
        self.register_schema(EventSchema(
            name="data_export.completed",
            version="1.0",
            schema_type="json",
            schema_definition={
                "type": "object",
                "properties": {
                    "request_id": {"type": "string"},
                    "user_id": {"type": "string"},
                    "export_url": {"type": "string"},
                    "expires_at": {"type": "string", "format": "date-time"},
                    "file_size_bytes": {"type": "integer"},
                    "record_count": {"type": "integer"}
                },
                "required": ["request_id", "user_id", "export_url", "expires_at"]
            },
            topic="privacy.events",
            description="Data export completed event"
        ))
        
        # Map event types to schemas
        for schema in self._schemas.values():
            try:
                event_type = EventType(schema.name)
                self._event_types[event_type] = schema.name
            except ValueError:
                pass
    
    def register_schema(self, schema: EventSchema) -> None:
        """Register a new event schema"""
        key = f"{schema.name}:{schema.version}"
        self._schemas[key] = schema
    
    def get_schema(self, event_name: str, version: str = "1.0") -> Optional[EventSchema]:
        """Get event schema by name and version"""
        key = f"{event_name}:{version}"
        return self._schemas.get(key)
    
    def get_schema_for_event_type(self, event_type: EventType) -> Optional[EventSchema]:
        """Get schema for a specific event type"""
        schema_name = self._event_types.get(event_type)
        if schema_name:
            return self._schemas.get(f"{schema_name}:1.0")
        return None
    
    def get_topic_for_event(self, event_type: EventType) -> Optional[str]:
        """Get Kafka topic for an event type"""
        schema = self.get_schema_for_event_type(event_type)
        return schema.topic if schema else None
    
    def validate_event(self, event_type: EventType, data: Dict[str, Any]) -> bool:
        """Validate event data against its schema"""
        schema = self.get_schema_for_event_type(event_type)
        if not schema:
            return False
        
        # Basic validation (in production, use jsonschema or avro validation)
        required = schema.schema_definition.get("required", [])
        return all(field in data for field in required)
    
    def list_all_schemas(self) -> List[EventSchema]:
        """List all registered schemas"""
        return list(self._schemas.values())
    
    def list_event_types(self) -> List[EventType]:
        """List all supported event types"""
        return list(self._event_types.keys())
