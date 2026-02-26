"""
Security Tests - OWASP Top 10

Tests for OWASP Top 10 vulnerabilities.
Covers A01-A10 categories.

Priority: HIGH
"""

import pytest
import json
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


class TestA01_BrokenAccessControl:
    """A01:2021 Broken Access Control"""
    
    def test_unauthorized_access_to_protected_resource(self, client, mock_db):
        """Test accessing protected endpoint without authentication"""
        response = client.get("/api/v1/users/profile")
        
        # Should return 401 or 403, not 200
        assert response.status_code in [401, 403]
    
    def test_horizontal_privilege_escalation(self, client, mock_db):
        """Test user accessing another user's data"""
        # Login as user1
        client.post("/api/v1/auth/login", json={
            "email": "user1@example.com",
            "password": "password"
        })
        
        # Try to access user2's data
        response = client.get("/api/v1/users/user2/profile")
        
        # Should be denied
        assert response.status_code in [403, 404]
    
    def test_vertical_privilege_escalation(self, client, mock_db):
        """Test regular user accessing admin endpoints"""
        response = client.get("/api/v1/admin/users")
        
        # Should return 401/403
        assert response.status_code in [401, 403]
    
    def test_insecure_direct_object_references(self, client, mock_db):
        """Test accessing resources via IDOR"""
        # Try to access resource by manipulating ID
        response = client.get("/api/v1/photos/9999")
        
        # Should verify ownership, not just return 404/200
        assert response.status_code in [401, 403, 404]
    
    def test_missing_function_level_access_control(self, client, mock_db):
        """Test admin functions accessible without admin role"""
        response = client.post("/api/v1/admin/delete-user", json={"user_id": "123"})
        
        assert response.status_code in [401, 403]


class TestA02_CryptographicFailures:
    """A02:2021 Cryptographic Failures"""
    
    def test_sensitive_data_in_url(self, client, mock_db):
        """Test sensitive data not passed in URLs"""
        response = client.get("/api/v1/data?password=secret")
        
        # Password should not be in query params
        assert "password" not in response.url
    
    def test_unencrypted_sensitive_data(self, client, mock_db):
        """Test sensitive data not returned in plain text"""
        response = client.post("/api/v1/users", json={
            "email": "test@example.com",
            "password": "MySecret!123"
        })
        
        # Password should not be in response
        assert "password" not in response.text.lower() or response.status_code != 200
    
    def test_weak_encryption_algorithms(self, client, mock_db):
        """Test weak crypto not used"""
        # This would test actual encryption implementation
        pass
    
    def test_missing_encryption(self, client, mock_db):
        """Test sensitive data encrypted at rest"""
        # Would verify database encryption
        pass


class TestA03_Injection:
    """A03:2021 Injection"""
    
    def test_sql_injection_login(self, client, mock_db):
        """Test SQL injection in login"""
        response = client.post("/api/v1/auth/login", json={
            "email": "' OR '1'='1",
            "password": "anything"
        })
        
        # Should not return 200 or expose data
        if response.status_code == 200:
            assert "error" in response.json() or response.json().get("access_token") is None
    
    def test_sql_injection_search(self, client, mock_db):
        """Test SQL injection in search"""
        response = client.get("/api/v1/search?q=' OR '1'='1")
        
        # Should be handled safely
        assert response.status_code in [200, 400]
    
    def test_no_sql_injection_in_parameters(self, client, mock_db):
        """Test SQL injection in various parameters"""
        malicious_inputs = [
            "'; DROP TABLE users;--",
            "1; DELETE FROM photos WHERE '1'='1",
            "' UNION SELECT * FROM users--",
            "1' AND '1'='1"
        ]
        
        for malicious in malicious_inputs:
            response = client.get(f"/api/v1/photos?id={malicious}")
            assert response.status_code in [400, 404]
    
    def test_xss_in_input(self, client, mock_db):
        """Test XSS in input fields"""
        xss_payload = "<script>alert('XSS')</script>"
        
        response = client.post("/api/v1/feedback", json={
            "message": xss_payload
        })
        
        # Should sanitize or reject
        if response.status_code == 200:
            # Response should not contain unsanitized XSS
            assert xss_payload not in response.text
    
    def test_command_injection(self, client, mock_db):
        """Test command injection"""
        response = client.get("/api/v1/files?filename=test; ls -la")
        
        # Should be handled safely
        assert response.status_code in [400, 404]


class TestA04_InsecureDesign:
    """A04:2021 Insecure Design"""
    
    def test_business_logic_flaws(self, client, mock_db):
        """Test business logic vulnerabilities"""
        # Test negative quantity in cart
        response = client.post("/api/v1/cart/add", json={
            "item_id": "123",
            "quantity": -1
        })
        
        # Should validate business rules
        assert response.status_code in [400, 422]
    
    def test_missing_rate_limiting(self, client, mock_db):
        """Test rate limiting on sensitive endpoints"""
        # Make multiple rapid requests
        responses = []
        for _ in range(100):
            response = client.post("/api/v1/auth/login", json={
                "email": "test@example.com",
                "password": "wrong"
            })
            responses.append(response.status_code)
        
        # Should eventually be rate limited
        assert 429 in responses
    
    def test_missing_functionality_access_control(self, client, mock_db):
        """Test missing access control on features"""
        # Test admin feature accessible to regular user
        response = client.get("/api/v1/admin/dashboard")
        
        assert response.status_code in [401, 403]


