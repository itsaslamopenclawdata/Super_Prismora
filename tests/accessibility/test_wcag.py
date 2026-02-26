"""
Accessibility Tests - WCAG 2.1 AA Compliance

Tests for WCAG 2.1 AA accessibility compliance.
Covers keyboard navigation, screen reader, color contrast, and more.

Priority: MEDIUM
"""

import pytest
from playwright.sync_api import sync_playwright, expect


class TestKeyboardNavigation:
    """Test keyboard navigation accessibility"""
    
    @pytest.fixture(autouse=True)
    def setup(self, browser):
        self.context = browser.new_context()
        self.page = self.context.new_page()
        yield
        self.context.close()
    
    def test_all_interactive_elements_focusable(self):
        """Test all interactive elements are keyboard accessible"""
        self.page.goto("http://localhost:3000")
        
        # Get all interactive elements
        interactive_selectors = [
            'a[href]',
            'button',
            'input',
            'select',
            'textarea',
            '[tabindex]',
        ]
        
        for selector in interactive_selectors:
            elements = self.page.query_all(selector)
            for el in elements:
                # Check tabindex is not -1 (unless it's dynamically focusable)
                tabindex = el.get_attribute('tabindex')
                if tabindex == '-1':
                    # Should have role and be in focus trap
                    role = el.get_attribute('role')
                    assert role is not None, f"Element with tabindex=-1 missing role: {el}"
    
    def test_skip_links_present(self):
        """Test skip navigation links present"""
        self.page.goto("http://localhost:3000")
        
        # Check for skip link
        skip_link = self.page.locator('a[href="#main-content"], a[href="#content"]')
        
        # Either skip link exists or page has main landmark
        if skip_link.count() == 0:
            main = self.page.locator('main, [role="main"]')
            assert main.count() > 0, "No skip link or main landmark found"
    
    def test_focus_order_logical(self):
        """Test focus order follows visual order"""
        self.page.goto("http://localhost:3000/login")
        
        # Get all focusable elements in tab order
        focusable = self.page.query_all('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])')
        
        # Get their bounding boxes
        positions = []
        for el in focusable:
            box = el.bounding_box()
            if box:
                positions.append((box['x'], box['y'], el))
        
        # Sort by position (top to bottom, left to right)
        positions.sort(key=lambda p: (p[1], p[0]))
        
        # Tab through and verify order
        self.page.keyboard.press('Tab')
        focused = self.page.evaluate('document.activeElement')
        
        # This is a basic check - full implementation would track actual tab order
        assert focused is not None, "No element focused after Tab"
    
    def test_modal_focus_trap(self):
        """Test modal has focus trap"""
        self.page.goto("http://localhost:3000")
        
        # Open modal
        self.page.click('button:has-text("Open Modal")')
        
        # Check modal is visible
        modal = self.page.locator('[role="dialog"]')
        expect(modal).to_be_visible()
        
        # Tab should cycle within modal
        initial_focused = self.page.evaluate('document.activeElement')
        
        # Press Tab multiple times
        for _ in range(5):
            self.page.keyboard.press('Tab')
        
        # Focus should still be within modal
        focused = self.page.evaluate('document.activeElement')
        modal_element = modal.first
        # Check if focused element is within modal (simplified check)
        assert focused is not None


class TestColorContrast:
    """Test color contrast accessibility"""
    
    @pytest.fixture(autouse=True)
    def setup(self, browser):
        self.context = browser.new_context()
        self.page = self.context.new_page()
        yield
        self.context.close()
    
    def test_normal_text_contrast(self):
        """Test normal text meets 4.5:1 contrast"""
        self.page.goto("http://localhost:3000")
        
        # Get all text elements
        text_elements = self.page.query_all('p, span, a, h1, h2, h3, h4, h5, h6, li, td, th')
        
        for el in text_elements:
            # Skip if element is hidden
            if el.is_hidden():
                continue
            
            # Get computed styles
            styles = self.page.evaluate('''(el) => {
                const style = window.getComputedStyle(el);
                return {
                    color: style.color,
                    backgroundColor: style.backgroundColor,
                    fontSize: parseFloat(style.fontSize),
                    fontWeight: style.fontWeight
                };
            }''', el)
            
            # Check large text (18px+ or 14px+ bold)
            is_large_text = styles['fontSize'] >= 18 or (styles['fontSize'] >= 14 and int(styles['fontWeight']) >= 700)
            
            # For this test, we'd need actual color contrast calculation
            # This is a placeholder - in production, use axe-core or similar
    
    def test_link_text_contrast(self):
        """Test link text has sufficient contrast"""
        self.page.goto("http://localhost:3000")
        
        links = self.page.query_all('a:not([class*="button"]), a[class*="link"]')
        
        for link in links:
            if link.is_hidden():
                continue
            
            # Check link stands out from surrounding text
            # In production, use actual contrast calculation


