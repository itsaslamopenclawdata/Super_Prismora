"""
End-to-End Tests - Main User Flows

E2E tests for critical user journeys.
Covers authentication, photo upload, identification, and collection management.

Priority: HIGH
"""

import pytest
from playwright.sync_api import sync_playwright, expect


class TestAuthenticationFlow:
    """E2E tests for authentication"""
    
    @pytest.fixture(autouse=True)
    def setup(self, browser):
        self.context = browser.new_context()
        self.page = self.context.new_page()
        yield
        self.context.close()
    
    def test_user_registration_flow(self):
        """Test complete user registration"""
        # Navigate to registration
        self.page.goto("http://localhost:3000/register")
        
        # Fill registration form
        self.page.fill('input[name="email"]', f"test_{uuid4()}@example.com")
        self.page.fill('input[name="password"]', "SecurePass123!")
        self.page.fill('input[name="confirmPassword"]', "SecurePass123!")
        self.page.click('button[type="submit"]')
        
        # Should redirect to verification or dashboard
        expect(self.page).to_have_url(["**/verify", "**/dashboard"], timeout=10000)
    
    def test_user_login_flow(self):
        """Test user login"""
        self.page.goto("http://localhost:3000/login")
        
        self.page.fill('input[name="email"]', "test@example.com")
        self.page.fill('input[name="password"]', "SecurePass123!")
        self.page.click('button[type="submit"]')
        
        # Should redirect to dashboard
        expect(self.page).to_have_url("**/dashboard", timeout=10000)
    
    def test_oauth_login_google(self):
        """Test Google OAuth login"""
        self.page.goto("http://localhost:3000/login")
        
        # Click Google login
        self.page.click('button:has-text("Continue with Google")')
        
        # Should redirect to Google
        expect(self.page).to_have_url("**://accounts.google.com/**", timeout=10000)
    
    def test_password_reset_flow(self):
        """Test password reset"""
        self.page.goto("http://localhost:3000/forgot-password")
        
        self.page.fill('input[name="email"]', "test@example.com")
        self.page.click('button[type="submit"]')
        
        # Should show success message
        expect(self.page.locator("text=reset link")).to_be_visible()
    
    def test_logout_flow(self):
        """Test user logout"""
        # Login first
        self.page.goto("http://localhost:3000/login")
        self.page.fill('input[name="email"]', "test@example.com")
        self.page.fill('input[name="password"]', "SecurePass123!")
        self.page.click('button[type="submit"]')
        
        # Wait for dashboard
        self.page.wait_for_url("**/dashboard")
        
        # Click logout
        self.page.click('button:has-text("Logout")')
        
        # Should redirect to login
        expect(self.page).to_have_url("**/login", timeout=10000)


class TestPhotoUploadFlow:
    """E2E tests for photo upload"""
    
    @pytest.fixture(autouse=True)
    def setup(self, browser):
        self.context = browser.new_context()
        self.page = self.context.new_page()
        yield
        self.context.close()
    
    def test_single_photo_upload(self):
        """Test uploading a single photo"""
        # Login first
        self.login()
        
        # Navigate to upload
        self.page.goto("http://localhost:3000/upload")
        
        # Upload photo
        self.page.set_input_files(
            'input[type="file"]',
            ["tests/fixtures/test-photo.jpg"]
        )
        
        # Wait for upload to complete
        self.page.wait_for_selector('text=Upload complete', timeout=30000)
        
        # Should see the uploaded photo
        expect(self.page.locator('img[alt="uploaded"]')).to_be_visible()
    
    def test_multiple_photo_upload(self):
        """Test uploading multiple photos"""
        self.login()
        self.page.goto("http://localhost:3000/upload")
        
        # Upload multiple photos
        self.page.set_input_files(
            'input[type="file"]',
            [
                "tests/fixtures/photo1.jpg",
                "tests/fixtures/photo2.jpg",
                "tests/fixtures/photo3.jpg"
            ]
        )
        
        # Wait for all uploads
        self.page.wait_for_selector('text=3 uploads complete', timeout=60000)
    
    def test_invalid_file_upload(self):
        """Test uploading invalid file type"""
        self.login()
        self.page.goto("http://localhost:3000/upload")
        
        # Try to upload non-image
        self.page.set_input_files(
            'input[type="file"]',
            ["tests/fixtures/document.pdf"]
        )
        
        # Should show error
        expect(self.page.locator('text="Invalid file type"')).to_be_visible()
    
    def test_large_file_upload(self):
        """Test uploading file exceeding size limit"""
        self.login()
        self.page.goto("http://localhost:3000/upload")
        
        # Create large file (would need actual large file)
        # This is a placeholder
        pass


