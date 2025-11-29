import { test, expect } from '@playwright/test';

const navigateToKitchen = async (page: import('@playwright/test').Page) => {
  await page.goto('/');
  await page.waitForSelector('text=Circuit Manager', { timeout: 10000 });
  // Use data-testid selector to click the Kitchen breaker module specifically
  const kitchenBreaker = page.locator('[data-testid^="breaker-module-"]').filter({ hasText: 'Kitchen' });
  await kitchenBreaker.click();
  await page.waitForSelector('[data-testid="device-manager"]', { timeout: 5000 });
};

test.describe('Custom device search', () => {
  test('adds a searched device to the outlet', async ({ page }) => {
    page.on('console', (msg) => {
      console.log('[browser-console]', msg.type(), msg.text());
    });

    await navigateToKitchen(page);

    const manager = page.getByTestId('device-manager').first();
    const deviceRows = manager.getByTestId('device-row');

    const initialCount = await deviceRows.count();

    // Click the custom search button (instead of using a select dropdown)
    await manager.getByRole('button', { name: /search for it/i }).click();
    await page.waitForTimeout(200);

    // Verify the search modal is visible
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    // Type in the search query
    const query = `toaster wattage ${Date.now()}`; // unique query to avoid caching
    await page.getByPlaceholder(/waffle maker|air purifier/i).fill(query);
    await page.getByRole('button', { name: /search.*add/i }).click();

    // Wait for search overlay to disappear
    await page.waitForSelector('text=Analyzing...', { state: 'detached', timeout: 15000 }).catch(() => {});

    await expect(deviceRows).toHaveCount(initialCount + 1, { timeout: 15000 });

    const latestText = await deviceRows.last().innerText();
    console.log('[custom-search] Added device row:', latestText);
  });
});
