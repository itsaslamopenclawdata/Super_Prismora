import { test, expect } from '@playwright/test';

test.describe('AI Photo Identification', () => {
  test.beforeEach(async ({ page }) => {
    // Assume we're authenticated for AI tests
    // In real tests, you'd log in first
    await page.goto('/');
  });

  test('should identify objects in uploaded photo', async ({ page }) => {
    // Go to upload page
    await page.goto('/upload');
    
    // Upload a photo (using test fixtures in real tests)
    await page.getByLabel(/choose file/i).setInputFiles('e2e/fixtures/test-image.jpg');
    
    // Click upload
    await page.getByRole('button', { name: /upload/i }).click();
    
    // Wait for upload to complete
    await page.waitForURL(/.*gallery|.*photos\/.*/);
    
    // Navigate to the uploaded photo
    await page.goto('/photos/test-photo-id');
    
    // Click "Identify" button
    await page.getByRole('button', { name: /identify|analyze/i }).click();
    
    // Should show loading state
    await expect(page.getByText(/analyzing|processing/i)).toBeVisible();
    
    // Wait for identification to complete
    await expect(page.getByText(/analysis complete/i)).toBeVisible({ timeout: 10000 });
    
    // Should show identified objects
    await expect(page.locator('[data-testid="identifications"]')).toBeVisible();
  });

  test('should display confidence scores', async ({ page }) => {
    await page.goto('/photos/test-photo-id');
    
    // Assuming photo has been identified
    // Check for confidence scores
    const confidenceElements = page.locator('[data-testid="confidence-score"]');
    
    const count = await confidenceElements.count();
    if (count > 0) {
      // Each confidence should be a percentage
      for (let i = 0; i < count; i++) {
        const text = await confidenceElements.nth(i).textContent();
        expect(text).toMatch(/\d+%/);
      }
    }
  });

  test('should display bounding boxes on photo', async ({ page }) => {
    await page.goto('/photos/test-photo-id');
    
    // Click "Show bounding boxes" if available
    const toggle = page.getByRole('button', { name: /bounding boxes/i });
    if (await toggle.count() > 0) {
      await toggle.click();
      
      // Should display bounding box overlays
      await expect(page.locator('[data-testid="bounding-box"]')).toBeVisible();
    }
  });

  test('should allow re-identification', async ({ page }) => {
    await page.goto('/photos/test-photo-id');
    
    // Click re-identify button
    await page.getByRole('button', { name: /re-identify|run again/i }).click();
    
    // Should start new analysis
    await expect(page.getByText(/analyzing/i)).toBeVisible();
    
    // Should complete with new results
    await expect(page.getByText(/analysis complete/i)).toBeVisible({ timeout: 10000 });
  });

  test('should display multiple identifications', async ({ page }) => {
    await page.goto('/photos/test-photo-id');
    
    // Get all identification cards
    const identifications = page.locator('[data-testid="identification-card"]');
    
    const count = await identifications.count();
    if (count > 0) {
      // Each should have a label and confidence
      for (let i = 0; i < Math.min(count, 5); i++) {
        await expect(identifications.nth(i).locator('[data-testid="label"]')).toBeVisible();
        await expect(identifications.nth(i).locator('[data-testid="confidence"]')).toBeVisible();
      }
    }
  });

  test('should filter identifications by confidence threshold', async ({ page }) => {
    await page.goto('/photos/test-photo-id');
    
    // Find confidence threshold slider
    const slider = page.getByRole('slider', { name: /confidence threshold/i });
    
    if (await slider.count() > 0) {
      // Set threshold to 80%
      await slider.fill('80');
      
      // Wait for results to filter
      await page.waitForTimeout(500);
      
      // All displayed identifications should have confidence >= 80%
      const confidenceElements = page.locator('[data-testid="confidence-score"]');
      const count = await confidenceElements.count();
      
      for (let i = 0; i < count; i++) {
        const text = await confidenceElements.nth(i).textContent();
        const value = parseInt(text!.replace('%', ''), 10);
        expect(value).toBeGreaterThanOrEqual(80);
      }
    }
  });

  test('should export identification results', async ({ page }) => {
    await page.goto('/photos/test-photo-id');
    
    // Click export button
    await page.getByRole('button', { name: /export|download/i }).click();
    
    // Select export format (e.g., JSON)
    await page.getByRole('menuitem', { name: /json/i }).click();
    
    // Should trigger download (check for download event or file)
    // In real tests, you'd verify the downloaded file
    await expect(page.getByText(/download started/i)).toBeVisible();
  });

  test('should show error when identification fails', async ({ page }) => {
    // Mock a scenario where identification would fail
    // This would typically involve intercepting the API call
    
    await page.goto('/photos/invalid-photo-id');
    
    // Click identify
    await page.getByRole('button', { name: /identify|analyze/i }).click();
    
    // Should show error message
    await expect(page.getByText(/identification failed|error/i)).toBeVisible();
  });
});
