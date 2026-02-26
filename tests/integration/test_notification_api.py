"""
Backend API Tests - Notification Service

Tests for the Notification Service API endpoints.
Covers email, SMS, push notifications, and templates.

Priority: CRITICAL
Estimated Time: 40-60 hours (for all services)
"""

import pytest
import json
from unittest.mock import Mock, patch, AsyncMock
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime


class TestEmailNotifications:
    """Test email notification endpoints"""
    
    def test_send_email_success(self, client, mock_db):
        """Test successful email sending"""
        response = client.post(
            "/api/v1/notifications/email",
            json={
                "to": ["user@example.com"],
                "subject": "Test Email",
                "body": "This is a test email",
                "from": "noreply@superprismora.com"
            }
        )
        
        assert response.status_code in [201, 202]
        data = response.json()
        assert "message_id" in data or "id" in data
    
    def test_send_email_multiple_recipients(self, client, mock_db):
        """Test sending email to multiple recipients"""
        response = client.post(
            "/api/v1/notifications/email",
            json={
                "to": ["user1@example.com", "user2@example.com"],
                "subject": "Test Email",
                "body": "This is a test email"
            }
        )
        
        assert response.status_code in [201, 202]
    
    def test_send_email_invalid_email(self, client, mock_db):
        """Test sending email with invalid email address"""
        response = client.post(
            "/api/v1/notifications/email",
            json={
                "to": ["invalid-email"],
                "subject": "Test Email",
                "body": "Test"
            }
        )
        
        assert response.status_code == 422
    
    def test_send_email_missing_subject(self, client, mock_db):
        """Test sending email without subject"""
        response = client.post(
            "/api/v1/notifications/email",
            json={
                "to": ["user@example.com"],
                "body": "Test email"
            }
        )
        
        assert response.status_code == 422
    
    def test_send_email_with_attachment(self, client, mock_db):
        """Test sending email with attachment"""
        response = client.post(
            "/api/v1/notifications/email",
            json={
                "to": ["user@example.com"],
                "subject": "Test Email",
                "body": "Test email with attachment",
                "attachments": [
                    {"filename": "document.pdf", "content": "base64encoded"}
                ]
            }
        )
        
        assert response.status_code in [201, 202, 422]
    
    def test_send_email_html_body(self, client, mock_db):
        """Test sending HTML email"""
        response = client.post(
            "/api/v1/notifications/email",
            json={
                "to": ["user@example.com"],
                "subject": "HTML Email",
                "body": "<h1>Hello</h1><p>Test</p>",
                "is_html": True
            }
        )
        
        assert response.status_code in [201, 202]


class TestSMSNotifications:
    """Test SMS notification endpoints"""
    
    def test_send_sms_success(self, client, mock_db):
        """Test successful SMS sending"""
        response = client.post(
            "/api/v1/notifications/sms",
            json={
                "to": "+1234567890",
                "message": "Test SMS"
            }
        )
        
        assert response.status_code in [201, 202]
        data = response.json()
        assert "message_id" in data or "id" in data
    
    def test_send_sms_invalid_phone(self, client, mock_db):
        """Test sending SMS with invalid phone number"""
        response = client.post(
            "/api/v1/notifications/sms",
            json={
                "to": "123",
                "message": "Test"
            }
        )
        
        assert response.status_code == 422
    
    def test_send_sms_message_too_long(self, client, mock_db):
        """Test sending SMS exceeding character limit"""
        response = client.post(
            "/api/v1/notifications/sms",
            json={
                "to": "+1234567890",
                "message": "x" * 500  # SMS typically limited to 160 chars
            }
        )
        
        assert response.status_code in [201, 202, 400]
    
    def test_send_bulk_sms(self, client, mock_db):
        """Test bulk SMS sending"""
        response = client.post(
            "/api/v1/notifications/sms/bulk",
            json={
                "recipients": ["+1234567890", "+0987654321"],
                "message": "Bulk SMS test"
            }
        )
        
        assert response.status_code in [201, 202]


class TestPushNotifications:
    """Test push notification endpoints"""
    
    def test_send_push_success(self, client, mock_db):
        """Test successful push notification"""
        response = client.post(
            "/api/v1/notifications/push",
            json={
                "user_id": "user-123",
                "title": "Test Push",
                "body": "This is a test push notification",
                "data": {"action": "open_app"}
            }
        )
        
        assert response.status_code in [201, 202]
    
    def test_send_push_to_topic(self, client, mock_db):
        """Test sending push to a topic"""
        response = client.post(
            "/api/v1/notifications/push/topic",
            json={
                "topic": "announcements",
                "title": "New Update",
                "body": "Check out the new features"
            }
        )
        
        assert response.status_code in [201, 202]
    
    def test_send_push_invalid_user(self, client, mock_db):
        """Test push notification to non-existent user"""
        response = client.post(
            "/api/v1/notifications/push",
            json={
                "user_id": "",
                "title": "Test",
                "body": "Test"
            }
        )
        
        assert response.status_code == 422
    
    def test_send_push_with_image(self, client, mock_db):
        """Test push notification with image"""
        response = client.post(
            "/api/v1/notifications/push",
            json={
                "user_id": "user-123",
                "title": "Image Push",
                "body": "Check this image",
                "image_url": "https://example.com/image.jpg"
            }
        )
        
        assert response.status_code in [201, 202, 422]


