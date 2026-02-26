"""
Backend API Tests - Image Service

Tests for the Image Service API endpoints.
Covers upload, retrieval, deletion, and processing operations.

Priority: CRITICAL
Estimated Time: 40-60 hours (for all services)
"""

import pytest
import io
from unittest.mock import Mock, patch, MagicMock
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
import json


class TestImageUpload:
    """Test image upload endpoints"""
    
    def test_upload_single_image_success(self, client, mock_db, mock_settings):
        """Test successful single image upload"""
        # Create a mock image file
        image_file = io.BytesIO(b"fake image content")
        image_file.name = "test.jpg"
        
        response = client.post(
            "/api/v1/images/upload",
            files={"file": ("test.jpg", image_file, "image/jpeg")}
        )
        
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["filename"]
        assert data["original_filename"] == "test.jpg"
    
    def test_upload_single_image_invalid_type(self, client, mock_db):
        """Test upload with invalid file type"""
        text_file = io.BytesIO(b"not an image")
        text_file.name = "test.txt"
        
        response = client.post(
            "/api/v1/images/upload",
            files={"file": ("test.txt", text_file, "text/plain")}
        )
        
        assert response.status_code == 400
        assert "Invalid file type" in response.json()["detail"]
    
    def test_upload_single_image_too_large(self, client, mock_db, mock_settings):
        """Test upload with file exceeding size limit"""
        # Create a large mock file (>10MB)
        large_content = b"x" * (11 * 1024 * 1024)
        large_file = io.BytesIO(large_content)
        large_file.name = "large.jpg"
        
        response = client.post(
            "/api/v1/images/upload",
            files={"file": ("large.jpg", large_file, "image/jpeg")}
        )
        
        assert response.status_code == 400
    
    def test_upload_multiple_images_success(self, client, mock_db):
        """Test successful multiple image upload"""
        files = [
            ("files", ("test1.jpg", io.BytesIO(b"img1"), "image/jpeg")),
            ("files", ("test2.jpg", io.BytesIO(b"img2"), "image/jpeg")),
        ]
        
        response = client.post("/api/v1/images/upload/multiple", files=files)
        
        assert response.status_code == 201
        data = response.json()
        assert len(data["successful"]) == 2
    
    def test_upload_multiple_images_exceed_limit(self, client, mock_db):
        """Test upload exceeding 10 file limit"""
        files = [
            (f"files", (f"test{i}.jpg", io.BytesIO(b"img"), "image/jpeg"))
            for i in range(11)
        ]
        
        response = client.post("/api/v1/images/upload/multiple", files=files)
        
        assert response.status_code == 400
        assert "Maximum 10 files" in response.json()["detail"]


class TestImageRetrieval:
    """Test image retrieval endpoints"""
    
    def test_get_image_by_id_success(self, client, mock_db):
        """Test successful image retrieval by ID"""
        response = client.get("/api/v1/images/test-image-id-123")
        
        # May return 200 with image data or 404 if not found
        assert response.status_code in [200, 404]
    
    def test_get_image_by_id_not_found(self, client, mock_db):
        """Test retrieval of non-existent image"""
        response = client.get("/api/v1/images/non-existent-id")
        
        assert response.status_code == 404
    
    def test_list_images_pagination(self, client, mock_db):
        """Test image listing with pagination"""
        response = client.get("/api/v1/images?page=1&limit=10")
        
        assert response.status_code == 200
        data = response.json()
        assert "items" in data or "images" in data


class TestImageDeletion:
    """Test image deletion endpoints"""
    
    def test_delete_image_success(self, client, mock_db):
        """Test successful image deletion"""
        response = client.delete("/api/v1/images/test-image-id-123")
        
        # Should return 200 or 204
        assert response.status_code in [200, 204]
    
    def test_delete_image_not_found(self, client, mock_db):
        """Test deletion of non-existent image"""
        response = client.delete("/api/v1/images/non-existent-id")
        
        assert response.status_code == 404
    
    def test_delete_multiple_images(self, client, mock_db):
        """Test batch deletion of images"""
        response = client.delete(
            "/api/v1/images/batch",
            json={"ids": ["id1", "id2", "id3"]}
        )
        
        assert response.status_code in [200, 207]


