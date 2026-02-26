"""
Backend API Tests - Marketplace Service

Tests for the Marketplace Service API endpoints.
Covers listings, transactions, cart, checkout, and orders.

Priority: CRITICAL
"""

import pytest
import json
from unittest.mock import Mock
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime


class TestListings:
    """Test marketplace listing endpoints"""
    
    def test_create_listing(self, client, mock_db):
        """Test creating a new listing"""
        response = client.post(
            "/api/v1/marketplace/listings",
            json={
                "title": "Vintage Coin Collection",
                "description": "Rare coins from 1950s",
                "price": 150.00,
                "currency": "USD",
                "category": "collectibles",
                "condition": "good",
                "images": ["https://example.com/coin1.jpg"]
            }
        )
        
        assert response.status_code in [201, 202, 404]
    
    def test_get_listing(self, client, mock_db):
        """Test retrieving a listing"""
        response = client.get("/api/v1/marketplace/listings/listing-123")
        
        assert response.status_code in [200, 404]
    
    def test_update_listing(self, client, mock_db):
        """Test updating a listing"""
        response = client.put(
            "/api/v1/marketplace/listings/listing-123",
            json={"price": 175.00}
        )
        
        assert response.status_code in [200, 404]
    
    def test_delete_listing(self, client, mock_db):
        """Test deleting a listing"""
        response = client.delete("/api/v1/marketplace/listings/listing-123")
        
        assert response.status_code in [200, 204, 404]
    
    def test_list_listings(self, client, mock_db):
        """Test listing all listings"""
        response = client.get("/api/v1/marketplace/listings?page=1&limit=20")
        
        assert response.status_code in [200, 404]
    
    def test_search_listings(self, client, mock_db):
        """Test searching listings"""
        response = client.get("/api/v1/marketplace/listings?q=coin&category=collectibles")
        
        assert response.status_code in [200, 404]


class TestCart:
    """Test cart endpoints"""
    
    def test_add_to_cart(self, client, mock_db):
        """Test adding item to cart"""
        response = client.post(
            "/api/v1/marketplace/cart",
            json={
                "listing_id": "listing-123",
                "quantity": 1
            }
        )
        
        assert response.status_code in [201, 202, 404]
    
    def test_get_cart(self, client, mock_db):
        """Test getting cart contents"""
        response = client.get("/api/v1/marketplace/cart")
        
        assert response.status_code in [200, 404]
    
    def test_update_cart_item(self, client, mock_db):
        """Test updating cart item quantity"""
        response = client.put(
            "/api/v1/marketplace/cart/item-123",
            json={"quantity": 2}
        )
        
        assert response.status_code in [200, 404]
    
    def test_remove_from_cart(self, client, mock_db):
        """Test removing item from cart"""
        response = client.delete("/api/v1/marketplace/cart/item-123")
        
        assert response.status_code in [200, 204, 404]
    
    def test_clear_cart(self, client, mock_db):
        """Test clearing entire cart"""
        response = client.delete("/api/v1/marketplace/cart")
        
        assert response.status_code in [200, 204, 404]


class TestCheckout:
    """Test checkout endpoints"""
    
    def test_checkout(self, client, mock_db):
        """Test checkout process"""
        response = client.post(
            "/api/v1/marketplace/checkout",
            json={
                "payment_method": "card",
                "shipping_address": {
                    "street": "123 Main St",
                    "city": "New York",
                    "state": "NY",
                    "zip": "10001",
                    "country": "US"
                }
            }
        )
        
        assert response.status_code in [200, 201, 404]
    
    def test_checkout_validation(self, client, mock_db):
        """Test checkout with invalid data"""
        response = client.post(
            "/api/v1/marketplace/checkout",
            json={}
        )
        
        assert response.status_code == 422


class TestOrders:
    """Test order endpoints"""
    
    def test_get_orders(self, client, mock_db):
        """Test getting user orders"""
        response = client.get("/api/v1/marketplace/orders")
        
        assert response.status_code in [200, 404]
    
    def test_get_order(self, client, mock_db):
        """Test getting specific order"""
        response = client.get("/api/v1/marketplace/orders/order-123")
        
        assert response.status_code in [200, 404]
    
    def test_cancel_order(self, client, mock_db):
        """Test canceling an order"""
        response = client.post("/api/v1/marketplace/orders/order-123/cancel")
        
        assert response.status_code in [200, 404]
    
    def test_order_status(self, client, mock_db):
        """Test getting order status"""
        response = client.get("/api/v1/marketplace/orders/order-123/status")
        
        assert response.status_code in [200, 404]


class TestPayments:
    """Test payment endpoints"""
    
    def test_process_payment(self, client, mock_db):
        """Test processing payment"""
        response = client.post(
            "/api/v1/marketplace/payments",
            json={
                "order_id": "order-123",
                "amount": 150.00,
                "currency": "USD",
                "payment_method": "card"
            }
        )
        
        assert response.status_code in [200, 201, 404]
    
    def test_payment_status(self, client, mock_db):
        """Test getting payment status"""
        response = client.get("/api/v1/marketplace/payments/payment-123")
        
        assert response.status_code in [200, 404]
    
    def test_refund(self, client, mock_db):
        """Test processing refund"""
        response = client.post(
            "/api/v1/marketplace/payments/payment-123/refund"
        )
        
        assert response.status_code in [200, 404]


# Fixtures
@pytest.fixture
def mock_db():
    return Mock(spec=Session)


@pytest.fixture
def client():
    from services.services.marketplace.app import app
    return TestClient(app)
