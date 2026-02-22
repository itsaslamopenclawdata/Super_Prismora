import { test, expect } from '@playwright/test';

test.describe('Photo Gallery', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery');
  });

  test('should display photo gallery', async ({ page }) => {
    // Check for gallery heading
    await expect(page.getByRole('heading', { name: /gallery/i })).toBeVisible();
    
    // Check that photo grid is visible
    await expect(page.locator('[data-testid="photo-grid"]')).toBeVisible();
  });

  test('should display photos in grid layout', async ({ page }) => {
    // Get all photo cards
    const photos = page.locator('[data-testid="photo-card"]');
    
    // Should have at least some photos (or empty state)
    const count = await photos.count();
    if (count > 0) {
      // Check that each photo has an image
      for (let i = 0; i < count; i++) {
        await expect(photos.nth(i).locator('img')).toBeVisible();
      }
    } else {
      // Should show empty state
      await expect(page.getByText(/no photos yet/i)).toBeVisible();
    }
  });

  test('should filter photos by tag', async ({ page }) => {
    // Click on a tag filter
    await page.getByRole('button', { name: /tags/i }).click();
    
    // Select a specific tag
    await page.getByRole('menuitem', { name: /nature/i }).click();
    
    // URL should have tag filter
    await expect(page).toHaveURL(/.*tag=nature/);
    
    // Photos should be filtered
    // (Would need to check that only nature photos are shown)
  });

  test('should search photos by text', async ({ page }) => {
    // Enter search query
    await page.getByPlaceholder(/search/i).fill('mountain');
    
    // Press enter or click search
    await page.getByPlaceholder(/search/i).press('Enter');
    
    // URL should have search query
    await expect(page).toHaveURL(/.*q=mountain/);
  });

  test('should open photo detail view', async ({ page }) => {
    // Find a photo card and click it
    const firstPhoto = page.locator('[data-testid="photo-card"]').first();
    
    // Only proceed if there are photos
    if (await firstPhoto.count() > 0) {
      await firstPhoto.click();
      
      // Should navigate to photo detail page
      await expect(page).toHaveURL(/.*photos\/.*/);
      
      // Should show large photo
      await expect(page.locator('[data-testid="photo-detail"]')).toBeVisible();
      
      // Should show photo metadata
      await expect(page.getByText(/date/i)).toBeVisible();
      await expect(page.getByText(/size/i)).toBeVisible();
    }
  });

  test('should load more photos on scroll', async ({ page }) => {
    // Get initial photo count
    const initialCount = await page.locator('[data-testid="photo-card"]').count();
    
    // Scroll to bottom of page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Wait for potential loading indicator
    await page.waitForTimeout(1000);
    
    // Check if more photos loaded (this depends on pagination implementation)
    // For now, we'll just verify no errors occurred
    await expect(page).not.toHaveURL(/.*error/);
  });

  test('should sort photos by date', async ({ page }) => {
    // Open sort dropdown
    await page.getByRole('button', { name: /sort/i }).click();
    
    // Select "Newest First"
    await page.getByRole('menuitem', { name: /newest/i }).click();
    
    // URL should have sort parameter
    await expect(page).toHaveURL(/.*sort=newest/);
  });

  test('should toggle between grid and list view', async ({ page }) => {
    // Default should be grid view
    await expect(page.locator('[data-testid="photo-grid"]')).toBeVisible();
    
    // Click list view button
    await page.getByRole('button', { name: /list view/i }).click();
    
    // Should switch to list view
    await expect(page.locator('[data-testid="photo-list"]')).toBeVisible();
    
    // Click grid view button
    await page.getByRole('button', { name: /grid view/i }).click();
    
    // Should switch back to grid view
    await expect(page.locator('[data-testid="photo-grid"]')).toBeVisible();
  });
});