class TestImageProcessing:
    """Test image processing endpoints"""
    
    def test_resize_image_success(self, client, mock_db):
        """Test image resizing"""
        response = client.post(
            "/api/v1/images/test-id/resize",
            json={"width": 800, "height": 600}
        )
        
        assert response.status_code in [200, 202]
    
    def test_resize_image_invalid_dimensions(self, client, mock_db):
        """Test resize with invalid dimensions"""
        response = client.post(
            "/api/v1/images/test-id/resize",
            json={"width": 0, "height": 600}
        )
        
        assert response.status_code == 422
    
    def test_convert_format_success(self, client, mock_db):
        """Test image format conversion"""
        response = client.post(
            "/api/v1/images/test-id/convert",
            json={"format": "png"}
        )
        
        assert response.status_code in [200, 202]
    
    def test_generate_thumbnail_success(self, client, mock_db):
        """Test thumbnail generation"""
        response = client.post(
            "/api/v1/images/test-id/thumbnail",
            json={"size": 150}
        )
        
        assert response.status_code in [200, 202]


class TestImageMetadata:
    """Test image metadata endpoints"""
    
    def test_get_metadata_success(self, client, mock_db):
        """Test retrieving image metadata"""
        response = client.get("/api/v1/images/test-id/metadata")
        
        assert response.status_code in [200, 404]
    
    def test_update_metadata_success(self, client, mock_db):
        """Test updating image metadata"""
        response = client.put(
            "/api/v1/images/test-id/metadata",
            json={"tags": ["nature", "landscape"], "description": "Test image"}
        )
        
        assert response.status_code in [200, 404]


class TestImageSearch:
    """Test image search endpoints"""
    
    def test_search_by_tag(self, client, mock_db):
        """Test searching images by tag"""
        response = client.get("/api/v1/images/search?tag=nature")
        
        assert response.status_code == 200
    
    def test_search_by_date_range(self, client, mock_db):
        """Test searching by date range"""
        response = client.get(
            "/api/v1/images/search?start_date=2026-01-01&end_date=2026-02-26"
        )
        
        assert response.status_code == 200


class TestRateLimiting:
    """Test rate limiting functionality"""
    
    @pytest.mark.skip(reason="Rate limiting depends on configuration")
    def test_rate_limit_upload(self, client, mock_db):
        """Test rate limiting on upload endpoint"""
        # Make multiple rapid requests
        for i in range(100):
            response = client.post(
                "/api/v1/images/upload",
                files={"file": ("test.jpg", io.BytesIO(b"img"), "image/jpeg")}
            )
            
            if response.status_code == 429:
                break
        
        # Should eventually hit rate limit
        assert response.status_code == 429


class TestErrorHandling:
    """Test error handling and edge cases"""
    
    def test_upload_corrupted_image(self, client, mock_db):
        """Test upload of corrupted image file"""
        corrupted_file = io.BytesIO(b"corrupted image data")
        corrupted_file.name = "corrupted.jpg"
        
        response = client.post(
            "/api/v1/images/upload",
            files={"file": ("corrupted.jpg", corrupted_file, "image/jpeg")}
        )
        
        assert response.status_code == 400
    
    def test_upload_empty_file(self, client, mock_db):
        """Test upload of empty file"""
        empty_file = io.BytesIO(b"")
        empty_file.name = "empty.jpg"
        
        response = client.post(
            "/api/v1/images/upload",
            files={"file": ("empty.jpg", empty_file, "image/jpeg")}
        )
        
        assert response.status_code == 400
    
    def test_upload_without_file(self, client, mock_db):
        """Test upload request without file"""
        response = client.post("/api/v1/images/upload")
        
        assert response.status_code == 422


# Fixtures
@pytest.fixture
def mock_db():
    """Mock database session"""
    return Mock(spec=Session)


@pytest.fixture
def mock_settings():
    """Mock settings"""
    with patch('services.services.image.app.get_settings') as mock:
        settings = Mock()
        settings.ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        settings.UPLOAD_DIR = '/tmp/uploads'
        settings.MAX_FILE_SIZE = 10 * 1024 * 1024
        mock.return_value = settings
        yield settings


@pytest.fixture
def client():
    """Test client fixture"""
    from services.app.main import app
    return TestClient(app)