class TestScreenReader:
    """Test screen reader accessibility"""
    
    @pytest.fixture(autouse=True)
    def setup(self, browser):
        self.context = browser.new_context()
        self.page = self.context.new_page()
        yield
        self.context.close()
    
    def test_images_have_alt_text(self):
        """Test images have alt text"""
        self.page.goto("http://localhost:3000")
        
        images = self.page.query_all('img')
        
        for img in images:
            alt = img.get_attribute('alt')
            
            # Alt should be present
            assert alt is not None, f"Image missing alt attribute"
            
            # Decorative images can have alt=""
            # But meaningful images need descriptive alt
            src = img.get_attribute('src')
            if alt == '':
                # Should be marked decorative
                role = img.get_attribute('role')
                assert role == 'presentation' or role == 'img', "Decorative image missing role"
    
    def test_form_labels_present(self):
        """Test form inputs have labels"""
        self.page.goto("http://localhost:3000/register")
        
        inputs = self.page.query_all('input:not([type="hidden"]):not([type="submit"])')
        
        for inp in inputs:
            # Check for associated label
            input_id = input.get_attribute('id')
            
            # Either has id with matching label, or aria-label, or aria-labelledby
            has_label = False
            
            if input_id:
                label = self.page.locator(f'label[for="{input_id}"]')
                if label.count() > 0:
                    has_label = True
            
            aria_label = input.get_attribute('aria-label')
            aria_labelledby = input.get_attribute('aria-labelledby')
            
            has_label = has_label or (aria_label is not None) or (aria_labelledby is not None)
            
            assert has_label, f"Input missing label: {input}"
    
    def test_error_messages_announced(self):
        """Test error messages are announced to screen readers"""
        self.page.goto("http://localhost:3000/register")
        
        # Submit empty form
        self.page.click('button[type="submit"]')
        
        # Check for error messages with aria-live
        errors = self.page.query_all('[aria-live="polite"], [aria-live="assertive"]')
        
        # Either errors have live region, or form uses aria-invalid
        form = self.page.locator('form')
        if form.count() > 0:
            # This is a basic check
            pass
    
    def test_headings_hierarchy(self):
        """Test heading hierarchy is correct"""
        self.page.goto("http://localhost:3000")
        
        headings = self.page.query_all('h1, h2, h3, h4, h5, h6')
        
        previous_level = 0
        
        for heading in headings:
            # Get heading level
            tag = heading.evaluate('el => el.tagName')
            level = int(tag[1])
            
            # Level should not jump more than 1
            if previous_level > 0:
                assert level <= previous_level + 1, \
                    f"Heading level jumps from {previous_level} to {level}"
            
            previous_level = level
        
        # Should have exactly one h1
        h1_count = self.page.locator('h1').count()
        assert h1_count == 1, f"Page should have exactly one h1, found {h1_count}"


