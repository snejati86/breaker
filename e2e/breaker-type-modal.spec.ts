import { test, expect } from '@playwright/test';

test.describe('Breaker Type Modal', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Wait for the app to load - look for the panel simulator
    await page.waitForSelector('text=PANEL SIM V19', { timeout: 10000 });
  });

  test('should open modal when clicking an empty slot', async ({ page }) => {
    // Find an empty slot and click it
    const emptySlot = page.locator('[data-testid^="empty-slot-"]').first();
    await emptySlot.click();

    // Verify modal appears
    await expect(page.getByTestId('modal-overlay')).toBeVisible();
    await expect(page.getByTestId('modal-content')).toBeVisible();

    // Verify modal title contains slot number
    await expect(page.getByText(/Install Breaker in Slot/)).toBeVisible();
  });

  test('should display single pole and double pole options', async ({ page }) => {
    // Click an empty slot
    const emptySlot = page.locator('[data-testid^="empty-slot-"]').first();
    await emptySlot.click();

    // Verify both options are visible
    await expect(page.getByTestId('single-pole-option')).toBeVisible();
    await expect(page.getByTestId('double-pole-option')).toBeVisible();

    // Verify option labels
    await expect(page.getByText('Single Pole')).toBeVisible();
    await expect(page.getByText('Double Pole')).toBeVisible();

    // Verify voltage labels (use more specific locators to avoid duplicates)
    await expect(
      page.getByTestId('single-pole-option').getByText('120V')
    ).toBeVisible();
    await expect(
      page.getByTestId('double-pole-option').getByText('240V')
    ).toBeVisible();
  });

  test('should display descriptive text for each option', async ({ page }) => {
    // Click an empty slot
    const emptySlot = page.locator('[data-testid^="empty-slot-"]').first();
    await emptySlot.click();

    // Verify descriptions are visible
    await expect(
      page.getByText(/Standard circuits for outlets, lights/)
    ).toBeVisible();
    await expect(
      page.getByText(/Large appliances like dryers, ovens/)
    ).toBeVisible();
  });

  test('should add single pole breaker when single pole option is clicked', async ({
    page,
  }) => {
    // Get initial breaker count
    const initialBreakerCount = await page
      .locator('[data-testid^="breaker-module-"]')
      .count();

    // Click an empty slot
    const emptySlot = page.locator('[data-testid^="empty-slot-"]').first();
    await emptySlot.click();

    // Select single pole
    await page.getByTestId('single-pole-option').click();

    // Wait for modal to close
    await expect(page.getByTestId('modal-overlay')).not.toBeVisible();

    // Wait for state update and re-render
    await page.waitForTimeout(300);

    // Verify a new breaker was added
    const finalBreakerCount = await page
      .locator('[data-testid^="breaker-module-"]')
      .count();
    expect(finalBreakerCount).toBe(initialBreakerCount + 1);
  });

  test('should add double pole breaker when double pole option is clicked', async ({
    page,
  }) => {
    // Get initial breaker count
    const initialBreakerCount = await page
      .locator('[data-testid^="breaker-module-"]')
      .count();

    // Click an empty slot
    const emptySlot = page.locator('[data-testid^="empty-slot-"]').first();
    await emptySlot.click();

    // Select double pole
    await page.getByTestId('double-pole-option').click();

    // Wait for modal to close
    await expect(page.getByTestId('modal-overlay')).not.toBeVisible();

    // Wait for state update and re-render
    await page.waitForTimeout(300);

    // Verify a new breaker was added
    const finalBreakerCount = await page
      .locator('[data-testid^="breaker-module-"]')
      .count();
    expect(finalBreakerCount).toBe(initialBreakerCount + 1);
  });

  test('should close modal when cancel button is clicked', async ({ page }) => {
    // Click an empty slot
    const emptySlot = page.locator('[data-testid^="empty-slot-"]').first();
    await emptySlot.click();

    // Verify modal is open
    await expect(page.getByTestId('modal-overlay')).toBeVisible();

    // Click cancel
    await page.getByRole('button', { name: /cancel/i }).click();

    // Verify modal is closed
    await expect(page.getByTestId('modal-overlay')).not.toBeVisible();
  });

  test('should close modal when clicking outside (on overlay)', async ({
    page,
  }) => {
    // Click an empty slot
    const emptySlot = page.locator('[data-testid^="empty-slot-"]').first();
    await emptySlot.click();

    // Verify modal is open
    await expect(page.getByTestId('modal-overlay')).toBeVisible();

    // Click on the overlay (outside the modal content)
    // Force click at a specific position on the overlay
    await page.getByTestId('modal-overlay').click({ position: { x: 10, y: 10 } });

    // Verify modal is closed
    await expect(page.getByTestId('modal-overlay')).not.toBeVisible();
  });

  test('should close modal when Escape key is pressed', async ({ page }) => {
    // Click an empty slot
    const emptySlot = page.locator('[data-testid^="empty-slot-"]').first();
    await emptySlot.click();

    // Verify modal is open
    await expect(page.getByTestId('modal-overlay')).toBeVisible();

    // Press Escape key
    await page.keyboard.press('Escape');

    // Verify modal is closed
    await expect(page.getByTestId('modal-overlay')).not.toBeVisible();
  });

  test('should not add breaker when modal is cancelled', async ({ page }) => {
    // Get initial breaker count
    const initialBreakerCount = await page
      .locator('[data-testid^="breaker-module-"]')
      .count();

    // Click an empty slot
    const emptySlot = page.locator('[data-testid^="empty-slot-"]').first();
    await emptySlot.click();

    // Cancel the modal
    await page.getByRole('button', { name: /cancel/i }).click();

    // Verify breaker count hasn't changed
    const finalBreakerCount = await page
      .locator('[data-testid^="breaker-module-"]')
      .count();
    expect(finalBreakerCount).toBe(initialBreakerCount);
  });

  test('should show correct slot number in modal title', async ({ page }) => {
    // Get the slot number from an empty slot
    const emptySlot = page.locator('[data-testid^="empty-slot-"]').first();
    const testId = await emptySlot.getAttribute('data-testid');
    const slotNumber = testId?.replace('empty-slot-', '');

    // Click the empty slot
    await emptySlot.click();

    // Verify the modal title shows the correct slot number
    await expect(
      page.getByText(`Install Breaker in Slot ${slotNumber}`)
    ).toBeVisible();
  });

  test('should display visual breaker icons', async ({ page }) => {
    // Click an empty slot
    const emptySlot = page.locator('[data-testid^="empty-slot-"]').first();
    await emptySlot.click();

    // Verify both icons are present
    await expect(page.getByTestId('single-pole-icon')).toBeVisible();
    await expect(page.getByTestId('double-pole-icon')).toBeVisible();
  });

  test('modal should be accessible with proper dialog role', async ({
    page,
  }) => {
    // Click an empty slot
    const emptySlot = page.locator('[data-testid^="empty-slot-"]').first();
    await emptySlot.click();

    // Verify accessibility attributes
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog).toHaveAttribute('aria-labelledby');
  });
});
