import { test, expect } from '@playwright/test';

// Helper to add a device using the DevicePicker combobox
const addDeviceFromPicker = async (
  page: import('@playwright/test').Page,
  deviceManager: import('@playwright/test').Locator,
  deviceName: string
) => {
  // Click the "+ Add Device..." button to open the picker
  await deviceManager.getByRole('button', { name: /add device/i }).click();
  await page.waitForTimeout(200);
  // Click on the device option in the listbox
  await page.getByRole('option', { name: new RegExp(deviceName, 'i') }).first().click();
  await page.waitForTimeout(300);
};

test.describe('LED Bulb Duplicate Prevention', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Wait for the app to load - look for the panel simulator
    await page.waitForSelector('text=Circuit Manager', { timeout: 10000 });

    // Select the first breaker (Kitchen) by clicking on it using data-testid
    const kitchenBreaker = page.locator('[data-testid^="breaker-module-"]').filter({ hasText: 'Kitchen' });
    await kitchenBreaker.click();

    // Wait for the circuit editor to load (device manager appears)
    await page.waitForSelector('[data-testid="device-manager"]', { timeout: 5000 });
  });

  test('should add LED Bulb to an outlet when selected from picker', async ({ page }) => {
    const deviceManager = page.locator('[data-testid="device-manager"]').first();
    const deviceList = deviceManager.locator('[data-testid="device-list"]');

    // Count initial devices (should be 0)
    const initialDeviceCount = await deviceList.locator('text=LED Bulb').count();
    expect(initialDeviceCount).toBe(0);

    // Add LED Bulb using the picker
    await addDeviceFromPicker(page, deviceManager, 'LED Bulb');

    // Verify that LED Bulb was added
    const ledBulbCount = await deviceList.locator('text=LED Bulb').count();
    expect(ledBulbCount).toBe(1);
  });

  test('should reset dropdown value after selecting LED Bulb', async ({ page }) => {
    const deviceManager = page.locator('[data-testid="device-manager"]').first();

    // Add LED Bulb using the picker
    await addDeviceFromPicker(page, deviceManager, 'LED Bulb');

    // Verify device was added
    await expect(deviceManager.locator('text=LED Bulb').first()).toBeVisible({ timeout: 1000 });

    // Verify the picker button shows the placeholder again (not the selected value)
    const addButton = deviceManager.getByRole('button', { name: /add device/i });
    await expect(addButton).toBeVisible();
  });

  test('should allow adding LED Bulb to multiple outlets separately', async ({ page }) => {
    // Add a second outlet to the circuit
    const addOutletButton = page.getByRole('button', { name: 'Add outlet' });
    await addOutletButton.click();
    await page.waitForTimeout(300);

    const deviceManagers = page.locator('[data-testid="device-manager"]');

    // Add LED Bulb to first outlet
    await addDeviceFromPicker(page, deviceManagers.nth(0), 'LED Bulb');

    // Add LED Bulb to second outlet
    await addDeviceFromPicker(page, deviceManagers.nth(1), 'LED Bulb');

    const ledBulbCount = await page.locator('[data-testid="device-list"]').locator('text=LED Bulb').count();
    expect(ledBulbCount).toBe(2);
  });
});
