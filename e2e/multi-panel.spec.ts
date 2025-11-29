import { test, expect } from '@playwright/test';

test.describe('Multi-Panel Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Wait for the app to load
    await page.waitForSelector('text=Circuit Manager', { timeout: 10000 });

    // Wait for the panel drawer to be visible
    await page.waitForSelector('[data-testid="panel-drawer"]', { timeout: 5000 });
  });

  // Helper to get panel item in drawer by name
  const getPanelItem = (page: import('@playwright/test').Page, name: string) =>
    page.getByTestId('panel-list').locator('[data-testid^="panel-item-"]').filter({
      hasText: name,
    });

  // Helper to get panel name span in drawer
  const getPanelNameInDrawer = (page: import('@playwright/test').Page, name: string) =>
    page.getByTestId('panel-list').getByText(name);

  test('should display the panel drawer with default panel', async ({ page }) => {
    // Verify drawer is visible
    await expect(page.getByTestId('panel-drawer')).toBeVisible();

    // Verify panel list exists
    await expect(page.getByTestId('panel-list')).toBeVisible();

    // Verify default "Main Panel" exists in the drawer
    await expect(getPanelNameInDrawer(page, 'Main Panel')).toBeVisible();

    // Verify add panel button exists
    await expect(page.getByTestId('add-panel-button')).toBeVisible();
  });

  test('should create a new panel and switch between panels', async ({ page }) => {
    // Click add panel button
    await page.getByTestId('add-panel-button').click();
    await page.waitForTimeout(300);

    // Verify new panel was added in drawer
    await expect(getPanelNameInDrawer(page, 'New Panel')).toBeVisible();

    // New panel should be selected (has blue background)
    const newPanelItem = getPanelItem(page, 'New Panel');
    const newPanelContainer = newPanelItem.locator('div').first();
    await expect(newPanelContainer).toHaveAttribute('data-selected', 'true');

    // Click on Main Panel in drawer to switch back
    await getPanelNameInDrawer(page, 'Main Panel').click();
    await page.waitForTimeout(300);

    // Verify Main Panel is now selected
    const mainPanelItem = getPanelItem(page, 'Main Panel');
    const mainPanelContainer = mainPanelItem.locator('div').first();
    await expect(mainPanelContainer).toHaveAttribute('data-selected', 'true');
  });

  test('should rename a panel by double-clicking', async ({ page }) => {
    // Create a new panel first
    await page.getByTestId('add-panel-button').click();
    await page.waitForTimeout(300);

    // Double-click on the panel name in drawer to enter edit mode
    await getPanelNameInDrawer(page, 'New Panel').dblclick();

    // Wait for input to appear
    const input = page.locator('[data-testid^="panel-name-input-"]');
    await expect(input).toBeVisible();

    // Clear and type new name
    await input.fill('Garage Panel');
    await input.press('Enter');
    await page.waitForTimeout(300);

    // Verify the name was changed in the drawer
    await expect(getPanelNameInDrawer(page, 'Garage Panel')).toBeVisible();
    await expect(page.getByTestId('panel-list').getByText('New Panel')).not.toBeVisible();
  });

  test('should delete a panel when multiple panels exist', async ({ page }) => {
    // Create a new panel first
    await page.getByTestId('add-panel-button').click();
    await page.waitForTimeout(300);

    // Verify we now have 2 panels
    const panelItems = page.getByTestId('panel-list').locator('[data-testid^="panel-item-"]');
    await expect(panelItems).toHaveCount(2);

    // Delete the new panel
    const deleteButton = getPanelItem(page, 'New Panel').locator('[data-testid^="panel-delete-"]');
    await deleteButton.click();
    await page.waitForTimeout(300);

    // Verify only 1 panel remains
    await expect(panelItems).toHaveCount(1);
    await expect(page.getByTestId('panel-list').getByText('New Panel')).not.toBeVisible();
  });

  test('should not allow deleting the last panel', async ({ page }) => {
    // With only one panel, delete button should be disabled
    const deleteButton = page.getByTestId('panel-list').locator('[data-testid^="panel-delete-"]').first();
    await expect(deleteButton).toBeDisabled();
  });

  test('should maintain separate breakers per panel', async ({ page }) => {
    // Main Panel should have default breakers (Kitchen, Shed, Dryer)
    // Use breaker module test ids to find them in the electrical panel
    const breakerModules = page.locator('[data-testid^="breaker-module-"]');
    await expect(breakerModules).toHaveCount(3);
    await expect(breakerModules.filter({ hasText: 'Kitchen' })).toBeVisible();
    await expect(breakerModules.filter({ hasText: 'Shed' })).toBeVisible();
    await expect(breakerModules.filter({ hasText: 'Dryer' })).toBeVisible();

    // Create a new panel
    await page.getByTestId('add-panel-button').click();
    await page.waitForTimeout(300);

    // New panel should be empty (no breakers visible in the panel area)
    await expect(breakerModules).toHaveCount(0);

    // Switch back to Main Panel
    await getPanelNameInDrawer(page, 'Main Panel').click();
    await page.waitForTimeout(300);

    // Verify breakers are back
    await expect(breakerModules).toHaveCount(3);
  });

  test('should add breaker to new panel and verify separate state', async ({
    page,
  }) => {
    // Create a new panel
    await page.getByTestId('add-panel-button').click();
    await page.waitForTimeout(300);

    // Add a breaker to the new panel
    const emptySlot = page.locator('[data-testid^="empty-slot-"]').first();
    await emptySlot.click();

    // Select single pole breaker
    await page.getByTestId('single-pole-option').click();
    await page.waitForTimeout(300);

    // Verify breaker was added to new panel
    const breakerModules = page.locator('[data-testid^="breaker-module-"]');
    await expect(breakerModules).toHaveCount(1);

    // Switch to Main Panel
    await getPanelNameInDrawer(page, 'Main Panel').click();
    await page.waitForTimeout(300);

    // Main Panel should still have 3 breakers
    await expect(breakerModules).toHaveCount(3);

    // Switch back to New Panel
    await getPanelNameInDrawer(page, 'New Panel').click();
    await page.waitForTimeout(300);

    // New Panel should still have 1 breaker
    await expect(breakerModules).toHaveCount(1);
  });

  test('should add device to breaker and verify amperage', async ({ page }) => {
    // Select Kitchen breaker (already in Main Panel)
    const kitchenBreaker = page.locator('[data-testid^="breaker-module-"]').filter({ hasText: 'Kitchen' });
    await kitchenBreaker.click();
    await page.waitForTimeout(300);

    // Find the device manager
    const deviceManager = page.locator('[data-testid="device-manager"]').first();
    const deviceList = deviceManager.locator('[data-testid="device-list"]');

    // Add a Laptop (60W = 0.5A at 120V) using DevicePicker
    const addDeviceButton = deviceManager.getByRole('button', { name: /add device/i });
    await addDeviceButton.click();
    await page.waitForTimeout(200);

    let searchInput = page.getByRole('searchbox', { name: /search devices/i });
    await searchInput.fill('Laptop');
    await page.waitForTimeout(200);

    let deviceOption = page.getByRole('option', { name: /laptop/i }).first();
    await deviceOption.click();
    await page.waitForTimeout(300);

    // Verify device was added (check in device list)
    await expect(deviceList.getByText('Laptop')).toBeVisible();

    // Add a Space Heater (1500W = 12.5A at 120V)
    await addDeviceButton.click();
    await page.waitForTimeout(200);

    searchInput = page.getByRole('searchbox', { name: /search devices/i });
    await searchInput.fill('Space Heater');
    await page.waitForTimeout(200);

    deviceOption = page.getByRole('option', { name: /space heater/i }).first();
    await deviceOption.click();
    await page.waitForTimeout(300);

    // Verify device was added
    await expect(deviceList.getByText('Space Heater')).toBeVisible();
    // Look for the load value near the Load label
    await expect(page.locator('text=/13\\.\\d/')).toBeVisible();
  });

  test('complete workflow: create panel, add breaker, add device, switch panels, verify state', async ({
    page,
  }) => {
    // Step 1: Create a new panel named "Garage"
    await page.getByTestId('add-panel-button').click();
    await page.waitForTimeout(300);

    // Rename to "Garage"
    await getPanelNameInDrawer(page, 'New Panel').dblclick();
    const input = page.locator('[data-testid^="panel-name-input-"]');
    await input.fill('Garage');
    await input.press('Enter');
    await page.waitForTimeout(300);

    // Step 2: Add a 20A breaker to Garage panel
    const emptySlot = page.locator('[data-testid^="empty-slot-"]').first();
    await emptySlot.click();
    await page.getByTestId('single-pole-option').click();
    await page.waitForTimeout(300);

    // Step 3: Select the new breaker and add a device
    const newBreaker = page.locator('[data-testid^="breaker-module-"]').first();
    await newBreaker.click();
    await page.waitForTimeout(300);

    // Add an LED Bulb (10W = ~0.08A) using DevicePicker
    const deviceManager = page.locator('[data-testid="device-manager"]').first();
    const deviceList = deviceManager.locator('[data-testid="device-list"]');

    let addDeviceButton = deviceManager.getByRole('button', { name: /add device/i });
    await addDeviceButton.click();
    await page.waitForTimeout(200);

    let searchInput = page.getByRole('searchbox', { name: /search devices/i });
    await searchInput.fill('LED Bulb');
    await page.waitForTimeout(200);

    let deviceOption = page.getByRole('option', { name: /led bulb/i }).first();
    await deviceOption.click();
    await page.waitForTimeout(300);

    // Verify LED Bulb was added (check in device list)
    await expect(deviceList.getByText('LED Bulb')).toBeVisible();

    // Step 4: Switch to Main Panel
    await getPanelNameInDrawer(page, 'Main Panel').click();
    await page.waitForTimeout(300);

    // Verify Main Panel has its original breakers
    const breakerModules = page.locator('[data-testid^="breaker-module-"]');
    await expect(breakerModules.filter({ hasText: 'Kitchen' })).toBeVisible();
    await expect(breakerModules.filter({ hasText: 'Shed' })).toBeVisible();
    await expect(breakerModules.filter({ hasText: 'Dryer' })).toBeVisible();

    // Step 5: Add a device to Kitchen in Main Panel
    await breakerModules.filter({ hasText: 'Kitchen' }).click();
    await page.waitForTimeout(300);

    const mainDeviceManager = page.locator('[data-testid="device-manager"]').first();
    const mainDeviceList = mainDeviceManager.locator('[data-testid="device-list"]');

    addDeviceButton = mainDeviceManager.getByRole('button', { name: /add device/i });
    await addDeviceButton.click();
    await page.waitForTimeout(200);

    searchInput = page.getByRole('searchbox', { name: /search devices/i });
    await searchInput.fill('Microwave');
    await page.waitForTimeout(200);

    deviceOption = page.getByRole('option', { name: /microwave/i }).first();
    await deviceOption.click();
    await page.waitForTimeout(300);

    // Verify Microwave was added
    await expect(mainDeviceList.getByText('Microwave')).toBeVisible();

    // Step 6: Switch back to Garage and verify LED Bulb is still there
    await getPanelNameInDrawer(page, 'Garage').click();
    await page.waitForTimeout(300);

    // Select the breaker in Garage
    const garageBreaker = page.locator('[data-testid^="breaker-module-"]').first();
    await garageBreaker.click();
    await page.waitForTimeout(300);

    // Verify LED Bulb is still there
    const garageDeviceManager = page.locator('[data-testid="device-manager"]').first();
    const garageDeviceList = garageDeviceManager.locator('[data-testid="device-list"]');
    await expect(garageDeviceList.getByText('LED Bulb')).toBeVisible();

    // Step 7: Switch to Main Panel and verify Microwave is still there
    await getPanelNameInDrawer(page, 'Main Panel').click();
    await page.waitForTimeout(300);

    await breakerModules.filter({ hasText: 'Kitchen' }).click();
    await page.waitForTimeout(300);

    const finalDeviceManager = page.locator('[data-testid="device-manager"]').first();
    const finalDeviceList = finalDeviceManager.locator('[data-testid="device-list"]');
    await expect(finalDeviceList.getByText('Microwave')).toBeVisible();
  });

  test('should toggle drawer open/closed', async ({ page }) => {
    // Verify drawer is initially open
    await expect(page.getByTestId('panel-list')).toBeVisible();

    // Click toggle button to close
    await page.getByTestId('toggle-drawer').click();
    await page.waitForTimeout(300);

    // Panel list should not be visible when closed
    await expect(page.getByTestId('panel-list')).not.toBeVisible();

    // Click toggle button to reopen
    await page.getByTestId('toggle-drawer').click();
    await page.waitForTimeout(300);

    // Panel list should be visible again
    await expect(page.getByTestId('panel-list')).toBeVisible();
  });

  test('should display current panel name in header', async ({ page }) => {
    // The header should show the current panel name (use role="banner" to get main header)
    const header = page.locator('header[role="banner"]');
    await expect(header).toContainText('Main Panel');

    // Create and select a new panel
    await page.getByTestId('add-panel-button').click();
    await page.waitForTimeout(300);

    // Header should now show "New Panel"
    await expect(header).toContainText('New Panel');

    // Switch back to Main Panel in drawer
    await getPanelNameInDrawer(page, 'Main Panel').click();
    await page.waitForTimeout(300);

    // Header should show "Main Panel" again
    await expect(header).toContainText('Main Panel');
  });

  test('should show service limit for each panel', async ({ page }) => {
    // Main Panel should show 200A
    const mainPanelItem = getPanelItem(page, 'Main Panel');
    await expect(mainPanelItem).toContainText('200A');

    // Create a new panel
    await page.getByTestId('add-panel-button').click();
    await page.waitForTimeout(300);

    // New Panel should also show 200A by default
    const newPanelItem = getPanelItem(page, 'New Panel');
    await expect(newPanelItem).toContainText('200A');
  });
});