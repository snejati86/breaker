import { test, expect } from '@playwright/test';

test.describe('Mobile Layout', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    // Wait for the app to load
    await page.waitForSelector('text=Circuit Manager', { timeout: 10000 });
  });

  test('should display tab navigation on mobile', async ({ page }) => {
    // Verify mobile tab navigation is visible
    const panelTab = page.getByRole('button', { name: 'Panel', exact: true });
    const editorTab = page.getByRole('button', { name: /^Editor/ });

    await expect(panelTab).toBeVisible();
    await expect(editorTab).toBeVisible();
  });

  test('should show panel view by default on mobile', async ({ page }) => {
    // Panel tab should be active (has bg-apple-bg-tertiary when selected)
    const panelTab = page.getByRole('button', { name: 'Panel', exact: true });
    await expect(panelTab).toHaveClass(/bg-apple-bg-tertiary/);

    // Panel content should be visible (main breaker)
    await expect(page.getByText('Main Service')).toBeVisible();
  });

  test('should switch to editor view when clicking a breaker', async ({
    page,
  }) => {
    // Click on a breaker (Kitchen is typically the first one)
    const breaker = page.locator('[data-testid^="breaker-module-"]').first();
    await breaker.click();

    // Wait for view switch
    await page.waitForTimeout(200);

    // Editor tab should now be active (has bg-apple-bg-tertiary when selected)
    const editorTab = page.getByRole('button', { name: /editor/i });
    await expect(editorTab).toHaveClass(/bg-apple-bg-tertiary/);

    // Circuit editor content should be visible
    await expect(page.getByText('Rating', { exact: true })).toBeVisible();
    await expect(page.getByText('Load', { exact: true })).toBeVisible();
  });

  test('should switch back to panel view when clicking Panel tab', async ({
    page,
  }) => {
    // First switch to editor by clicking a breaker
    const breaker = page.locator('[data-testid^="breaker-module-"]').first();
    await breaker.click();
    await page.waitForTimeout(200);

    // Click Panel tab
    const panelTab = page.getByRole('button', { name: 'Panel', exact: true });
    await panelTab.click();

    // Wait for view switch
    await page.waitForTimeout(200);

    // Panel content should be visible again
    await expect(page.getByText('Main Service')).toBeVisible();
  });

  test('should have touch-friendly button sizes', async ({ page }) => {
    // Click a breaker to go to editor
    const breaker = page.locator('[data-testid^="breaker-module-"]').first();
    await breaker.click();
    await page.waitForTimeout(200);

    // Check that add outlet button has proper size (w-11 = 44px)
    const addOutletButton = page.getByRole('button', { name: 'Add outlet' });
    await expect(addOutletButton).toBeVisible();

    const boundingBox = await addOutletButton.boundingBox();
    expect(boundingBox).not.toBeNull();
    // Minimum touch target is 44px
    expect(boundingBox!.width).toBeGreaterThanOrEqual(44);
    expect(boundingBox!.height).toBeGreaterThanOrEqual(44);
  });

  test('should display full-width New Branch button on mobile', async ({
    page,
  }) => {
    // Click a breaker to go to editor
    const breaker = page.locator('[data-testid^="breaker-module-"]').first();
    await breaker.click();
    await page.waitForTimeout(200);

    // Check New Branch button is full width
    const newBranchButton = page.getByRole('button', { name: 'New Branch' });
    await expect(newBranchButton).toBeVisible();

    const boundingBox = await newBranchButton.boundingBox();
    expect(boundingBox).not.toBeNull();
    // Button should be at least 300px wide (most of viewport)
    expect(boundingBox!.width).toBeGreaterThan(300);
  });

  test('should show breaker name in Editor tab when breaker is selected', async ({
    page,
  }) => {
    // Click on the Kitchen breaker module
    const kitchenBreaker = page.locator('[data-testid^="breaker-module-"]').filter({ hasText: 'Kitchen' });
    await kitchenBreaker.click();
    await page.waitForTimeout(200);

    // Editor tab should show the breaker name
    const editorTab = page.getByRole('button', { name: /editor.*kitchen/i });
    await expect(editorTab).toBeVisible();
  });

  test('should hide simulation speed selector on mobile', async ({ page }) => {
    // Speed selector should not be visible on mobile (hidden with md:block)
    const speedSelector = page.locator('#time-speed');
    await expect(speedSelector).not.toBeVisible();
  });

  test('should show responsive header with Save/Open buttons', async ({
    page,
  }) => {
    // Save and Open buttons should be visible (aria-labels contain these)
    await expect(
      page.getByRole('button', { name: /save/i })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /open/i })
    ).toBeVisible();
  });
});

test.describe('Mobile Layout - Desktop Comparison', () => {
  test('should hide tab navigation on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.waitForSelector('text=Circuit Manager', { timeout: 10000 });

    // Tab navigation should not be visible on desktop
    const viewNavigation = page.getByRole('navigation', {
      name: 'View selection',
    });
    await expect(viewNavigation).not.toBeVisible();
  });

  test('should show both panel and editor side by side on desktop', async ({
    page,
  }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.waitForSelector('text=Circuit Manager', { timeout: 10000 });

    // Main breaker should be visible
    await expect(page.getByText('Main Service')).toBeVisible();

    // Either the placeholder text OR the circuit editor should be visible
    // (depending on whether a breaker is pre-selected)
    const placeholder = page.getByText('Select a breaker to edit its circuit');
    const circuitEditor = page.getByText('Temp');

    // At least one should be visible (editor area is shown on desktop)
    const isPlaceholderVisible = await placeholder.isVisible().catch(() => false);
    const isEditorVisible = await circuitEditor.isVisible().catch(() => false);
    expect(isPlaceholderVisible || isEditorVisible).toBe(true);
  });
});
