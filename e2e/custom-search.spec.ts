import { test, expect } from '@playwright/test';

const navigateToKitchen = async (page: import('@playwright/test').Page) => {
  await page.goto('/');
  await page.waitForSelector('text=Circuit Manager', { timeout: 10000 });
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

    // Click "Can't find your device? Search for it" button to open custom search modal
    const customSearchButton = manager.getByRole('button', { name: /can't find your device/i });
    await customSearchButton.click();

    // Wait for modal to appear
    const modal = page.locator('text=Search for Device');
    await expect(modal).toBeVisible();

    const query = `toaster wattage ${Date.now()}`; // unique query to avoid caching
    await page.getByPlaceholder(/waffle maker/i).fill(query);
    await page.getByRole('button', { name: 'Search & Add' }).click();

    // Wait for search overlay to disappear
    await page.waitForSelector('text=Analyzing device...', { state: 'detached', timeout: 15000 }).catch(() => {});

    await expect(deviceRows).toHaveCount(initialCount + 1, { timeout: 15000 });

    const latestText = await deviceRows.last().innerText();
    console.log('[custom-search] Added device row:', latestText);
  });
});