class TestAIIdentificationFlow:
    """E2E tests for AI identification"""
    
    @pytest.fixture(autouse=True)
    def setup(self, browser):
        self.context = browser.new_context()
        self.page = self.context.new_page()
        yield
        self.context.close()
    
    def test_identify_photo(self):
        """Test photo identification"""
        self.login()
        
        # Upload photo
        self.page.goto("http://localhost:3000/upload")
        self.page.set_input_files(
            'input[type="file"]',
            ["tests/fixtures/flower.jpg"]
        )
        self.page.wait_for_selector('text=Upload complete', timeout=30000)
        
        # Click identify
        self.page.click('button:has-text("Identify")')
        
        # Wait for identification to complete
        self.page.wait_for_selector('text=Identification complete', timeout=120000)
        
        # Should show results
        expect(self.page.locator('.identification-results')).to_be_visible()
    
    def test_identify_flora(self):
        """Test flora identification"""
        self.login()
        
        # Upload flower photo
        self.page.goto("http://localhost:3000/apps/flora/upload")
        self.page.set_input_files(
            'input[type="file"]',
            ["tests/fixtures/flower.jpg"]
        )
        self.page.wait_for_selector('text=Upload complete', timeout=30000)
        
        # Click identify
        self.page.click('button:has-text("Identify Species")')
        
        # Should show species identification
        self.page.wait_for_selector('.species-result', timeout=120000)
    
    def test_identify_coin(self):
        """Test coin identification"""
        self.login()
        
        self.page.goto("http://localhost:3000/apps/coins/upload")
        self.page.set_input_files(
            'input[type="file"]',
            ["tests/fixtures/coin.jpg"]
        )
        self.page.wait_for_selector('text=Upload complete', timeout=30000)
        
        self.page.click('button:has-text("Identify Coin")')
        
        self.page.wait_for_selector('.coin-result', timeout=120000)
    
    def test_batch_identification(self):
        """Test batch identification"""
        self.login()
        
        self.page.goto("http://localhost:3000/upload/batch")
        
        # Upload multiple photos
        self.page.set_input_files(
            'input[type="file"]',
            [
                "tests/fixtures/photo1.jpg",
                "tests/fixtures/photo2.jpg",
                "tests/fixtures/photo3.jpg"
            ]
        )
        
        # Start batch identification
        self.page.click('button:has-text("Identify All")')
        
        # Wait for all identifications
        self.page.wait_for_selector('text=Batch complete', timeout=300000)


class TestCollectionManagement:
    """E2E tests for collections"""
    
    @pytest.fixture(autouse=True)
    def setup(self, browser):
        self.context = browser.new_context()
        self.page = self.context.new_page()
        yield
        self.context.close()
    
    def test_create_collection(self):
        """Test creating a new collection"""
        self.login()
        
        self.page.goto("http://localhost:3000/collections")
        
        # Click create collection
        self.page.click('button:has-text("New Collection")')
        
        # Fill form
        self.page.fill('input[name="name"]', "My Nature Photos")
        self.page.fill('textarea[name="description"]', "Collection of nature photos")
        self.page.click('button:has-text("Create")')
        
        # Should see new collection
        expect(self.page.locator('text=My Nature Photos')).to_be_visible()
    
    def test_add_to_collection(self):
        """Test adding photo to collection"""
        self.login()
        
        # Upload photo first
        self.page.goto("http://localhost:3000/upload")
        self.page.set_input_files(
            'input[type="file"]',
            ["tests/fixtures/photo.jpg"]
        )
        self.page.wait_for_selector('text=Upload complete', timeout=30000)
        
        # Add to collection
        self.page.click('button[aria-label="Add to collection"]')
        self.page.click('text=My Nature Photos')
        
        # Should confirm
        expect(self.page.locator('text=Added to collection')).to_be_visible()
    
    def test_share_collection(self):
        """Test sharing a collection"""
        self.login()
        
        self.page.goto("http://localhost:3000/collections/my-nature-photos")
        
        # Click share
        self.page.click('button:has-text("Share")')
        
        # Enter share email
        self.page.fill('input[name="email"]', "friend@example.com")
        self.page.click('button:has-text("Share")')
        
        expect(self.page.locator('text=Invitation sent')).to_be_visible()