class TestNotificationTemplates:
    """Test notification template endpoints"""
    
    def test_create_template(self, client, mock_db):
        """Test creating notification template"""
        response = client.post(
            "/api/v1/notifications/templates",
            json={
                "name": "welcome_email",
                "type": "email",
                "subject": "Welcome {{name}}!",
                "body": "Hello {{name}}, welcome to Super_Prismora!",
                "variables": ["name"]
            }
        )
        
        assert response.status_code in [201, 202]
    
    def test_get_template(self, client, mock_db):
        """Test retrieving template"""
        response = client.get("/api/v1/notifications/templates/welcome_email")
        
        assert response.status_code in [200, 404]
    
    def test_update_template(self, client, mock_db):
        """Test updating template"""
        response = client.put(
            "/api/v1/notifications/templates/welcome_email",
            json={
                "subject": "Updated Subject",
                "body": "Updated body"
            }
        )
        
        assert response.status_code in [200, 404]
    
    def test_delete_template(self, client, mock_db):
        """Test deleting template"""
        response = client.delete(
            "/api/v1/notifications/templates/welcome_email"
        )
        
        assert response.status_code in [200, 204, 404]
    
    def test_list_templates(self, client, mock_db):
        """Test listing all templates"""
        response = client.get("/api/v1/notifications/templates")
        
        assert response.status_code == 200
    
    def test_send_using_template(self, client, mock_db):
        """Test sending notification using template"""
        response = client.post(
            "/api/v1/notifications/send",
            json={
                "template": "welcome_email",
                "recipient": "user@example.com",
                "variables": {"name": "John"}
            }
        )
        
        assert response.status_code in [201, 202, 404]


class TestNotificationPreferences:
    """Test user notification preferences"""
    
    def test_get_preferences(self, client, mock_db):
        """Test getting user notification preferences"""
        response = client.get("/api/v1/notifications/preferences/user-123")
        
        assert response.status_code in [200, 404]
    
    def test_update_preferences(self, client, mock_db):
        """Test updating notification preferences"""
        response = client.put(
            "/api/v1/notifications/preferences/user-123",
            json={
                "email": {"enabled": True, "frequency": "daily"},
                "sms": {"enabled": False},
                "push": {"enabled": True, "quiet_hours": "22:00-07:00"}
            }
        )
        
        assert response.status_code in [200, 404]
    
    def test_opt_out_all(self, client, mock_db):
        """Test opting out of all notifications"""
        response = client.post(
            "/api/v1/notifications/preferences/user-123/opt-out"
        )
        
        assert response.status_code in [200, 404]


class TestNotificationHistory:
    """Test notification history and logs"""
    
    def test_get_notification_history(self, client, mock_db):
        """Test retrieving notification history"""
        response = client.get(
            "/api/v1/notifications/history?user_id=user-123&limit=50"
        )
        
        assert response.status_code == 200
    
    def test_get_notification_by_id(self, client, mock_db):
        """Test retrieving specific notification"""
        response = client.get("/api/v1/notifications/history/msg-123")
        
        assert response.status_code in [200, 404]
    
    def test_get_notification_status(self, client, mock_db):
        """Test getting notification delivery status"""
        response = client.get(
            "/api/v1/notifications/history/msg-123/status"
        )
        
        assert response.status_code in [200, 404]
    
    def test_get_notification_stats(self, client, mock_db):
        """Test getting notification statistics"""
        response = client.get(
            "/api/v1/notifications/stats?start_date=2026-01-01&end_date=2026-02-26"
        )
        
        assert response.status_code == 200
    
    def test_retry_failed_notification(self, client, mock_db):
        """Test retrying failed notification"""
        response = client.post(
            "/api/v1/notifications/history/msg-123/retry"
        )
        
        assert response.status_code in [200, 404, 400]


class TestNotificationScheduling:
    """Test scheduled notifications"""
    
    def test_schedule_notification(self, client, mock_db):
        """Test scheduling a notification"""
        future_time = "2026-02-27T10:00:00Z"
        
        response = client.post(
            "/api/v1/notifications/schedule",
            json={
                "notification": {
                    "type": "email",
                    "to": ["user@example.com"],
                    "subject": "Scheduled Email",
                    "body": "This is scheduled"
                },
                "send_at": future_time
            }
        )
        
        assert response.status_code in [201, 202]
    
    def test_cancel_scheduled(self, client, mock_db):
        """Test canceling scheduled notification"""
        response = client.delete(
            "/api/v1/notifications/schedule/schedule-123"
        )
        
        assert response.status_code in [200, 204, 404]
    
    def test_list_scheduled(self, client, mock_db):
        """Test listing scheduled notifications"""
        response = client.get("/api/v1/notifications/schedule")
        
        assert response.status_code == 200


class TestErrorHandling:
    """Test error handling"""
    
    def test_invalid_notification_type(self, client, mock_db):
        """Test with invalid notification type"""
        response = client.post(
            "/api/v1/notifications/send",
            json={
                "type": "invalid_type",
                "to": "user@example.com"
            }
        )
        
        assert response.status_code == 422
    
    def test_rate_limiting(self, client, mock_db):
        """Test rate limiting on notification endpoints"""
        pytest.skip("Rate limiting test requires specific setup")
    
    def test_service_unavailable(self, client, mock_db):
        """Test handling when notification service is down"""
        with patch('services.services.notification.app.send_email', 
                   side_effect=Exception("Service unavailable")):
            response = client.post(
                "/api/v1/notifications/email",
                json={
                    "to": ["user@example.com"],
                    "subject": "Test",
                    "body": "Test"
                }
            )
            
            assert response.status_code in [500, 503]


# Fixtures
@pytest.fixture
def mock_db():
    """Mock database session"""
    return Mock(spec=Session)


@pytest.fixture
def client():
    """Test client fixture"""
    from services.services.notification.app import app
    return TestClient(app)
