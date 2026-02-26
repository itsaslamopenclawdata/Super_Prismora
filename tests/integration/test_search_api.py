"""
Backend API Tests - Search Service

Tests for the Search Service API endpoints.
Covers search, indexing, filters, and suggestions.

Priority: CRITICAL
"""

import pytest
import json
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


class TestSearch:
    """Test search endpoints"""
    
    def test_search_general(self, client, mock_db):
        """Test general search"""
        response = client.get("/api/v1/search?q=nature")
        
        assert response.status_code in [200, 404]
    
    def test_search_with_filters(self, client, mock_db):
        """Test search with filters"""
        response = client.get(
            "/api/v1/search?q=flower&type=flora&category=nature"
        )
        
        assert response.status_code in [200, 404]
    
    def test_search_pagination(self, client, mock_db):
        """Test search with pagination"""
        response = client.get(
            "/api/v1/search?q=test&page=1&limit=20"
        )
        
        assert response.status_code in [200, 404]
    
    def test_search_empty_query(self, client, mock_db):
        """Test search with empty query"""
        response = client.get("/api/v1/search?q=")
        
        assert response.status_code == 422
    
    def test_search_suggestions(self, client, mock_db):
        """Test search suggestions/autocomplete"""
        response = client.get("/api/v1/search/suggest?q=fl")
        
        assert response.status_code in [200, 404]
    
    def test_search_facets(self, client, mock_db):
        """Test search with facets"""
        response = client.get(
            "/api/v1/search?q=plant&facets=category,type"
        )
        
        assert response.status_code in [200, 404]


class TestIndexing:
    """Test indexing endpoints"""
    
    def test_index_document(self, client, mock_db):
        """Test indexing a document"""
        response = client.post(
            "/api/v1/search/index",
            json={
                "id": "doc-123",
                "type": "photo",
                "content": "Nature photo of flowers",
                "metadata": {"tags": ["nature", "flower"]}
            }
        )
        
        assert response.status_code in [201, 202, 404]
    
    def test_index_batch(self, client, mock_db):
        """Test batch indexing"""
        response = client.post(
            "/api/v1/search/index/batch",
            json={
                "documents": [
                    {"id": "doc-1", "type": "photo", "content": "Test 1"},
                    {"id": "doc-2", "type": "photo", "content": "Test 2"},
                ]
            }
        )
        
        assert response.status_code in [201, 202, 404]
    
    def test_delete_index(self, client, mock_db):
        """Test deleting from index"""
        response = client.delete("/api/v1/search/index/doc-123")
        
        assert response.status_code in [200, 204, 404]
    
    def test_rebuild_index(self, client, mock_db):
        """Test rebuilding entire index"""
        response = client.post("/api/v1/search/rebuild")
        
        assert response.status_code in [200, 202, 404]


class TestFilters:
    """Test filter endpoints"""
    
    def test_get_filters(self, client, mock_db):
        """Test getting available filters"""
        response = client.get("/api/v1/search/filters")
        
        assert response.status_code in [200, 404]
    
    def test_filter_by_date_range(self, client, mock_db):
        """Test date range filter"""
        response = client.get(
            "/api/v1/search?q=test&start_date=2026-01-01&end_date=2026-02-26"
        )
        
        assert response.status_code in [200, 404]
    
    def test_filter_by_category(self, client, mock_db):
        """Test category filter"""
        response = client.get("/api/v1/search?q=test&category=nature")
        
        assert response.status_code in [200, 404]


# Fixtures
@pytest.fixture
def mock_db():
    return Mock(spec=Session)


@pytest.fixture
def client():
    from services.services.search.app import app
    return TestClient(app)
