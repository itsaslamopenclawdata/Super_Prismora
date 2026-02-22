"""
Unit tests for PhotoIdentifier platform utility functions.
These are independent unit tests that don't require external services.
"""
import pytest


# ============================================================================
# String Utility Tests
# ============================================================================

def test_slugify():
    """Test slugify function."""
    from app.utils import slugify
    
    # Basic slugification
    assert slugify("Hello World") == "hello-world"
    assert slugify("Hello   World") == "hello-world"
    assert slugify("Hello_World") == "hello-world"
    
    # Special characters
    assert slugify("Hello@World!") == "helloworld"
    assert slugify("Hello & World") == "hello-world"
    
    # Edge cases
    assert slugify("") == ""
    assert slugify("123") == "123"


def test_generate_id():
    """Test ID generation."""
    from app.utils import generate_id
    
    # Default length
    id1 = generate_id()
    assert len(id1) == 16
    assert id1.isalnum()
    
    # Custom length
    id2 = generate_id(32)
    assert len(id2) == 32
    assert id2.isalnum()
    
    # IDs should be unique
    id3 = generate_id()
    assert id1 != id3


# ============================================================================
# Validation Utility Tests
# ============================================================================

def test_is_valid_email():
    """Test email validation."""
    from app.utils import is_valid_email
    
    # Valid emails
    assert is_valid_email("test@example.com") is True
    assert is_valid_email("user.name@domain.co.uk") is True
    assert is_valid_email("test+tag@example.org") is True
    
    # Invalid emails
    assert is_valid_email("notanemail") is False
    assert is_valid_email("missing@domain") is False
    assert is_valid_email("@domain.com") is False
    assert is_valid_email("") is False


def test_is_valid_uuid():
    """Test UUID validation."""
    from app.utils import is_valid_uuid
    
    # Valid UUIDs
    assert is_valid_uuid("550e8400-e29b-41d4-a716-446655440000") is True
    assert is_valid_uuid("6ba7b810-9dad-11d1-80b4-00c04fd430c8") is True
    
    # Invalid UUIDs
    assert is_valid_uuid("not-a-uuid") is False
    assert is_valid_uuid("") is False
    assert is_valid_uuid("550e8400-e29b-41d4-a716") is False


# ============================================================================
# File Utility Tests
# ============================================================================

def test_format_file_size():
    """Test file size formatting."""
    from app.utils import format_file_size
    
    # Bytes
    assert format_file_size(0) == "0 Bytes"
    assert format_file_size(500) == "500 Bytes"
    
    # Kilobytes
    assert format_file_size(1024) == "1 KB"
    assert format_file_size(2048) == "2 KB"
    
    # Megabytes
    assert format_file_size(1048576) == "1 MB"
    assert format_file_size(2097152) == "2 MB"
    
    # Gigabytes
    assert format_file_size(1073741824) == "1 GB"


# ============================================================================
# Date Utility Tests
# ============================================================================

def test_format_relative_time():
    """Test relative time formatting."""
    from app.utils import format_relative_time
    from datetime import datetime, timedelta
    
    now = datetime.now()
    
    # Just now (less than 1 minute)
    assert format_relative_time(now) == "just now"
    
    # Minutes ago
    assert format_relative_time(now - timedelta(minutes=1)) == "1 minute ago"
    assert format_relative_time(now - timedelta(minutes=5)) == "5 minutes ago"
    
    # Hours ago
    assert format_relative_time(now - timedelta(hours=1)) == "1 hour ago"
    assert format_relative_time(now - timedelta(hours=5)) == "5 hours ago"
    
    # Days ago
    assert format_relative_time(now - timedelta(days=1)) == "1 day ago"
    assert format_relative_time(now - timedelta(days=5)) == "5 days ago"


# ============================================================================
# Array Utility Tests
# ============================================================================

def test_chunk_array():
    """Test array chunking."""
    from app.utils import chunk
    
    # Basic chunking
    assert chunk([1, 2, 3, 4, 5, 6], 3) == [[1, 2, 3], [4, 5, 6]]
    assert chunk([1, 2, 3, 4, 5], 2) == [[1, 2], [3, 4], [5]]
    
    # Chunk size larger than array
    assert chunk([1, 2, 3], 10) == [[1, 2, 3]]
    
    # Empty array
    assert chunk([], 3) == []


def test_unique_by():
    """Test removing duplicates by key function."""
    from app.utils import unique_by
    
    items = [
        {"id": 1, "name": "Alice"},
        {"id": 2, "name": "Bob"},
        {"id": 1, "name": "Charlie"},
        {"id": 3, "name": "David"},
    ]
    
    unique = unique_by(items, lambda x: x["id"])
    assert len(unique) == 3
    assert [item["id"] for item in unique] == [1, 2, 3]
    assert unique[0]["name"] == "Alice"  # First occurrence kept


# ============================================================================
# Photo Utility Tests
# ============================================================================

def test_calculate_aspect_ratio():
    """Test aspect ratio calculation."""
    from app.utils import calculate_aspect_ratio
    
    assert calculate_aspect_ratio(1920, 1080) == pytest.approx(1.78, rel=0.01)
    assert calculate_aspect_ratio(1080, 1920) == pytest.approx(0.56, rel=0.01)
    assert calculate_aspect_ratio(1000, 1000) == 1.0


def test_is_landscape():
    """Test landscape orientation detection."""
    from app.utils import is_landscape
    
    assert is_landscape(1920, 1080) is True
    assert is_landscape(1001, 1000) is True
    assert is_landscape(1080, 1920) is False
    assert is_landscape(1000, 1000) is False


def test_is_portrait():
    """Test portrait orientation detection."""
    from app.utils import is_portrait
    
    assert is_portrait(1080, 1920) is True
    assert is_portrait(1000, 1001) is True
    assert is_portrait(1920, 1080) is False
    assert is_portrait(1000, 1000) is False


def test_dominant_identification():
    """Test getting dominant identification."""
    from app.utils import get_dominant_identification
    
    identifications = [
        {"id": "1", "label": "cat", "confidence": 0.9},
        {"id": "2", "label": "dog", "confidence": 0.7},
        {"id": "3", "label": "bird", "confidence": 0.95},
    ]
    
    dominant = get_dominant_identification(identifications)
    assert dominant["label"] == "bird"
    assert dominant["confidence"] == 0.95
    
    # Empty list should return None
    assert get_dominant_identification([]) is None


# ============================================================================
# API Response Utility Tests
# ============================================================================

def test_create_success_response():
    """Test creating success API response."""
    from app.utils import create_success_response
    
    response = create_success_response({"id": 1}, "Success")
    assert response["success"] is True
    assert response["data"] == {"id": 1}
    assert response["message"] == "Success"


def test_create_error_response():
    """Test creating error API response."""
    from app.utils import create_error_response
    
    errors = [
        {"code": "INVALID", "message": "Invalid input", "field": "email"}
    ]
    
    response = create_error_response(errors)
    assert response["success"] is False
    assert response["errors"] == errors
