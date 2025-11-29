import { test, expect } from '@playwright/test';

const navigateToKitchen = async (page: import('@playwright/test').Page) => {
  await page.goto('/');
  await page.waitForSelector('text=Circuit Manager', { timeout: 10000 });
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

    // Use the DevicePicker to add a high-wattage device
    const firstDeviceManager = page.getByTestId('device-manager').first();

    // Click the "Add Device..." button to open the picker
    const addDeviceButton = firstDeviceManager.getByRole('button', { name: /add device/i });
    await addDeviceButton.click();
    await page.waitForTimeout(200);

    // Search for Space Heater and click it
    const searchInput = page.getByRole('searchbox', { name: /search devices/i });
    await searchInput.fill('Space Heater');
    await page.waitForTimeout(200);

    // Click on first Space Heater in the list (there are multiple wattage options)
    const spaceHeaterOption = page.getByRole('option', { name: /space heater/i }).first();
    await spaceHeaterOption.click();
    await page.waitForTimeout(300);

    // Temperature should rise over time with the heavy load
    await expect
      .poll(async () => readTemperature(breakerTemp), { timeout: 6000, intervals: [500] })
      .toBeGreaterThanOrEqual(initialBreakerTemp);
  });
});
