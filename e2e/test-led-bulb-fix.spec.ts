import { test, expect } from '@playwright/test';

test('Verify LED Bulb is only added once when selected from dropdown', async ({ page }) => {
  // Navigate to the app
  await page.goto('http://localhost:5173');
  
  // Wait for the app to load
  await page.waitForSelector('text=PANEL SIM V19', { timeout: 10000 });
  
  // Select the first breaker (Kitchen) by clicking on it
  await page.click('text=Kitchen');
  
  // Wait for the circuit editor to load
  await page.waitForSelector('text=Kitchen', { timeout: 5000 });
  
  // Work with the first device manager (first outlet)
  const deviceManager = page.locator('[data-testid="device-manager"]').first();
  const deviceList = deviceManager.locator('[data-testid="device-list"]');
  const deviceDropdown = deviceManager.locator('select');
  const addButton = deviceManager.getByRole('button', { name: 'Add Device' });
  
  // Verify the dropdown is visible
  await expect(deviceDropdown).toBeVisible();
  
  // Count initial LED Bulb devices (should be 0)
  const initialCount = await deviceList.locator('text=LED Bulb').count();
  console.log(`Initial LED Bulb count: ${initialCount}`);
  
  // Select LED Bulb from the dropdown and click Add
  await deviceDropdown.selectOption('LED Bulb');
  await addButton.click();
  
  // Wait for the device to be added
  await page.waitForTimeout(500);
  
  // Count LED Bulb devices after adding
  const afterAddCount = await deviceList.locator('text=LED Bulb').count();
  console.log(`After adding LED Bulb count: ${afterAddCount}`);
  
  // Should only be 1 LED Bulb added
  expect(afterAddCount).toBe(1);
  
  // Verify the device appears in the device list with correct properties
  const deviceItem = deviceList.locator('div').filter({ hasText: /LED Bulb.*10W/ }).first();
  await expect(deviceItem).toBeVisible();
  
  // Try to select LED Bulb again immediately (simulating rapid clicks/bug scenario)
  await deviceDropdown.selectOption('LED Bulb');
  await addButton.click();
  await page.waitForTimeout(500);
  
  // Count again after second selection
  const finalCount = await deviceList.locator('text=LED Bulb').count();
  console.log(`Final LED Bulb count after second selection: ${finalCount}`);
  
  // Should still only be 1 LED Bulb (duplicate prevention should work)
  expect(finalCount).toBe(1);
  
  // Verify dropdown value was reset
  const selectValue = await deviceDropdown.inputValue();
  expect(selectValue).toBe('');
  
  console.log('✅ Test passed: LED Bulb was only added once!');
});

