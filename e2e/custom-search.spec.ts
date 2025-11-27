import { test, expect } from '@playwright/test';

const navigateToKitchen = async (page: import('@playwright/test').Page) => {
  await page.goto('/');
  await page.waitForSelector('text=PANEL SIM V19', { timeout: 10000 });
  await page.click('text=Kitchen');
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

    const dropdown = manager.locator('select');
    await dropdown.selectOption('CUSTOM_SEARCH');

    const modal = page.locator('text=Add Device').last();
    await expect(modal).toBeVisible();

    const query = `toaster wattage ${Date.now()}`; // unique query to avoid caching
    await page.getByPlaceholder('e.g. Toaster').fill(query);
    await page.getByRole('button', { name: 'Add', exact: true }).click();

    // Wait for search overlay to disappear
    await page.waitForSelector('text=Analyzing...', { state: 'detached', timeout: 15000 }).catch(() => {});

    await expect(deviceRows).toHaveCount(initialCount + 1, { timeout: 15000 });

    const latestText = await deviceRows.last().innerText();
    console.log('[custom-search] Added device row:', latestText);
  });
});

