"""
Pytest fixtures and configuration for PhotoIdentifier platform tests
"""
import pytest
from typing import AsyncGenerator
from fastapi.testclient import TestClient
from httpx import AsyncClient, ASGITransport


# ============================================================================
# Async Client Fixtures
# ============================================================================

@pytest.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    """
    Fixture that provides an async HTTP client for testing FastAPI endpoints.
    
    Usage:
        async def test_api_endpoint(async_client):
            response = await async_client.get("/api/photos")
            assert response.status_code == 200
    """
    # Note: This will work when FastAPI app is created
    # For now, we'll create a placeholder
    try:
        from app.main import app
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            yield client
    except ImportError:
        # Placeholder when FastAPI app is not yet created
        pytest.skip("FastAPI app not yet implemented")


@pytest.fixture
def sync_client() -> TestClient:
    """
    Fixture that provides a sync HTTP client for testing FastAPI endpoints.
    
    Usage:
        def test_api_endpoint(sync_client):
            response = sync_client.get("/api/photos")
            assert response.status_code == 200
    """
    try:
        from app.main import app
        return TestClient(app)
    except ImportError:
        pytest.skip("FastAPI app not yet implemented")


# ============================================================================
# Database Fixtures
# ============================================================================

@pytest.fixture
async def db_session():
    """
    Fixture that provides a database session for testing.
    Uses test database and automatically rolls back transactions.
    """
    # Note: This will work when database models are created
    try:
        from app.database import get_test_db
        
        async for session in get_test_db():
            yield session
            # Transaction will be rolled back automatically
    except ImportError:
        pytest.skip("Database models not yet implemented")


# ============================================================================
# Authentication Fixtures
# ============================================================================

@pytest.fixture
def test_user_token():
    """
    Fixture that provides a valid authentication token for a test user.
    """
    # This will generate a JWT token for testing authenticated endpoints
    try:
        from app.auth import create_access_token
        return create_access_token(
            data={"sub": "test-user-id"},
            expires_delta=None  # For testing, don't expire
        )
    except ImportError:
        return "mock-token-for-testing"


@pytest.fixture
def test_headers(test_user_token: str) -> dict:
    """
    Fixture that provides headers with authentication for API requests.
    """
    return {"Authorization": f"Bearer {test_user_token}"}


# ============================================================================
# Photo Fixtures
# ============================================================================

@pytest.fixture
def sample_photo_data():
    """
    Fixture that provides sample photo data for testing.
    """
    return {
        "filename": "test_photo.jpg",
        "file_size": 1024 * 512,  # 512KB
        "mime_type": "image/jpeg",
        "width": 1920,
        "height": 1080,
        "uploaded_at": "2024-02-22T10:00:00Z",
        "tags": ["test", "sample"],
        "metadata": {
            "camera": "Test Camera",
            "location": "Test Location"
        }
    }


@pytest.fixture
def sample_identification_data():
    """
    Fixture that provides sample identification data for testing.
    """
    return [
        {
            "id": "id-1",
            "label": "cat",
            "confidence": 0.95,
            "bounding_box": {
                "x": 100,
                "y": 100,
                "width": 200,
                "height": 200
            }
        },
        {
            "id": "id-2",
            "label": "dog",
            "confidence": 0.87,
            "bounding_box": {
                "x": 300,
                "y": 150,
                "width": 180,
                "height": 180
            }
        }
    ]


# ============================================================================
# Test Data Fixtures
# ============================================================================

@pytest.fixture
def mock_ai_response():
    """
    Fixture that provides a mock AI model response for testing.
    """
    return {
        "success": True,
        "identifications": [
            {
                "label": "object",
                "confidence": 0.92,
                "bounding_box": {"x": 0, "y": 0, "width": 100, "height": 100}
            }
        ],
        "processing_time_ms": 150,
        "model_version": "v1.0.0"
    }


# ============================================================================
# Environment Fixtures
# ============================================================================

@pytest.fixture(autouse=True)
def override_environment():
    """
    Fixture that automatically sets test environment variables for all tests.
    """
    import os
    
    # Save original values
    original_env = os.environ.copy()
    
    # Set test environment
    os.environ["ENVIRONMENT"] = "test"
    os.environ["DATABASE_URL"] = "sqlite:///./test.db"
    os.environ["SECRET_KEY"] = "test-secret-key-for-pytest-only"
    os.environ["REDIS_URL"] = "redis://localhost:6379/1"
    
    yield
    
    # Restore original environment
    os.environ.clear()
    os.environ.update(original_env)
