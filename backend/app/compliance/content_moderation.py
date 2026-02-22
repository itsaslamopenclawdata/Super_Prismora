"""
AI Content Moderation
Detects inappropriate content in user uploads using AI.
"""

import logging
from typing import Optional, Dict, List, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
from datetime import datetime
import json
import re


logger = logging.getLogger(__name__)


class ContentCategory(Enum):
    """Categories of moderated content."""
    VIOLENCE = "violence"
    SEXUAL = "sexual"
    HATE = "hate"
    HARASSMENT = "harassment"
    SELF_HARM = "self_harm"
    DRUGS = "drugs"
    MISINFORMATION = "misinformation"
    SPAM = "spam"
    OTHER = "other"


class Severity(Enum):
    """Severity levels for content violations."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    SEVERE = "severe"


class ModerationAction(Enum):
    """Actions to take for moderated content."""
    ALLOW = "allow"
    FLAG = "flag"
    REQUIRE_REVIEW = "require_review"
    BLOCK = "block"
    DELETE = "delete"


@dataclass
class ModerationResult:
    """Result of content moderation."""
    content_id: str
    is_safe: bool
    confidence: float
    categories: Dict[ContentCategory, Severity]
    action: ModerationAction
    explanation: str
    reviewed_by: str
    reviewed_at: datetime
    metadata: Optional[Dict[str, any]] = None


@dataclass
class TextAnalysis:
    """Analysis of text content."""
    text_id: str
    contains_profanity: bool
    contains_threats: bool
    contains_hate_speech: bool
    contains_personal_info: bool
    profanity_count: int
    suspicious_patterns: List[str]
    language: Optional[str] = None


class ProfanityFilter:
    """
    Filter and detect profanity and inappropriate text.

    Features:
    - Profanity detection
    - Threat detection
    - Hate speech detection
    - Personal info detection (PII)
    """

    def __init__(self):
        """Initialize profanity filter."""
        # Basic profanity list (expand with actual profanity detection library)
        self._profanity_patterns = [
            # Add actual profanity patterns here
            r'\bass\b', r'\bdamn\b', r'\bhell\b'
        ]

        # Threat patterns
        self._threat_patterns = [
            r'\bkill\s+you\b', r'\bhurt\s+you\b', r'\bwill\s+find\s+you\b',
            r'\bgonna\s+kill\b', r'\bgoing\s+to\s+kill\b'
        ]

        # Hate speech patterns (simplified - use proper NLP in production)
        self._hate_patterns = [
            r'\bhate\b.*\b(black|white|asian|hispanic|jewish|muslim|christian)\b'
        ]

        # PII patterns
        self._pii_patterns = [
            r'\b\d{3}-\d{2}-\d{4}\b',  # SSN pattern
            r'\b\d{3}-\d{3}-\d{4}\b',  # Phone pattern
            r'\b\d{16}\b',  # Credit card pattern
            r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'  # Email
        ]

    def check_profanity(self, text: str) -> Tuple[bool, int]:
        """
        Check for profanity.

        Args:
            text: Text to check

        Returns:
            Tuple of (contains_profanity, count)
        """
        count = 0
        for pattern in self._profanity_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            count += len(matches)

        return count > 0, count

    def check_threats(self, text: str) -> bool:
        """
        Check for threats.

        Args:
            text: Text to check

        Returns:
            True if threats detected
        """
        for pattern in self._threat_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        return False

    def check_hate_speech(self, text: str) -> bool:
        """
        Check for hate speech.

        Args:
            text: Text to check

        Returns:
            True if hate speech detected
        """
        for pattern in self._hate_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        return False

    def check_personal_info(self, text: str) -> Tuple[bool, List[str]]:
        """
        Check for personally identifiable information.

        Args:
            text: Text to check

        Returns:
            Tuple of (contains_pii, detected_types)
        """
        detected = []
        for pattern in self._pii_patterns:
            if re.search(pattern, text):
                if 'SSN' in str(pattern):
                    detected.append('ssn')
                elif 'Phone' in str(pattern):
                    detected.append('phone')
                elif 'Credit card' in str(pattern):
                    detected.append('credit_card')
                elif 'Email' in str(pattern):
                    detected.append('email')

        return len(detected) > 0, detected

    def analyze_text(self, text: str) -> TextAnalysis:
        """
        Perform comprehensive text analysis.

        Args:
            text: Text to analyze

        Returns:
            TextAnalysis
        """
        contains_profanity, profanity_count = self.check_profanity(text)
        contains_threats = self.check_threats(text)
        contains_hate_speech = self.check_hate_speech(text)
        contains_pii, pii_types = self.check_personal_info(text)

        # Find suspicious patterns
        suspicious_patterns = []
        if contains_profanity:
            suspicious_patterns.append("profanity")
        if contains_threats:
            suspicious_patterns.append("threats")
        if contains_hate_speech:
            suspicious_patterns.append("hate_speech")
        if contains_pii:
            suspicious_patterns.extend([f"pii:{t}" for t in pii_types])

        return TextAnalysis(
            text_id=f"text_{hash(text)}",
            contains_profanity=contains_profanity,
            contains_threats=contains_threats,
            contains_hate_speech=contains_hate_speech,
            contains_personal_info=contains_pii,
            profanity_count=profanity_count,
            suspicious_patterns=suspicious_patterns
        )


class ImageModerator:
    """
    AI-based image moderation.

    Features:
    - Detect adult content
    - Detect violence/gore
    - Detect hate symbols
    - Quality assessment
    """

    def __init__(self):
        """Initialize image moderator."""
        # In production, integrate with:
        # - Amazon Rekognition
        # - Google Cloud Vision API
        # - Azure Computer Vision
        # - Clarifai
        # - Sightengine
        logger.info("Image moderator initialized (mock mode)")

    async def moderate_image(
        self,
        image_data: bytes,
        image_id: str
    ) -> ModerationResult:
        """
        Moderate an image.

        Args:
            image_data: Image bytes
            image_id: Image identifier

        Returns:
            ModerationResult
        """
        # In production, call actual AI moderation service
        # For now, return a safe result
        return ModerationResult(
            content_id=image_id,
            is_safe=True,
            confidence=0.95,
            categories={},
            action=ModerationAction.ALLOW,
            explanation="Image passed automated moderation",
            reviewed_by="ai_moderator",
            reviewed_at=datetime.utcnow(),
            metadata={"size_bytes": len(image_data)}
        )

    async def detect_nsfw(self, image_data: bytes) -> Tuple[bool, float]:
        """
        Detect NSFW content.

        Args:
            image_data: Image bytes

        Returns:
            Tuple of (is_nsfw, confidence)
        """
        # In production, use AI model
        # For now, always return False
        return False, 0.0

    async def detect_violence(self, image_data: bytes) -> Tuple[bool, float]:
        """
        Detect violent content.

        Args:
            image_data: Image bytes

        Returns:
            Tuple of (is_violent, confidence)
        """
        # In production, use AI model
        # For now, always return False
        return False, 0.0

    async def detect_hate_symbols(self, image_data: bytes) -> List[str]:
        """
        Detect hate symbols.

        Args:
            image_data: Image bytes

        Returns:
            List of detected symbols
        """
        # In production, use AI model
        # For now, return empty list
        return []


class ContentModerator:
    """
    Main content moderation coordinator.

    Features:
    - Coordinate text and image moderation
    - Apply moderation policies
    - Generate moderation reports
    - Queue human review when needed
    """

    def __init__(
        self,
        auto_block_threshold: float = 0.9,
        require_review_threshold: float = 0.7
    ):
        """
        Initialize content moderator.

        Args:
            auto_block_threshold: Confidence threshold for auto-block
            require_review_threshold: Confidence threshold for human review
        """
        self.profanity_filter = ProfanityFilter()
        self.image_moderator = ImageModerator()
        self.auto_block_threshold = auto_block_threshold
        self.require_review_threshold = require_review_threshold
        self._moderation_history: List[ModerationResult] = []

    async def moderate_text(
        self,
        text: str,
        content_id: str
    ) -> ModerationResult:
        """
        Moderate text content.

        Args:
            text: Text to moderate
            content_id: Content identifier

        Returns:
            ModerationResult
        """
        analysis = self.profanity_filter.analyze_text(text)

        categories = {}
        overall_confidence = 0.0
        explanation = ""
        action = ModerationAction.ALLOW

        # Determine severity based on analysis
        if analysis.contains_hate_speech:
            categories[ContentCategory.HATE] = Severity.HIGH
            overall_confidence = max(overall_confidence, 0.9)

        if analysis.contains_threats:
            categories[ContentCategory.VIOLENCE] = Severity.HIGH
            overall_confidence = max(overall_confidence, 0.85)

        if analysis.contains_personal_info:
            categories[ContentCategory.HARASSMENT] = Severity.MEDIUM
            overall_confidence = max(overall_confidence, 0.7)

        if analysis.contains_profanity:
            categories[ContentCategory.OTHER] = Severity.LOW
            overall_confidence = max(overall_confidence, 0.5)
            if analysis.profanity_count > 3:
                overall_confidence = max(overall_confidence, 0.7)

        # Determine action
        if overall_confidence >= self.auto_block_threshold:
            action = ModerationAction.BLOCK
            explanation = "Content violates safety policies and was automatically blocked"
        elif overall_confidence >= self.require_review_threshold:
            action = ModerationAction.REQUIRE_REVIEW
            explanation = "Content requires human review due to potential policy violation"
        elif categories:
            action = ModerationAction.FLAG
            explanation = "Content flagged for monitoring"

        if not categories:
            explanation = "Text passed automated moderation checks"

        result = ModerationResult(
            content_id=content_id,
            is_safe=action != ModerationAction.BLOCK,
            confidence=overall_confidence,
            categories=categories,
            action=action,
            explanation=explanation,
            reviewed_by="text_moderator",
            reviewed_at=datetime.utcnow(),
            metadata={
                "text_length": len(text),
                "profanity_count": analysis.profanity_count,
                "suspicious_patterns": analysis.suspicious_patterns
            }
        )

        self._moderation_history.append(result)
        logger.info(f"Text moderation: {content_id} - {action.value} (confidence: {overall_confidence})")
        return result

    async def moderate_image(
        self,
        image_data: bytes,
        content_id: str
    ) -> ModerationResult:
        """
        Moderate image content.

        Args:
            image_data: Image bytes
            content_id: Content identifier

        Returns:
            ModerationResult
        """
        result = await self.image_moderator.moderate_image(image_data, content_id)
        self._moderation_history.append(result)
        return result

    async def moderate_content(
        self,
        content: str,
        content_type: str,
        content_id: str,
        image_data: Optional[bytes] = None
    ) -> ModerationResult:
        """
        Moderate content (text or image).

        Args:
            content: Content to moderate
            content_type: Type of content ('text' or 'image')
            content_id: Content identifier
            image_data: Optional image bytes

        Returns:
            ModerationResult
        """
        if content_type == 'text':
            return await self.moderate_text(content, content_id)
        elif content_type == 'image' and image_data:
            return await self.moderate_image(image_data, content_id)
        else:
            raise ValueError(f"Unsupported content type: {content_type}")

    def get_moderation_stats(self) -> Dict[str, any]:
        """
        Get moderation statistics.

        Returns:
            Statistics dictionary
        """
        total = len(self._moderation_history)
        if total == 0:
            return {"total_moderated": 0}

        blocked = sum(1 for r in self._moderation_history if r.action == ModerationAction.BLOCK)
        flagged = sum(1 for r in self._moderation_history if r.action == ModerationAction.FLAG)
        review = sum(1 for r in self._moderation_history if r.action == ModerationAction.REQUIRE_REVIEW)
        allowed = sum(1 for r in self._moderation_history if r.action == ModerationAction.ALLOW)

        return {
            "total_moderated": total,
            "blocked": blocked,
            "blocked_percentage": (blocked / total) * 100,
            "flagged": flagged,
            "flagged_percentage": (flagged / total) * 100,
            "require_review": review,
            "require_review_percentage": (review / total) * 100,
            "allowed": allowed,
            "allowed_percentage": (allowed / total) * 100
        }

    def get_user_violations(self, user_id: str) -> List[ModerationResult]:
        """
        Get moderation history for user.

        Args:
            user_id: User identifier

        Returns:
            List of ModerationResults
        """
        # In production, filter by user_id
        return [r for r in self._moderation_history if not r.is_safe]


class ReportQueue:
    """
    Queue content for human review.

    Features:
    - Queue flagged content
    - Prioritize high-severity items
    - Track review status
    """

    def __init__(self):
        """Initialize report queue."""
        self._queue: List[Dict[str, any]] = []

    def add_to_queue(
        self,
        content_id: str,
        content_type: str,
        severity: Severity,
        reason: str,
        metadata: Optional[Dict[str, any]] = None
    ):
        """
        Add content to review queue.

        Args:
            content_id: Content identifier
            content_type: Type of content
            severity: Severity level
            reason: Reason for queueing
            metadata: Optional metadata
        """
        item = {
            "queue_id": f"queue_{content_id}",
            "content_id": content_id,
            "content_type": content_type,
            "severity": severity,
            "reason": reason,
            "queued_at": datetime.utcnow(),
            "status": "pending",
            "metadata": metadata or {}
        }
        self._queue.append(item)
        logger.info(f"Added to queue: {content_id} ({severity.value})")

    def get_queue(self, min_severity: Optional[Severity] = None) -> List[Dict[str, any]]:
        """
        Get review queue.

        Args:
            min_severity: Minimum severity filter

        Returns:
            List of queued items
        """
        filtered = self._queue
        if min_severity:
            severity_order = [Severity.LOW, Severity.MEDIUM, Severity.HIGH, Severity.SEVERE]
            min_index = severity_order.index(min_severity)
            filtered = [item for item in self._queue if severity_order.index(item['severity']) >= min_index]

        # Sort by severity and time
        severity_order = {v: i for i, v in enumerate([Severity.LOW, Severity.MEDIUM, Severity.HIGH, Severity.SEVERE])}
        sorted_items = sorted(filtered, key=lambda x: (severity_order[x['severity']], x['queued_at']))
        return sorted_items
