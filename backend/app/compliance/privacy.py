"""
GDPR and CCPA Compliance Tools
Implements data subject rights and privacy compliance features.
"""

import json
import logging
import hashlib
from typing import Optional, Dict, List, Any
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from enum import Enum
import uuid


logger = logging.getLogger(__name__)


class ConsentType(Enum):
    """Types of consent for data processing."""
    MARKETING = "marketing"
    ANALYTICS = "analytics"
    PERSONALIZATION = "personalization"
    COOKIES = "cookies"
    DATA_SHARING = "data_sharing"


class DataSubjectRequestType(Enum):
    """Types of data subject requests."""
    ACCESS = "access"
    DELETION = "deletion"
    PORTABILITY = "portability"
    RECTIFICATION = "rectification"
    OPT_OUT = "opt_out"
    OPT_IN = "opt_in"


class DataRetentionPeriod(Enum):
    """Standard data retention periods."""
    IMMEDIATE = "immediate"
    SHORT = "30_days"
    MEDIUM = "90_days"
    LONG = "1_year"
    EXTENDED = "3_years"
    INDEFINITE = "indefinite"


@dataclass
class ConsentRecord:
    """Record of user consent."""
    consent_id: str
    user_id: str
    consent_type: ConsentType
    granted: bool
    timestamp: datetime
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    version: str = "1.0"


@dataclass
class DataSubjectRequest:
    """Data subject request for GDPR/CCPA compliance."""
    request_id: str
    user_id: str
    request_type: DataSubjectRequestType
    status: str
    created_at: datetime
    processed_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    notes: Optional[str] = None
    evidence: Optional[List[str]] = None


@dataclass
class DataRecord:
    """Record of personal data stored."""
    record_id: str
    user_id: str
    data_type: str
    storage_location: str
    retention_period: DataRetentionPeriod
    created_at: datetime
    expires_at: Optional[datetime] = None
    sensitive: bool = False
    processing_purposes: List[str] = None