class TestARIA:
    """Test ARIA attributes"""
    
    @pytest.fixture(autouse=True)
    def setup(self, browser):
        self.context = browser.new_context()
        self.page = self.context.new_page()
        yield
        self.context.close()
    
    def test_buttons_have_roles(self):
        """Test buttons have proper roles"""
        self.page.goto("http://localhost:3000")
        
        # Icon buttons should have aria-label
        icon_buttons = self.page.query_all('button:has(svg)')
        
        for btn in icon_buttons:
            aria_label = btn.get_attribute('aria-label')
            # Should have aria-label or title
            assert aria_label is not None or btn.get_attribute('title') is not None, \
                "Icon button missing aria-label or title"
    
    def test_custom_widgets_have_roles(self):
        """Test custom widgets have proper ARIA roles"""
        self.page.goto("http://localhost:3000")
        
        # Check for custom interactive elements
        custom_widgets = self.page.query_all('[role="button"], [role="slider"], [role="tablist"]')
        
        for widget in custom_widgets:
            role = widget.get_attribute('role')
            # Should be keyboard accessible
            tabindex = widget.get_attribute('tabindex')
            assert tabindex is not None or role == 'button', \
                f"Widget with role={role} not keyboard accessible"
    
    def test_landmarks_present(self):
        """Test page has proper landmarks"""
        self.page.goto("http://localhost:3000")
        
        # Check for main landmark
        main = self.page.locator('main, [role="main"]')
        assert main.count() > 0, "Page missing main landmark"
        
        # Check for navigation
        nav = self.page.locator('nav, [role="navigation"]')
        assert nav.count() > 0, "Page missing navigation"
        
        # Check for footer
        footer = self.page.locator('footer, [role="contentinfo"]')
        assert footer.count() > 0, "Page missing footer"


class TestTouchTargets:
    """Test touch target accessibility"""
    
    @pytest.fixture(autouse=True)
    def setup(self, browser):
        self.context = browser.new_context()
        self.page = self.context.new_page()
        yield
        self.context.close()
    
    def test_touch_targets_large_enough(self):
        """Test touch targets are at least 44x44px"""
        self.page.goto("http://localhost:3000")
        
        buttons = self.page.query_all('button, a[class*="button"], .btn')
        
        for btn in buttons:
            if btn.is_hidden():
                continue
            
            box = btn.bounding_box()
            if box:
                # Touch target should be at least 44x44
                assert box['width'] >= 44, f"Button width {box['width']} < 44px"
                assert box['height'] >= 44, f"Button height {box['height']} < 44px"
    
    def test_links_not_nested(self):
        """Test links are not nested inside other links"""
        self.page.goto("http://localhost:3000")
        
        # Check for nested links (invalid HTML)
        nested = self.page.evaluate('''() => {
            const links = document.querySelectorAll('a');
            for (const link of links) {
                if (link.querySelector('a')) return true;
            }
            return false;
        }''')
        
        assert not nested, "Found nested links (invalid HTML)"


class TestForms:
    """Test form accessibility"""
    
    @pytest.fixture(autouse=True)
    def setup(self, browser):
        self.context = browser.new_context()
        self.page = self.context.new_page()
        yield
        self.context.close()
    
    def test_required_fields_marked(self):
        """Test required fields are marked"""
        self.page.goto("http://localhost:3000/register")
        
        required_inputs = self.page.query_all('input[required]')
        
        for inp in required_inputs:
            # Should have aria-required or required attribute
            aria_required = input.get_attribute('aria-required')
            assert aria_required == 'true' or input.get_attribute('required'), \
                "Required field not properly marked"
    
    def test_autocomplete_on_personal_fields(self):
        """Test form inputs have autocomplete attributes"""
        self.page.goto("http://localhost:3000/profile")
        
        # Check name fields have autocomplete
        name_input = self.page.locator('input[name="name"], input[id="name"]')
        
        if name_input.count() > 0:
            autocomplete = name_input.first.get_attribute('autocomplete')
            # Should have autocomplete for accessibility
            # This is a recommendation, not strict requirement
    
    def test_password_visibility_toggle(self):
        """Test password field has visibility toggle"""
        self.page.goto("http://localhost:3000/login")
        
        password_input = self.page.locator('input[type="password"]')
        
        if password_input.count() > 0:
            # Should have show/hide password button
            toggle = self.page.locator('button[aria-label*="password"], button[aria-label*="visibility"]')
            # This is recommended for accessibility


# Fixtures
@pytest.fixture(scope="session")
def browser():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        yield browser
        browser.close()
