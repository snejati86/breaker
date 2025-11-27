import { test, expect } from '@playwright/test';

const navigateToKitchen = async (page: import('@playwright/test').Page) => {
  await page.goto('/');
  await page.waitForSelector('text=PANEL SIM V19', { timeout: 10000 });
  await page.click('text=Kitchen');
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

  test('shows breaker and component temperatures', async ({ page }) => {
    const breakerTemp = page.getByTestId('breaker-temp');
    await expect(breakerTemp).toContainText('°F');

    const componentTemp = page.getByTestId('component-temp').first();
    await expect(componentTemp).toContainText('°F');
  });

  test('temperatures rise when heavy load is added', async ({ page }) => {
    const breakerTemp = page.getByTestId('breaker-temp');
    const componentTemp = page.getByTestId('component-temp').first();

    const initialBreakerTemp = await readTemperature(breakerTemp);
    const initialComponentTemp = await readTemperature(componentTemp);

    const firstDeviceManager = page.getByTestId('device-manager').first();
    const dropdown = firstDeviceManager.locator('select');
    const addButton = firstDeviceManager.getByRole('button', { name: 'Add Device' });

    await dropdown.selectOption('Space Heater');
    await addButton.click();

    await expect
      .poll(async () => readTemperature(componentTemp), { timeout: 6000, intervals: [500] })
      .toBeGreaterThan(initialComponentTemp);

    await expect
      .poll(async () => readTemperature(breakerTemp), { timeout: 6000, intervals: [500] })
      .toBeGreaterThanOrEqual(initialBreakerTemp);
  });
});

