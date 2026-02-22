"""
Data Export Service
Main service for GDPR/CCPA data export
"""
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from uuid import uuid4
import hashlib

from .models import (
    DataExportRequest,
    DataExportResponse,
    DataExportStatus,
    DataType,
    Jurisdiction,
    DataExportFormat,
    DataDeletionRequest,
    ConsentRecord
)
from .aggregators import UserDataAggregator
from .formatters import DataFormatter
from .events import DataExportEventPublisher


class DataExportService:
    """
    Main service for handling GDPR/CCPA data export requests
    """
    
    def __init__(
        self,
        aggregator: Optional[UserDataAggregator] = None,
        formatter: Optional[DataFormatter] = None,
        event_publisher: Optional[DataExportEventPublisher] = None
    ):
        self.aggregator = aggregator or UserDataAggregator()
        self.formatter = formatter or DataFormatter()
        self.event_publisher = event_publisher
        
        # Store requests
        self._export_requests: Dict[str, DataExportRequest] = {}
        self._deletion_requests: Dict[str, DataDeletionRequest] = {}
        self._consent_records: Dict[str, List[ConsentRecord]] = {}
    
    async def create_export_request(
        self,
        user_id: str,
        data_types: List[DataType],
        format: DataExportFormat = DataExportFormat.JSON,
        jurisdiction: Jurisdiction = Jurisdiction.GDPR
    ) -> DataExportRequest:
        """
        Create a new data export request
        
        Args:
            user_id: User ID
            data_types: Types of data to export
            format: Export format
            jurisdiction: Legal jurisdiction
            
        Returns:
            DataExportRequest
        """
        request = DataExportRequest(
            request_id=str(uuid4()),
            user_id=user_id,
            data_types=data_types,
            format=format,
            jurisdiction=jurisdiction,
            status=DataExportStatus.PENDING
        )
        
        self._export_requests[request.request_id] = request
        
        # Publish event
        if self.event_publisher:
            await self.event_publisher.publish_export_requested(request)
        
        return request
    
    async def process_export_request(
        self,
        request_id: str
    ) -> Optional[DataExportRequest]:
        """
        Process a data export request
        
        Args:
            request_id: Request ID to process
            
        Returns:
            Updated DataExportRequest
        """
        request = self._export_requests.get(request_id)
        if not request:
            return None
        
        # Update status
        request.status = DataExportStatus.PROCESSING
        request.processed_at = datetime.utcnow()
        
        try:
            # Aggregate data
            aggregated_data = await self.aggregator.aggregate_user_data(
                request.user_id,
                request.data_types
            )
            
            # Format data
            formatted_data = self._format_data(aggregated_data, request.format, request.jurisdiction)
            
            # Calculate record counts
            record_counts = {}
            total_records = 0
            for data_type, data in aggregated_data.items():
                count = self.aggregator.get_record_count(data)
                record_counts[data_type] = count
                total_records += count
            
            # Generate export URL (in production, this would upload to S3/Cloud Storage)
            export_url = f"/exports/{request.request_id}.{request.format.value}"
            
            # Update request
            request.export_url = export_url
            request.file_size_bytes = len(formatted_data.encode('utf-8'))
            request.record_count = total_records
            request.status = DataExportStatus.COMPLETED
            request.completed_at = datetime.utcnow()
            
            # Generate verification code
            request.verification_code = self._generate_verification_code(request)
            
            # Publish event
            if self.event_publisher:
                await self.event_publisher.publish_export_completed(
                    request,
                    export_url,
                    request.file_size_bytes,
                    total_records
                )
            
        except Exception as e:
            request.status = DataExportStatus.FAILED
            request.error_message = str(e)
            request.completed_at = datetime.utcnow()
        
        return request
    
    def _format_data(
        self,
        data: Dict[str, Any],
        format: DataExportFormat,
        jurisdiction: Jurisdiction
    ) -> str:
        """Format data according to specified format"""
        if format == DataExportFormat.JSON:
            formatted = self.formatter.format_json(data)
        elif format == DataExportFormat.CSV:
            formatted = self.formatter.format_csv(data)
        else:
            formatted = self.formatter.format_json(data)
        
        # Add disclaimer
        formatted = self.formatter.add_disclaimer(formatted, jurisdiction.value)
        
        return formatted
    
    def _generate_verification_code(self, request: DataExportRequest) -> str:
        """Generate verification code for export"""
        code_str = f"{request.request_id}{request.user_id}{datetime.utcnow()}"
        return hashlib.sha256(code_str.encode()).hexdigest()[:8].upper()
    
    async def get_export_request(self, request_id: str) -> Optional[DataExportRequest]:
        """Get export request by ID"""
        return self._export_requests.get(request_id)
    
    async def verify_export(
        self,
        request_id: str,
        verification_code: str
    ) -> bool:
        """
        Verify a data export using verification code
        
        Args:
            request_id: Request ID
            verification_code: Verification code
            
        Returns:
            True if verified
        """
        request = await self.get_export_request(request_id)
        if not request:
            return False
        
        if request.verification_code != verification_code:
            return False
        
        request.verified_at = datetime.utcnow()
        return True
    
    async def create_deletion_request(
        self,
        user_id: str,
        data_types: List[DataType],
        jurisdiction: Jurisdiction,
        reason: Optional[str] = None
    ) -> DataDeletionRequest:
        """
        Create a data deletion request (Right to be Forgotten)
        
        Args:
            user_id: User ID
            data_types: Types of data to delete
            jurisdiction: Legal jurisdiction
            reason: Reason for deletion
            
        Returns:
            DataDeletionRequest
        """
        request = DataDeletionRequest(
            request_id=str(uuid4()),
            user_id=user_id,
            data_types=data_types,
            jurisdiction=jurisdiction,
            reason=reason,
            status=DataExportStatus.PENDING
        )
        
        self._deletion_requests[request.request_id] = request
        
        # Publish event
        if self.event_publisher:
            await self.event_publisher.publish_deletion_requested(
                request.request_id,
                user_id,
                data_types,
                jurisdiction,
                reason or ""
            )
        
        return request
    
    async def process_deletion_request(
        self,
        request_id: str
    ) -> Optional[DataDeletionRequest]:
        """
        Process a data deletion request
        
        Args:
            request_id: Request ID to process
            
        Returns:
            Updated DataDeletionRequest
        """
        request = self._deletion_requests.get(request_id)
        if not request:
            return None
        
        # Update status
        request.status = DataExportStatus.PROCESSING
        request.processed_at = datetime.utcnow()
        
        try:
            # In production, this would:
            # 1. Delete data from all databases
            # 2. Notify all apps
            # 3. Archive deletion records for compliance
            
            deleted_count = 0
            for data_type in request.data_types:
                # Simulate deletion
                deleted_count += 10  # Placeholder
            
            request.deleted_record_count = deleted_count
            request.apps_notified = ["web", "marketplace", "booking", "gamification"]
            request.status = DataExportStatus.COMPLETED
            request.completed_at = datetime.utcnow()
            
            # Publish event
            if self.event_publisher:
                await self.event_publisher.publish_deletion_completed(
                    request.request_id,
                    request.user_id,
                    deleted_count,
                    request.apps_notified
                )
            
        except Exception as e:
            request.status = DataExportStatus.FAILED
            request.error_message = str(e)
            request.completed_at = datetime.utcnow()
        
        return request
    
    async def get_deletion_request(self, request_id: str) -> Optional[DataDeletionRequest]:
        """Get deletion request by ID"""
        return self._deletion_requests.get(request_id)
    
    async def record_consent(
        self,
        user_id: str,
        consent_type: str,
        purpose: str,
        data_types: List[str],
        is_granted: bool,
        jurisdiction: Jurisdiction,
        policy_version: str = "1.0"
    ) -> ConsentRecord:
        """
        Record user consent
        
        Args:
            user_id: User ID
            consent_type: Type of consent
            purpose: Purpose of data processing
            data_types: Data types covered
            is_granted: Whether consent is granted
            jurisdiction: Legal jurisdiction
            policy_version: Privacy policy version
            
        Returns:
            ConsentRecord
        """
        record = ConsentRecord(
            consent_id=str(uuid4()),
            user_id=user_id,
            consent_type=consent_type,
            purpose=purpose,
            data_types=data_types,
            is_granted=is_granted,
            jurisdiction=jurisdiction,
            granted_at=datetime.utcnow() if is_granted else None,
            revoked_at=None if is_granted else datetime.utcnow(),
            policy_version=policy_version
        )
        
        if user_id not in self._consent_records:
            self._consent_records[user_id] = []
        
        self._consent_records[user_id].append(record)
        
        return record
    
    async def get_user_consents(self, user_id: str) -> List[ConsentRecord]:
        """Get all consent records for a user"""
        return self._consent_records.get(user_id, [])
    
    def get_active_consents(self, user_id: str) -> List[ConsentRecord]:
        """Get active (granted) consents for a user"""
        consents = self._consent_records.get(user_id, [])
        return [
            c for c in consents
            if c.is_granted and (c.revoked_at is None or c.revoked_at < c.granted_at)
        ]
    
    async def revoke_consent(self, user_id: str, consent_id: str) -> bool:
        """
        Revoke a consent
        
        Args:
            user_id: User ID
            consent_id: Consent ID to revoke
            
        Returns:
            True if revoked successfully
        """
        consents = self._consent_records.get(user_id, [])
        
        for consent in consents:
            if consent.consent_id == consent_id:
                consent.is_granted = False
                consent.revoked_at = datetime.utcnow()
                return True
        
        return False
