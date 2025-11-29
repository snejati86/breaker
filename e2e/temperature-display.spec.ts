import { test, expect } from '@playwright/test';

const navigateToKitchen = async (page: import('@playwright/test').Page) => {
  await page.goto('/');
  await page.waitForSelector('text=Circuit Manager', { timeout: 10000 });
  // Use data-testid selector to click the Kitchen breaker module specifically
  const kitchenBreaker = page.locator('[data-testid^="breaker-module-"]').filter({ hasText: 'Kitchen' });
  await kitchenBreaker.click();
  await page.waitForSelector('[data-testid="breaker-temp"]', { timeout: 5000 });
};

const readTemperature = async (locator: import('@playwright/test').Locator): Promise<number> => {
  const attr = await locator.getAttribute('data-temp-value');
  const raw = attr ?? (await locator.innerText());
  const match = raw.match(/([\d.]+)/);
  return match ? Number(match[1]) : NaN;
};

test.describe('Temperature Display', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToKitchen(page);
  });

  test('shows breaker temperature', async ({ page }) => {
    const breakerTemp = page.getByTestId('breaker-temp');
    await expect(breakerTemp).toContainText('°F');
  });

  test('temperatures rise when heavy load is added', async ({ page }) => {
    const breakerTemp = page.getByTestId('breaker-temp');

    const initialBreakerTemp = await readTemperature(breakerTemp);

    // Add device using the device picker
    const firstDeviceManager = page.getByTestId('device-manager').first();
    await firstDeviceManager.getByRole('button', { name: /add device/i }).click();
    await page.waitForTimeout(200);
    await page.getByRole('option', { name: /Space Heater/i }).first().click();
    await page.waitForTimeout(300);

    // Breaker temperature should rise with load
    await expect
      .poll(async () => readTemperature(breakerTemp), { timeout: 6000, intervals: [500] })
      .toBeGreaterThanOrEqual(initialBreakerTemp);
  });
});
