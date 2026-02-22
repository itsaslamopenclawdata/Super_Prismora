"""
Event Registry for Cross-App Integration
Supports JSON Schema and Avro serialization
"""
from .registry import EventRegistry, EventType
from .schemas import EventSchema, JsonSchemaRegistry, AvroSchemaRegistry
from .producers import EventProducer
from .consumers import EventConsumer

__all__ = [
    "EventRegistry",
    "EventType",
    "EventSchema",
    "JsonSchemaRegistry",
    "AvroSchemaRegistry",
    "EventProducer",
    "EventConsumer",
]
