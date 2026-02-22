"""
Schema Registry - JSON Schema and Avro support
"""
from typing import Dict, Any, Optional
from jsonschema import validate as jsonschema_validate, ValidationError as JsonSchemaValidationError
import json
import avro.schema
from avro.io import DatumReader, DatumWriter, BinaryEncoder, BinaryDecoder
import io


class JsonSchemaRegistry:
    """JSON Schema validation and serialization"""
    
    def __init__(self):
        self._schemas: Dict[str, Dict[str, Any]] = {}
    
    def register_schema(self, name: str, schema: Dict[str, Any]) -> None:
        """Register a JSON schema"""
        self._schemas[name] = schema
    
    def get_schema(self, name: str) -> Optional[Dict[str, Any]]:
        """Get a JSON schema by name"""
        return self._schemas.get(name)
    
    def validate(self, name: str, data: Dict[str, Any]) -> bool:
        """Validate data against a JSON schema"""
        schema = self.get_schema(name)
        if not schema:
            return False
        
        try:
            jsonschema_validate(instance=data, schema=schema)
            return True
        except JsonSchemaValidationError:
            return False
    
    def serialize(self, data: Dict[str, Any]) -> str:
        """Serialize data to JSON string"""
        return json.dumps(data)
    
    def deserialize(self, json_str: str) -> Dict[str, Any]:
        """Deserialize JSON string to dictionary"""
        return json.loads(json_str)


class AvroSchemaRegistry:
    """Avro schema validation and serialization"""
    
    def __init__(self):
        self._schemas: Dict[str, avro.schema.Schema] = {}
        self._readers: Dict[str, DatumReader] = {}
        self._writers: Dict[str, DatumWriter] = {}
    
    def register_schema(self, name: str, schema_definition: Dict[str, Any]) -> None:
        """Register an Avro schema"""
        schema_json = json.dumps(schema_definition)
        avro_schema = avro.schema.Parse(schema_json)
        self._schemas[name] = avro_schema
        self._readers[name] = DatumReader(avro_schema)
        self._writers[name] = DatumWriter(avro_schema)
    
    def get_schema(self, name: str) -> Optional[avro.schema.Schema]:
        """Get an Avro schema by name"""
        return self._schemas.get(name)
    
    def serialize(self, name: str, data: Dict[str, Any]) -> bytes:
        """Serialize data using Avro"""
        writer = self._writers.get(name)
        if not writer:
            raise ValueError(f"Schema {name} not registered")
        
        buffer = io.BytesIO()
        encoder = BinaryEncoder(buffer)
        writer.write(data, encoder)
        return buffer.getvalue()
    
    def deserialize(self, name: str, data: bytes) -> Dict[str, Any]:
        """Deserialize data using Avro"""
        reader = self._readers.get(name)
        if not reader:
            raise ValueError(f"Schema {name} not registered")
        
        buffer = io.BytesIO(data)
        decoder = BinaryDecoder(buffer)
        return reader.read(decoder)


class EventSchema:
    """Unified event schema interface"""
    
    def __init__(
        self,
        name: str,
        schema_type: str = "json",
        schema_definition: Optional[Dict[str, Any]] = None
    ):
        self.name = name
        self.schema_type = schema_type
        self.schema_definition = schema_definition or {}
        
        if schema_type == "json":
            self.registry = JsonSchemaRegistry()
            self.registry.register_schema(name, schema_definition)
        elif schema_type == "avro":
            self.registry = AvroSchemaRegistry()
            self.registry.register_schema(name, schema_definition)
        else:
            raise ValueError(f"Unsupported schema type: {schema_type}")
    
    def validate(self, data: Dict[str, Any]) -> bool:
        """Validate event data"""
        if self.schema_type == "json":
            return self.registry.validate(self.name, data)
        elif self.schema_type == "avro":
            # Avro validation happens during serialization
            return True
        return False
    
    def serialize(self, data: Dict[str, Any]) -> Any:
        """Serialize event data"""
        if self.schema_type == "json":
            return self.registry.serialize(data)
        elif self.schema_type == "avro":
            return self.registry.serialize(self.name, data)
        raise ValueError(f"Unsupported schema type: {self.schema_type}")
    
    def deserialize(self, data: Any) -> Dict[str, Any]:
        """Deserialize event data"""
        if self.schema_type == "json":
            return self.registry.deserialize(data)
        elif self.schema_type == "avro":
            return self.registry.deserialize(self.name, data)
        raise ValueError(f"Unsupported schema type: {self.schema_type}")


def convert_json_to_avro_schema(json_schema: Dict[str, Any]) -> Dict[str, Any]:
    """Convert a JSON schema to Avro schema format"""
    avro_schema = {
        "type": "record",
        "name": "Event",
        "fields": []
    }
    
    properties = json_schema.get("properties", {})
    required = json_schema.get("required", [])
    
    for field_name, field_def in properties.items():
        avro_field = {
            "name": field_name,
            "type": convert_json_type_to_avro(field_def)
        }
        
        if field_name not in required:
            avro_field["type"] = ["null", avro_field["type"]]
        
        avro_schema["fields"].append(avro_field)
    
    return avro_schema


def convert_json_type_to_avro(json_type: Dict[str, Any]) -> Any:
    """Convert JSON type definition to Avro type"""
    json_type_str = json_type.get("type", "string")
    
    if json_type_str == "string":
        if json_type.get("format") == "date-time":
            return {"type": "long", "logicalType": "timestamp-millis"}
        return "string"
    elif json_type_str == "integer":
        return "int"
    elif json_type_str == "number":
        return "double"
    elif json_type_str == "boolean":
        return "boolean"
    elif json_type_str == "array":
        items = json_type.get("items", {"type": "string"})
        return {
            "type": "array",
            "items": convert_json_type_to_avro(items)
        }
    elif json_type_str == "object":
        return {
            "type": "map",
            "values": "string"
        }
    else:
        return "string"
