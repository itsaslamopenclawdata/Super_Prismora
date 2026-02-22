# E2E Tests with Playwright

This directory contains end-to-end tests for the PhotoIdentifier platform using Playwright.

## Setup

```bash
# Install Playwright browsers
npx playwright install

# Install Playwright browsers for CI
npx playwright install --with-deps
```

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode
npm run test:e2e:ui

# Run tests in headed mode (visible browser)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug

# Run specific test file
npx playwright test auth.spec.ts

# Run tests in specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run tests on mobile viewport
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

## Test Organization

```
e2e/
├── auth.spec.ts              # Authentication tests
├── upload.spec.ts            # Photo upload tests
├── gallery.spec.ts           # Photo gallery tests
├── ai-identification.spec.ts # AI identification tests
└── fixtures/                 # Test data and images
    └── test-image.jpg
```

## Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

Reports are generated in `playwright-report/` directory.

## Writing Tests

### Basic Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should display home page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /photoidentifier/i })).toBeVisible();
});
```

### Using Page Objects

```typescript
// pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async login(email: string, password: string) {
    await this.page.getByLabel(/email/i).fill(email);
    await this.page.getByLabel(/password/i).fill(password);
    await this.page.getByRole('button', { name: /sign in/i }).click();
  }
}

// login.spec.ts
import { LoginPage } from './pages/LoginPage';

test('should login successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login('user@example.com', 'password');
  await expect(page).toHaveURL(/dashboard/);
});
```

### Handling Async Operations

```typescript
test('should upload photo', async ({ page }) => {
  await page.goto('/upload');
  
  // Select file
  const fileInput = page.getByLabel(/choose file/i);
  await fileInput.setInputFiles('path/to/test-image.jpg');
  
  // Wait for preview
  await expect(page.locator('img[alt*="preview"]')).toBeVisible();
  
  // Submit form
  await page.getByRole('button', { name: /upload/i }).click();
  
  // Wait for success
  await expect(page.getByText(/upload successful/i)).toBeVisible();
});
```

## Best Practices

1. **Use Locators**: Prefer `page.getByRole()`, `page.getByLabel()`, etc. over CSS selectors
2. **Wait for Elements**: Use `expect(locator).toBeVisible()` instead of fixed timeouts
3. **Test User Flows**: Test complete user journeys, not just individual components
4. **Isolate Tests**: Each test should be independent and clean up after itself
5. **Use Data Attributes**: Add `data-testid` attributes to elements for reliable selection

## Debugging

### Debug Mode

```bash
npm run test:e2e:debug
```

This opens Playwright Inspector with step-by-step debugging.

### Timeouts

```typescript
test('should load data', async ({ page }) => {
  await page.goto('/photos');
  
  // Custom timeout
  await expect(page.locator('[data-testid="photo-grid"]'))
    .toBeVisible({ timeout: 10000 });
});
```

### Screenshots

```typescript
test('should capture screenshot on failure', async ({ page }) => {
  await page.goto('/upload');
  
  // Take screenshot
  await page.screenshot({ path: 'screenshot.png' });
});
```

## CI/CD Integration

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Test Generator](https://playwright.dev/docs/codegen)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)
