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

  // Select the first breaker (Kitchen) by clicking on its breaker module
  const kitchenBreaker = page.locator('[data-testid^="breaker-module-"]').filter({ hasText: 'Kitchen' });
  await kitchenBreaker.click();

  // Wait for the circuit editor to load
  await page.waitForSelector('[data-testid="device-manager"]', { timeout: 5000 });

  // Work with the first device manager (first outlet)
  const deviceManager = page.locator('[data-testid="device-manager"]').first();
  const deviceList = deviceManager.locator('[data-testid="device-list"]');

  // Count initial LED Bulb devices (should be 0)
  const initialCount = await deviceList.locator('text=LED Bulb').count();
  console.log(`Initial LED Bulb count: ${initialCount}`);

  // Click the "Add Device..." button to open the DevicePicker
  const addDeviceButton = deviceManager.getByRole('button', { name: /add device/i });
  await addDeviceButton.click();
  await page.waitForTimeout(200);

  // Search for LED Bulb
  const searchInput = page.getByRole('searchbox', { name: /search devices/i });
  await searchInput.fill('LED Bulb');
  await page.waitForTimeout(200);

  // Click on first LED Bulb in the list (there are multiple wattage options)
  const ledBulbOption = page.getByRole('option', { name: /led bulb/i }).first();
  await ledBulbOption.click();

  // Wait for the device to be added
  await page.waitForTimeout(500);

  // Count LED Bulb devices after adding
  const afterAddCount = await deviceList.locator('text=LED Bulb').count();
  console.log(`After adding LED Bulb count: ${afterAddCount}`);

  // Should only be 1 LED Bulb added
  expect(afterAddCount).toBe(1);

  // Verify the device appears in the device list (note: LED Bulb comes in 9W, 15W, 20W variants)
  const deviceItem = deviceList.locator('div').filter({ hasText: /LED Bulb.*\d+W/ }).first();
  await expect(deviceItem).toBeVisible();

  // Try to add LED Bulb again (simulating rapid clicks/bug scenario)
  await addDeviceButton.click();
  await page.waitForTimeout(200);

  await searchInput.fill('LED Bulb');
  await page.waitForTimeout(200);

  await page.getByRole('option', { name: /led bulb/i }).first().click();
  await page.waitForTimeout(500);

  // Count again after second selection
  const finalCount = await deviceList.locator('text=LED Bulb').count();
  console.log(`Final LED Bulb count after second selection: ${finalCount}`);

  // Should now be 2 LED Bulbs (adding duplicates is allowed)
  expect(finalCount).toBe(2);

  console.log('✅ Test passed: LED Bulb addition works correctly!');
});