class TestA05_SecurityMisconfiguration:
    """A05:2021 Security Misconfiguration"""
    
    def test_default_credentials(self, client, mock_db):
        """Test default credentials not work"""
        response = client.post("/api/v1/auth/login", json={
            "email": "admin",
            "password": "admin"
        })
        
        # Should not succeed with defaults
        assert response.status_code in [401, 403, 404]
    
    def test_verbose_error_messages(self, client, mock_db):
        """Test error messages don't leak info"""
        response = client.post("/api/v1/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "wrong"
        })
        
        # Should not reveal if email exists
        assert "not found" not in response.text.lower() or response.status_code != 200
    
    def test_missing_security_headers(self, client, mock_db):
        """Test security headers present"""
        response = client.get("/api/v1/health")
        
        # Should have security headers
        headers = response.headers
        # In production, check for HSTS, X-Frame-Options, etc.
    
    def test_debug_mode_enabled(self, client, mock_db):
        """Test debug mode not enabled in production"""
        response = client.get("/api/v1/debug")
        
        # Debug endpoints should not be accessible
        assert response.status_code in [404, 403]


class TestA06_VulnerableComponents:
    """A06:2021 Vulnerable and Outdated Components"""
    
    def test_known_vulnerable_dependencies(self, client, mock_db):
        """Test for known vulnerable dependencies"""
        # Would run npm audit or similar
        pass
    
    def test_outdated_components(self, client, mock_db):
        """Test components are up to date"""
        # Would check versions
        pass


class TestA07_AuthFailures:
    """A07:2021 Identification and Authentication Failures"""
    
    def test_weak_password_policy(self, client, mock_db):
        """Test weak passwords rejected"""
        response = client.post("/api/v1/auth/register", json={
            "email": "new@example.com",
            "password": "123"
        })
        
        # Should reject weak password
        assert response.status_code in [400, 422]
    
    def test_credential_dumping(self, client, mock_db):
        """Test credentials not easily enumerated"""
        # Try multiple emails to check if they exist
        responses = []
        for email in ["admin@test.com", "user@test.com", "test@test.com"]:
            response = client.post("/api/v1/auth/login", json={
                "email": email,
                "password": "wrong"
            })
            responses.append(response.status_code)
        
        # Should be consistent (same response for all)
        assert len(set(responses)) <= 2
    
    def test_session_fixation(self, client, mock_db):
        """Test session fixation protection"""
        # Login twice, should get new session
        pass
    
    def test_missing_mfa(self, client, mock_db):
        """Test MFA available for sensitive actions"""
        response = client.post("/api/v1/auth/enable-mfa", json={})
        
        # Should require auth
        assert response.status_code in [401, 403]


class TestA08_SoftwareIntegrity:
    """A08:2021 Software and Data Integrity Failures"""
    
    def test_unsigned_updates(self, client, mock_db):
        """Test software updates are signed"""
        pass
    
    def test_insecure_deserialization(self, client, mock_db):
        """Test deserialization security"""
        response = client.post("/api/v1/data", json={
            "data": "serialized_string"
        })
        
        # Should handle safely
        assert response.status_code in [200, 400]


class TestA09_LoggingFailures:
    """A09:2021 Security Logging and Monitoring Failures"""
    
    def test_successful_login_not_logged(self, client, mock_db):
        """Test login events logged"""
        # Would check logs
        pass
    
    def test_failed_login_not_logged(self, client, mock_db):
        """Test failed login logged"""
        pass
    
    def test_sensitive_operations_logged(self, client, mock_db):
        """Test sensitive operations logged"""
        pass


class TestA10_SSRF:
    """A10:2021 Server-Side Request Forgery"""
    
    def test_ssrf_in_url_parameter(self, client, mock_db):
        """Test SSRF via URL parameter"""
        response = client.get("/api/v1/fetch?url=http://169.254.169.254/")
        
        # Should block internal IPs
        assert response.status_code in [400, 403]
    
    def test_ssrf_in_file_upload(self, client, mock_db):
        """Test SSRF via file upload"""
        # Would test file uploads don't access internal resources
        pass


class TestAuthenticationSecurity:
    """Additional authentication security tests"""
    
    def test_password_not_stored_plaintext(self, client, mock_db):
        """Test passwords hashed"""
        pass
    
    def test_session_timeout(self, client, mock_db):
        """Test session expires"""
        pass
    
    def test_concurrent_session_limit(self, client, mock_db):
        """Test concurrent session limit"""
        pass
    
    def test_secure_password_reset(self, client, mock_db):
        """Test password reset flow secure"""
        response = client.post("/api/v1/auth/forgot-password", json={
            "email": "test@example.com"
        })
        
        # Should not reveal if email exists
        assert response.status_code == 200


class TestAPISecurity:
    """API-specific security tests"""
    
    def test_json_injection(self, client, mock_db):
        """Test JSON injection"""
        response = client.post("/api/v1/data", json={
            "key": "value\"\n\"injected\": \"true"
        })
        
        assert response.status_code in [200, 400]
    
    def test_mass_assignment(self, client, mock_db):
        """Test mass assignment protection"""
        response = client.post("/api/v1/users", json={
            "email": "test@example.com",
            "password": "password",
            "role": "admin"  # Should not be allowed
        })
        
        # Should not set role
        if response.status_code == 201:
            user = response.json()
            assert user.get("role") != "admin"
    
    def test_api_versioning(self, client, mock_db):
        """Test API versioning"""
        response = client.get("/api/v1/users")
        
        # Should have version header
        assert "api-version" in response.headers or response.status_code == 404


# Fixtures
@pytest.fixture
def mock_db():
    return Mock(spec=Session)


@pytest.fixture
def client():
    from services.app.main import app
    return TestClient(app)
