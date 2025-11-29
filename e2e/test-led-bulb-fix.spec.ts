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

test('Verify LED Bulb is only added once when selected from dropdown', async ({ page }) => {
  // Navigate to the app
  await page.goto('/');

  // Wait for the app to load
  await page.waitForSelector('text=Circuit Manager', { timeout: 10000 });

  // Select the first breaker (Kitchen) by clicking on it using data-testid
  const kitchenBreaker = page.locator('[data-testid^="breaker-module-"]').filter({ hasText: 'Kitchen' });
  await kitchenBreaker.click();

  // Wait for the circuit editor to load (device manager appears)
  await page.waitForSelector('[data-testid="device-manager"]', { timeout: 5000 });

  // Work with the first device manager (first outlet)
  const deviceManager = page.locator('[data-testid="device-manager"]').first();
  const deviceList = deviceManager.locator('[data-testid="device-list"]');

  // Count initial LED Bulb devices (should be 0)
  const initialCount = await deviceList.locator('text=LED Bulb').count();
  console.log(`Initial LED Bulb count: ${initialCount}`);

  // Add LED Bulb using the device picker
  await addDeviceFromPicker(page, deviceManager, 'LED Bulb');

  // Count LED Bulb devices after adding
  const afterAddCount = await deviceList.locator('text=LED Bulb').count();
  console.log(`After adding LED Bulb count: ${afterAddCount}`);

  // Should only be 1 LED Bulb added
  expect(afterAddCount).toBe(1);

  // Verify the device appears in the device list
  await expect(deviceList.getByText('LED Bulb')).toBeVisible();

  // Verify the device picker button shows placeholder again (ready for another add)
  const addButton = deviceManager.getByRole('button', { name: /add device/i });
  await expect(addButton).toBeVisible();

  console.log('Test passed: LED Bulb was added successfully!');
});
