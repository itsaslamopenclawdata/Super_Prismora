import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Photo Upload', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/upload');
  });

  test('should display upload page correctly', async ({ page }) => {
    // Check for upload heading
    await expect(page.getByRole('heading', { name: /upload/i })).toBeVisible();
    
    // Check for file input
    await expect(page.getByLabel(/choose file/i)).toBeVisible();
    
    // Check for upload button
    await expect(page.getByRole('button', { name: /upload/i })).toBeVisible();
  });

  test('should validate file selection', async ({ page }) => {
    // Try to upload without selecting a file
    await page.getByRole('button', { name: /upload/i }).click();
    
    // Should show validation error
    await expect(page.getByText(/please select a file/i)).toBeVisible();
  });

  test('should upload a valid image file', async ({ page }) => {
    // Get a test image file path
    const filePath = path.join(__dirname, 'fixtures', 'test-image.jpg');
    
    // Create a test file if it doesn't exist
    await page.evaluate(async () => {
      // In real tests, you'd have actual test images
      // This is a placeholder
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, 800, 600);
      const blob = await new Promise<Blob>((resolve) => canvas.toBlob(resolve!));
      const file = new File([blob!], 'test.jpg', { type: 'image/jpeg' });
      
      // This would normally use a real file input
      (window as any).testFile = file;
    });
    
    // Select file (this will need real file in actual tests)
    await page.getByLabel(/choose file/i).setInputFiles(filePath);
    
    // Wait for preview to appear
    await expect(page.locator('img[alt*="preview"]')).toBeVisible();
    
    // Click upload
    await page.getByRole('button', { name: /upload/i }).click();
    
    // Should show success message or navigate to photo page
    await expect(page.getByText(/upload successful/i)).toBeVisible();
  });

  test('should reject invalid file types', async ({ page }) => {
    // Try to upload a non-image file
    await page.getByLabel(/choose file/i).setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('test content'),
    });
    
    // Should show error message
    await expect(page.getByText(/invalid file type/i)).toBeVisible();
  });

  test('should allow adding tags to photo', async ({ page }) => {
    // Upload a photo first
    // Then add tags
    await page.getByPlaceholder(/add tags/i).fill('cat,pet,animal');
    
    // Add tag
    await page.getByRole('button', { name: /add/i }).click();
    
    // Should display added tags
    await expect(page.getByText(/cat/i)).toBeVisible();
    await expect(page.getByText(/pet/i)).toBeVisible();
  });
});
