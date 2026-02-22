"""
Data Export Event Publisher
Publishes data export events to Kafka
"""
from typing import Dict, Any

from ..events.producers import UserEventProducer
from ..events.registry import EventMetadata, EventType
from .models import DataExportRequest, Jurisdiction, DataType


class DataExportEventPublisher:
    """
    Publishes data export events to Kafka
    """
    
    def __init__(self, producer: UserEventProducer):
        self.producer = producer
    
    async def publish_export_requested(
        self,
        request: DataExportRequest
    ) -> bool:
        """
        Publish data export requested event
        
        Args:
            request: Data export request
            
        Returns:
            True if published successfully
        """
        from uuid import uuid4
        
        metadata = EventMetadata(
            event_id=str(uuid4()),
            event_type=EventType.DATA_EXPORT_REQUESTED,
            source_app="web",
            user_id=request.user_id
        )
        
        payload = {
            "request_id": request.request_id,
            "user_id": request.user_id,
            "requested_at": request.requested_at.isoformat(),
            "data_types": [dt.value for dt in request.data_types],
            "format": request.format.value,
            "jurisdiction": request.jurisdiction.value
        }
        
        return await self.producer.produce_event(
            EventType.DATA_EXPORT_REQUESTED, payload, metadata, request.user_id
        )
    
    async def publish_export_completed(
        self,
        request: DataExportRequest,
        export_url: str,
        file_size_bytes: int,
        record_count: int
    ) -> bool:
        """
        Publish data export completed event
        
        Args:
            request: Data export request
            export_url: URL to download export
            file_size_bytes: Size of export file
            record_count: Number of records exported
            
        Returns:
            True if published successfully
        """
        from uuid import uuid4
        
        metadata = EventMetadata(
            event_id=str(uuid4()),
            event_type=EventType.DATA_EXPORT_COMPLETED,
            source_app="web",
            user_id=request.user_id
        )
        
        payload = {
            "request_id": request.request_id,
            "user_id": request.user_id,
            "export_url": export_url,
            "expires_at": request.expires_at.isoformat(),
            "file_size_bytes": file_size_bytes,
            "record_count": record_count,
            "completed_at": request.completed_at.isoformat() if request.completed_at else None
        }
        
        return await self.producer.produce_event(
            EventType.DATA_EXPORT_COMPLETED, payload, metadata, request.user_id
        )
    
    async def publish_deletion_requested(
        self,
        request_id: str,
        user_id: str,
        data_types: list[DataType],
        jurisdiction: Jurisdiction,
        reason: str
    ) -> bool:
        """
        Publish data deletion requested event
        
        Args:
            request_id: Request ID
            user_id: User ID
            data_types: Types of data to delete
            jurisdiction: Legal jurisdiction
            reason: Reason for deletion
            
        Returns:
            True if published successfully
        """
        from uuid import uuid4
        
        metadata = EventMetadata(
            event_id=str(uuid4()),
            event_type=EventType.DATA_DELETION_REQUESTED,
            source_app="web",
            user_id=user_id
        )
        
        payload = {
            "request_id": request_id,
            "user_id": user_id,
            "requested_at": metadata.timestamp.isoformat(),
            "data_types": [dt.value for dt in data_types],
            "jurisdiction": jurisdiction.value,
            "reason": reason
        }
        
        return await self.producer.produce_event(
            EventType.DATA_DELETION_REQUESTED, payload, metadata, user_id
        )
    
    async def publish_deletion_completed(
        self,
        request_id: str,
        user_id: str,
        deleted_record_count: int,
        apps_notified: list[str]
    ) -> bool:
        """
        Publish data deletion completed event
        
        Args:
            request_id: Request ID
            user_id: User ID
            deleted_record_count: Number of records deleted
            apps_notified: Apps notified of deletion
            
        Returns:
            True if published successfully
        """
        from uuid import uuid4
        
        metadata = EventMetadata(
            event_id=str(uuid4()),
            event_type=EventType.DATA_DELETION_COMPLETED,
            source_app="web",
            user_id=user_id
        )
        
        payload = {
            "request_id": request_id,
            "user_id": user_id,
            "deleted_record_count": deleted_record_count,
            "apps_notified": apps_notified,
            "completed_at": metadata.timestamp.isoformat()
        }
        
        return await self.producer.produce_event(
            EventType.DATA_DELETION_COMPLETED, payload, metadata, user_id
        )
