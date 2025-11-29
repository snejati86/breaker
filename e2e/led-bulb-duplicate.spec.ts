import { test, expect } from '@playwright/test';

test.describe('LED Bulb Duplicate Prevention', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Wait for the app to load - look for the Circuit Manager text in header
    await page.waitForSelector('text=Circuit Manager', { timeout: 10000 });

    // Select the first breaker (Kitchen) by clicking on its breaker module
    // The breaker should be visible in the electrical panel
    const kitchenBreaker = page.locator('[data-testid^="breaker-module-"]').filter({ hasText: 'Kitchen' });
    await kitchenBreaker.click();

    // Wait for the circuit editor to load
    await page.waitForSelector('[data-testid="device-manager"]', { timeout: 5000 });
  });

  test('should only add LED Bulb once to an outlet when selected from dropdown', async ({ page }) => {
    const deviceManager = page.locator('[data-testid="device-manager"]').first();
    const deviceList = deviceManager.locator('[data-testid="device-list"]');

    // Count initial devices (should be 0)
    const initialDeviceCount = await deviceList.locator('text=LED Bulb').count();
    expect(initialDeviceCount).toBe(0);

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
    await page.waitForTimeout(300);

    // Verify that only ONE LED Bulb was added
    const ledBulbCount = await deviceList.locator('text=LED Bulb').count();
    expect(ledBulbCount).toBe(1);

    // Try to add LED Bulb again (simulating rapid clicks)
    await addDeviceButton.click();
    await page.waitForTimeout(200);

    await searchInput.fill('LED Bulb');
    await page.waitForTimeout(200);

    await ledBulbOption.click();
    await page.waitForTimeout(300);

    // Should now have 2 LED Bulbs (duplicate prevention should still allow adding multiple of same type)
    const finalLedBulbCount = await deviceList.locator('text=LED Bulb').count();
    expect(finalLedBulbCount).toBe(2);
  });

  test('should close picker after selecting a device', async ({ page }) => {
    const deviceManager = page.locator('[data-testid="device-manager"]').first();

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
    await page.waitForTimeout(300);

    // Picker should be closed (search input not visible)
    await expect(searchInput).not.toBeVisible();

    // Verify device was added
    await expect(deviceManager.locator('text=LED Bulb').first()).toBeVisible({ timeout: 1000 });
  });

  test('should allow adding LED Bulb to multiple outlets separately', async ({ page }) => {
    // Add a second outlet to the circuit using the "Add outlet" button
    const addOutletButton = page.getByRole('button', { name: 'Add outlet' });
    await addOutletButton.click();
    await page.waitForTimeout(300);

    const deviceManagers = page.locator('[data-testid="device-manager"]');

    // Add LED Bulb to first outlet
    const firstManager = deviceManagers.nth(0);
    const firstAddButton = firstManager.getByRole('button', { name: /add device/i });
    await firstAddButton.click();
    await page.waitForTimeout(200);

    let searchInput = page.getByRole('searchbox', { name: /search devices/i });
    await searchInput.fill('LED Bulb');
    await page.waitForTimeout(200);

    let ledBulbOption = page.getByRole('option', { name: /led bulb/i }).first();
    await ledBulbOption.click();
    await page.waitForTimeout(300);

    // Add LED Bulb to second outlet
    const secondManager = deviceManagers.nth(1);
    const secondAddButton = secondManager.getByRole('button', { name: /add device/i });
    await secondAddButton.click();
    await page.waitForTimeout(200);

    searchInput = page.getByRole('searchbox', { name: /search devices/i });
    await searchInput.fill('LED Bulb');
    await page.waitForTimeout(200);

    ledBulbOption = page.getByRole('option', { name: /led bulb/i }).first();
    await ledBulbOption.click();
    await page.waitForTimeout(300);

    const ledBulbCount = await page.locator('[data-testid="device-list"]').locator('text=LED Bulb').count();
    expect(ledBulbCount).toBe(2);
  });
});
