import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page before each test
    await page.goto('/');
  });

  test('should display login button when not authenticated', async ({ page }) => {
    // Check that login button is visible
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    // Click login button
    await page.getByRole('button', { name: /login/i }).click();
    
    // Should be on login page
    await expect(page).toHaveURL(/.*login/);
  });

  test('should show validation errors with empty credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit without entering credentials
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should show validation errors
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should display error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Enter invalid credentials
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should show error message
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should navigate between pages', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to gallery
    await page.getByRole('link', { name: /gallery/i }).click();
    await expect(page).toHaveURL(/.*gallery/);
    
    // Navigate to upload
    await page.getByRole('link', { name: /upload/i }).click();
    await expect(page).toHaveURL(/.*upload/);
    
    // Navigate to settings
    await page.getByRole('link', { name: /settings/i }).click();
    await expect(page).toHaveURL(/.*settings/);
    
    // Navigate back home
    await page.getByRole('link', { name: /home/i }).click();
    await expect(page).toHaveURL('/');
  });

  test('should have working mobile navigation', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Click mobile menu button
    await page.getByRole('button', { name: /menu/i }).click();
    
    // Should show mobile menu
    await expect(page.getByRole('navigation')).toBeVisible();
    
    // Click gallery link
    await page.getByRole('link', { name: /gallery/i }).click();
    
    // Should navigate and close menu
    await expect(page).toHaveURL(/.*gallery/);
  });
});
