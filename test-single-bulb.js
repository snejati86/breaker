import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the app
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    console.log('App loaded successfully');

    // Take initial screenshot
    await page.screenshot({ path: 'test-initial-state.png' });

    // Find and click on an empty slot
    const emptySlots = await page.locator('.bg-gray-400.cursor-pointer').all();
    console.log(`Found ${emptySlots.length} empty slots`);

    if (emptySlots.length > 0) {
      // Click the first empty slot
      await emptySlots[0].click();
      console.log('Clicked on empty slot');
      
      await page.waitForTimeout(1000);

      // Look for a breaker rating selector - try to use 15A (closest to 10V request)
      const breakerRatingSelector = await page.locator('select').filter({ hasText: 'A' }).first();
      if (await breakerRatingSelector.isVisible()) {
        await breakerRatingSelector.selectOption('15');
        console.log('Selected 15A breaker (closest available to 10V)');
      }

      await page.screenshot({ path: 'test-breaker-created.png' });

      // Now add exactly ONE bulb
      // Look for the device selector dropdown that says "+ Plug in..."
      const deviceSelector = await page.locator('select:has(option[value=""]:text-is("+ Plug In..."))').first();
      if (await deviceSelector.isVisible()) {
        await deviceSelector.selectOption('LED Bulb');
        console.log('Selected LED Bulb');
        
        await page.waitForTimeout(1000);
        
        // Count bulbs ONLY in the current circuit panel (not globally)
        // Look for LED Bulb elements within the circuit editor area
        const currentCircuitPanel = await page.locator('.flex-grow.bg-gray-900');
        const bulbsInCurrentCircuit = await currentCircuitPanel.locator('text=LED Bulb').count();
        
        console.log(`Found ${bulbsInCurrentCircuit} LED bulb(s) in the current circuit`);
        
        await page.screenshot({ path: 'test-single-bulb-added.png' });
        
        if (bulbsInCurrentCircuit === 1) {
          console.log('✅ SUCCESS: Exactly one LED bulb is visible in the current circuit');
        } else {
          console.log(`❌ ISSUE: Expected 1 bulb in current circuit, but found ${bulbsInCurrentCircuit}`);
        }

        // Also verify by looking at the outlet specifically
        const outletBulbs = await page.locator('div:has-text("OUTLET") ~ div').locator('text=LED Bulb').count();
        console.log(`Bulbs in outlet: ${outletBulbs}`);
        
      } else {
        console.log('Could not find device selector');
      }
    } else {
      console.log('No empty slots found');
    }

  } catch (error) {
    console.error('Error during test:', error);
    await page.screenshot({ path: 'test-error-state.png' });
  }

  await browser.close();
})();