class ConsentManager:
    """
    Manage user consent for GDPR/CCPA compliance.

    Features:
    - Track consent for various processing activities
    - Version-controlled consent records
    - Consent revocation
    - Audit trail
    """

    def __init__(self):
        """Initialize consent manager."""
        self._consents: Dict[str, ConsentRecord] = {}
        self._consent_index: Dict[str, List[str]] = {}  # user_id -> consent_ids

    def record_consent(
        self,
        user_id: str,
        consent_type: ConsentType,
        granted: bool,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> ConsentRecord:
        """
        Record user consent.

        Args:
            user_id: User identifier
            consent_type: Type of consent
            granted: Whether consent was granted
            ip_address: Optional IP address
            user_agent: Optional user agent

        Returns:
            ConsentRecord
        """
        consent_id = str(uuid.uuid4())
        consent = ConsentRecord(
            consent_id=consent_id,
            user_id=user_id,
            consent_type=consent_type,
            granted=granted,
            timestamp=datetime.utcnow(),
            ip_address=ip_address,
            user_agent=user_agent
        )

        self._consents[consent_id] = consent

        if user_id not in self._consent_index:
            self._consent_index[user_id] = []
        self._consent_index[user_id].append(consent_id)

        logger.info(f"Recorded consent: user={user_id}, type={consent_type.value}, granted={granted}")
        return consent

    def get_consent(self, user_id: str, consent_type: ConsentType) -> Optional[ConsentRecord]:
        """
        Get latest consent for user and type.

        Args:
            user_id: User identifier
            consent_type: Type of consent

        Returns:
            Latest ConsentRecord or None
        """
        if user_id not in self._consent_index:
            return None

        # Get all consents for this user and type
        matching = []
        for consent_id in self._consent_index[user_id]:
            consent = self._consents.get(consent_id)
            if consent and consent.consent_type == consent_type:
                matching.append(consent)

        # Return the most recent
        if matching:
            return max(matching, key=lambda c: c.timestamp)

        return None

    def has_consent(self, user_id: str, consent_type: ConsentType) -> bool:
        """
        Check if user has granted consent.

        Args:
            user_id: User identifier
            consent_type: Type of consent

        Returns:
            True if consent granted
        """
        consent = self.get_consent(user_id, consent_type)
        return consent is not None and consent.granted

    def revoke_consent(self, user_id: str, consent_type: ConsentType) -> bool:
        """
        Revoke user consent.

        Args:
            user_id: User identifier
            consent_type: Type of consent

        Returns:
            True if revoked
        """
        self.record_consent(user_id, consent_type, granted=False)
        logger.info(f"Revoked consent: user={user_id}, type={consent_type.value}")
        return True

    def get_all_consents(self, user_id: str) -> List[ConsentRecord]:
        """
        Get all consent records for user.

        Args:
            user_id: User identifier

        Returns:
            List of ConsentRecords
        """
        if user_id not in self._consent_index:
            return []

        return [
            self._consents[consent_id]
            for consent_id in self._consent_index[user_id]
            if consent_id in self._consents
        ]


class DataSubjectRequestManager:
    """
    Manage GDPR/CCPA data subject requests.

    Features:
    - Submit data subject requests
    - Track request status
    - Generate evidence packages
    - Auto-deletion workflows
    """

    def __init__(self):
        """Initialize request manager."""
        self._requests: Dict[str, DataSubjectRequest] = {}
        self._user_index: Dict[str, List[str]] = {}  # user_id -> request_ids

    def submit_request(
        self,
        user_id: str,
        request_type: DataSubjectRequestType,
        notes: Optional[str] = None
    ) -> DataSubjectRequest:
        """
        Submit a data subject request.

        Args:
            user_id: User identifier
            request_type: Type of request
            notes: Optional notes

        Returns:
            DataSubjectRequest
        """
        request_id = str(uuid.uuid4())
        request = DataSubjectRequest(
            request_id=request_id,
            user_id=user_id,
            request_type=request_type,
            status="submitted",
            created_at=datetime.utcnow(),
            notes=notes
        )

        self._requests[request_id] = request

        if user_id not in self._user_index:
            self._user_index[user_id] = []
        self._user_index[user_id].append(request_id)

        logger.info(f"Submitted request: user={user_id}, type={request_type.value}, id={request_id}")
        return request

    def process_request(self, request_id: str) -> bool:
        """
        Mark request as processing.

        Args:
            request_id: Request identifier

        Returns:
            True if updated
        """
        request = self._requests.get(request_id)
        if request and request.status == "submitted":
            request.status = "processing"
            request.processed_at = datetime.utcnow()
            logger.info(f"Processing request: {request_id}")
            return True
        return False

    def complete_request(
        self,
        request_id: str,
        evidence: Optional[List[str]] = None
    ) -> bool:
        """
        Complete a request.

        Args:
            request_id: Request identifier
            evidence: List of evidence URLs/paths

        Returns:
            True if completed
        """
        request = self._requests.get(request_id)
        if request:
            request.status = "completed"
            request.completed_at = datetime.utcnow()
            request.evidence = evidence or []
            logger.info(f"Completed request: {request_id}")
            return True
        return False

    def get_request(self, request_id: str) -> Optional[DataSubjectRequest]:
        """Get request by ID."""
        return self._requests.get(request_id)

    def get_user_requests(self, user_id: str) -> List[DataSubjectRequest]:
        """Get all requests for user."""
        if user_id not in self._user_index:
            return []

        return [
            self._requests[request_id]
            for request_id in self._user_index[user_id]
            if request_id in self._requests
        ]

    def get_pending_requests(self) -> List[DataSubjectRequest]:
        """Get all pending requests."""
        return [
            req for req in self._requests.values()
            if req.status in ["submitted", "processing"]
        ]


class DataInventory:
    """
    Track all personal data stored for GDPR compliance.

    Features:
    - Catalog data storage locations
    - Track retention periods
    - Identify sensitive data
    - Generate data maps
    """

    def __init__(self):
        """Initialize data inventory."""
        self._records: Dict[str, DataRecord] = {}
        self._user_index: Dict[str, List[str]] = {}  # user_id -> record_ids

    def register_record(
        self,
        user_id: str,
        data_type: str,
        storage_location: str,
        retention_period: DataRetentionPeriod,
        sensitive: bool = False,
        processing_purposes: Optional[List[str]] = None
    ) -> DataRecord:
        """
        Register a data record.

        Args:
            user_id: User identifier
            data_type: Type of data (e.g., 'email', 'photo', 'preferences')
            storage_location: Where data is stored
            retention_period: How long to keep data
            sensitive: Whether data is sensitive
            processing_purposes: List of processing purposes

        Returns:
            DataRecord
        """
        record_id = str(uuid.uuid4())

        # Calculate expiration
        expires_at = None
        if retention_period != DataRetentionPeriod.INDEFINITE:
            if retention_period == DataRetentionPeriod.SHORT:
                expires_at = datetime.utcnow() + timedelta(days=30)
            elif retention_period == DataRetentionPeriod.MEDIUM:
                expires_at = datetime.utcnow() + timedelta(days=90)
            elif retention_period == DataRetentionPeriod.LONG:
                expires_at = datetime.utcnow() + timedelta(days=365)
            elif retention_period == DataRetentionPeriod.EXTENDED:
                expires_at = datetime.utcnow() + timedelta(days=1095)

        record = DataRecord(
            record_id=record_id,
            user_id=user_id,
            data_type=data_type,
            storage_location=storage_location,
            retention_period=retention_period,
            created_at=datetime.utcnow(),
            expires_at=expires_at,
            sensitive=sensitive,
            processing_purposes=processing_purposes or []
        )

        self._records[record_id] = record

        if user_id not in self._user_index:
            self._user_index[user_id] = []
        self._user_index[user_id].append(record_id)

        logger.info(f"Registered data: user={user_id}, type={data_type}, location={storage_location}")
        return record

    def get_user_data(self, user_id: str) -> List[DataRecord]:
        """
        Get all data records for user.

        Args:
            user_id: User identifier

        Returns:
            List of DataRecords
        """
        if user_id not in self._user_index:
            return []

        return [
            self._records[record_id]
            for record_id in self._user_index[user_id]
            if record_id in self._records
        ]

    def delete_user_data(self, user_id: str) -> int:
        """
        Delete all data records for user (for GDPR right to be forgotten).

        Args:
            user_id: User identifier

        Returns:
            Number of records deleted
        """
        if user_id not in self._user_index:
            return 0

        deleted_count = 0
        for record_id in self._user_index[user_id]:
            if record_id in self._records:
                del self._records[record_id]
                deleted_count += 1

        del self._user_index[user_id]
        logger.info(f"Deleted {deleted_count} data records for user: {user_id}")
        return deleted_count

    def get_expired_records(self) -> List[DataRecord]:
        """
        Get all records that have expired.

        Returns:
            List of expired DataRecords
        """
        now = datetime.utcnow()
        return [
            record for record in self._records.values()
            if record.expires_at and record.expires_at <= now
        ]

    def generate_data_map(self) -> Dict[str, Any]:
        """
        Generate a data map for GDPR documentation.

        Returns:
            Dictionary with data map information
        """
        total_records = len(self._records)
        unique_users = len(self._user_index)
        sensitive_records = sum(1 for r in self._records.values() if r.sensitive)

        data_types = {}
        for record in self._records.values():
            if record.data_type not in data_types:
                data_types[record.data_type] = 0
            data_types[record.data_type] += 1

        return {
            "total_records": total_records,
            "unique_users": unique_users,
            "sensitive_records": sensitive_records,
            "data_types": data_types,
            "generated_at": datetime.utcnow().isoformat()
        }


class ComplianceAudit:
    """
    Audit logging for compliance reporting.

    Features:
    - Log all data access and modifications
    - Generate audit reports
    - Track consent changes
    - Evidence preservation
    """

    def __init__(self):
        """Initialize audit logger."""
        self._audit_log: List[Dict[str, Any]] = []

    def log_event(
        self,
        event_type: str,
        user_id: Optional[str],
        details: Dict[str, Any],
        timestamp: Optional[datetime] = None
    ):
        """
        Log a compliance event.

        Args:
            event_type: Type of event
            user_id: Optional user identifier
            details: Event details
            timestamp: Optional timestamp
        """
        event = {
            "event_id": str(uuid.uuid4()),
            "event_type": event_type,
            "user_id": user_id,
            "timestamp": (timestamp or datetime.utcnow()).isoformat(),
            "details": details
        }
        self._audit_log.append(event)
        logger.info(f"Audit event: {event_type} - {user_id}")

    def generate_report(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        event_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Generate audit report.

        Args:
            start_date: Optional start date filter
            end_date: Optional end date filter
            event_type: Optional event type filter

        Returns:
            Filtered audit events
        """
        filtered = self._audit_log

        if start_date:
            start_str = start_date.isoformat()
            filtered = [e for e in filtered if e["timestamp"] >= start_str]

        if end_date:
            end_str = end_date.isoformat()
            filtered = [e for e in filtered if e["timestamp"] <= end_str]

        if event_type:
            filtered = [e for e in filtered if e["event_type"] == event_type]

        return filtered

    def get_user_history(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all audit events for user."""
        return [e for e in self._audit_log if e["user_id"] == user_id]


class CCPAOptOutManager:
    """
    CCPA-specific opt-out management.

    Features:
    - Track do-not-sell preferences
    - Generate privacy policy notices
    - Opt-out workflows
    """

    def __init__(self):
        """Initialize CCPA manager."""
        self._opt_outs: set = set()

    def register_opt_out(self, user_id: str, email: Optional[str] = None) -> bool:
        """
        Register user opt-out from data sale.

        Args:
            user_id: User identifier
            email: Optional email address

        Returns:
            True if registered
        """
        self._opt_outs.add(user_id)
        logger.info(f"CCPA opt-out registered: user={user_id}, email={email}")
        return True

    def is_opted_out(self, user_id: str) -> bool:
        """
        Check if user has opted out.

        Args:
            user_id: User identifier

        Returns:
            True if opted out
        """
        return user_id in self._opt_outs

    def remove_opt_out(self, user_id: str) -> bool:
        """
        Remove user opt-out.

        Args:
            user_id: User identifier

        Returns:
            True if removed
        """
        if user_id in self._opt_outs:
            self._opt_outs.remove(user_id)
            logger.info(f"CCPA opt-out removed: user={user_id}")
            return True
        return False


def generate_privacy_policy_link() -> str:
    """Generate privacy policy link for consent forms."""
    return "https://photoidentifier.com/privacy-policy"


def generate_cookie_policy_link() -> str:
    """Generate cookie policy link."""
    return "https://photoidentifier.com/cookie-policy"
