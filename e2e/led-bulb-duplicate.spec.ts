import { test, expect } from '@playwright/test';

test.describe('LED Bulb Duplicate Prevention', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the app to load - look for the panel simulator
    await page.waitForSelector('text=PANEL SIM V19', { timeout: 10000 });
    
    // Select the first breaker (Kitchen) by clicking on it
    // The breaker should be visible in the electrical panel
    await page.click('text=Kitchen');
    
    // Wait for the circuit editor to load
    await page.waitForSelector('text=Kitchen', { timeout: 5000 });
  });

  test('should only add LED Bulb once to an outlet when selected from dropdown', async ({ page }) => {
    const deviceManager = page.locator('[data-testid="device-manager"]').first();
    const deviceList = deviceManager.locator('[data-testid="device-list"]');
    const deviceDropdown = deviceManager.locator('select');
    const addButton = deviceManager.getByRole('button', { name: 'Add Device' });
    
    // Verify the dropdown is visible
    await expect(deviceDropdown).toBeVisible();
    
    // Count initial devices (should be 0)
    const initialDeviceCount = await deviceList.locator('text=LED Bulb').count();
    expect(initialDeviceCount).toBe(0);
    
    // Select LED Bulb from the dropdown and add it
    await deviceDropdown.selectOption('LED Bulb');
    await addButton.click();
    await page.waitForTimeout(300);
    
    // Verify that only ONE LED Bulb was added
    const ledBulbCount = await deviceList.locator('text=LED Bulb').count();
    expect(ledBulbCount).toBe(1);
    
    // Try to select LED Bulb again immediately (simulating rapid clicks)
    await deviceDropdown.selectOption('LED Bulb');
    await addButton.click();
    await page.waitForTimeout(300);
    
    // Should still only be 1 LED Bulb (duplicate prevention should work)
    const finalLedBulbCount = await deviceList.locator('text=LED Bulb').count();
    expect(finalLedBulbCount).toBe(1);
  });

  test('should reset dropdown value immediately after selecting LED Bulb', async ({ page }) => {
    const deviceManager = page.locator('[data-testid="device-manager"]').first();
    const deviceDropdown = deviceManager.locator('select');
    const addButton = deviceManager.getByRole('button', { name: 'Add Device' });
    
    await deviceDropdown.selectOption('LED Bulb');
    await addButton.click();
    
    // Immediately check that the dropdown value has been reset
    const selectValue = await deviceDropdown.inputValue();
    expect(selectValue).toBe('');
    
    // Verify device was added
    await expect(deviceManager.locator('text=LED Bulb').first()).toBeVisible({ timeout: 1000 });
  });

  test('should allow adding LED Bulb to multiple outlets separately', async ({ page }) => {
    // Add a second outlet to the circuit
    const addOutletButton = page.locator('button').filter({ hasText: /plug/i }).first();
    await addOutletButton.click();
    await page.waitForTimeout(300);
    
    const deviceManagers = page.locator('[data-testid="device-manager"]');
    
    // Add LED Bulb to first outlet
    await deviceManagers.nth(0).locator('select').selectOption('LED Bulb');
    await deviceManagers.nth(0).getByRole('button', { name: 'Add Device' }).click();
    await page.waitForTimeout(300);
    
    // Add LED Bulb to second outlet
    await deviceManagers.nth(1).locator('select').selectOption('LED Bulb');
    await deviceManagers.nth(1).getByRole('button', { name: 'Add Device' }).click();
    await page.waitForTimeout(300);
    
    const ledBulbCount = await page.locator('[data-testid="device-list"]').locator('text=LED Bulb').count();
    expect(ledBulbCount).toBe(2);
  });
});