class TestUserProfile:
    """E2E tests for user profile"""
    
    @pytest.fixture(autouse=True)
    def setup(self, browser):
        self.context = browser.new_context()
        self.page = self.context.new_page()
        yield
        self.context.close()
    
    def test_update_profile(self):
        """Test updating user profile"""
        self.login()
        
        self.page.goto("http://localhost:3000/profile")
        
        # Edit profile
        self.page.click('button:has-text("Edit Profile")')
        
        self.page.fill('input[name="name"]', "John Doe")
        self.page.fill('input[name="bio"]', "Nature photographer")
        
        self.page.click('button:has-text("Save")')
        
        expect(self.page.locator('text=Profile updated')).to_be_visible()
    
    def test_change_password(self):
        """Test changing password"""
        self.login()
        
        self.page.goto("http://localhost:3000/profile/security")
        
        self.page.fill('input[name="currentPassword"]', "OldPass123!")
        self.page.fill('input[name="newPassword"]', "NewPass123!")
        self.page.fill('input[name="confirmPassword"]', "NewPass123!")
        
        self.page.click('button:has-text("Change Password")')
        
        expect(self.page.locator('text=Password changed')).to_be_visible()
    
    def test_enable_mfa(self):
        """Test enabling MFA"""
        self.login()
        
        self.page.goto("http://localhost:3000/profile/security")
        
        self.page.click('button:has-text("Enable MFA")')
        
        # Should show QR code
        expect(self.page.locator('img[alt="QR Code"]')).to_be_visible()


class TestSearchAndFilter:
    """E2E tests for search and filtering"""
    
    @pytest.fixture(autouse=True)
    def setup(self, browser):
        self.context = browser.new_context()
        self.page = self.context.new_page()
        yield
        self.context.close()
    
    def test_search_photos(self):
        """Test searching photos"""
        self.login()
        
        self.page.goto("http://localhost:3000/photos")
        
        # Search
        self.page.fill('input[type="search"]', "flower")
        self.page.press('input[type="search"]', "Enter")
        
        # Should show results
        expect(self.page.locator('.photo-grid')).to_be_visible()
    
    def test_filter_by_date(self):
        """Test filtering by date"""
        self.login()
        
        self.page.goto("http://localhost:3000/photos")
        
        # Open filters
        self.page.click('button:has-text("Filters")')
        
        # Select date range
        self.page.fill('input[name="startDate"]', "2026-01-01")
        self.page.fill('input[name="endDate"]', "2026-02-26")
        
        self.page.click('button:has-text("Apply")')
        
        # Should filter results
        expect(self.page.locator('.photo-grid')).to_be_visible()
    
    def test_search_by_tag(self):
        """Test searching by tags"""
        self.login()
        
        self.page.goto("http://localhost:3000/photos")
        
        self.page.click('text=Tags')
        self.page.click('text=nature')
        
        # Should show tagged photos
        expect(self.page.locator('.photo-grid')).to_be_visible()


# Helper functions
def uuid4():
    import uuid
    return str(uuid.uuid4())


# Fixtures
@pytest.fixture(scope="session")
def browser():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        yield browser
        browser.close()


def login(page):
    """Helper to login"""
    page.goto("http://localhost:3000/login")
    page.fill('input[name="email"]', "test@example.com")
    page.fill('input[name="password"]', "SecurePass123!")
    page.click('button[type="submit"]')
    page.wait_for_url("**/dashboard", timeout=10000)
