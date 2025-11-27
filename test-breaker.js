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
    await page.screenshot({ path: 'initial-state.png' });
    console.log('Initial screenshot taken');

    // Find and click on an empty slot (slot 4)
    // Look for empty slots which have class bg-gray-400 and cursor-pointer
    const emptySlots = await page.locator('.bg-gray-400.cursor-pointer').all();
    console.log(`Found ${emptySlots.length} empty slots`);

    if (emptySlots.length > 0) {
      // Click the first empty slot (should be slot 4)
      await emptySlots[0].click();
      console.log('Clicked on empty slot');
      
      // Wait for any dialog or form to appear
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'after-slot-click.png' });
      
      // Look for a breaker rating selector or form
      const breakerRatingSelector = await page.locator('select').filter({ hasText: '20A' }).first();
      if (await breakerRatingSelector.isVisible()) {
        // Change to 10A if available, otherwise keep 20A
        const options = await breakerRatingSelector.locator('option').allTextContents();
        console.log('Available breaker ratings:', options);
        
        if (options.some(option => option.includes('10A'))) {
          await breakerRatingSelector.selectOption('10');
          console.log('Selected 10A breaker');
        } else {
          console.log('10A not available, keeping current selection');
        }
      }

      await page.screenshot({ path: 'breaker-created.png' });

      // Now look for a way to add a bulb
      // Find the device selector dropdown
      const deviceSelector = await page.locator('select').filter({ hasText: 'Plug In' }).first();
      if (await deviceSelector.isVisible()) {
        await deviceSelector.selectOption('LED Bulb');
        console.log('Selected LED Bulb');
        
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'bulb-added.png' });
        
        // Verify only one bulb appears
        const bulbElements = await page.locator('text=LED Bulb').count();
        console.log(`Found ${bulbElements} LED bulb(s) in the interface`);
        
        // Take final screenshot
        await page.screenshot({ path: 'final-state.png' });
        
        if (bulbElements === 1) {
          console.log('✅ SUCCESS: Exactly one bulb is visible in the list');
        } else {
          console.log(`❌ ISSUE: Expected 1 bulb, but found ${bulbElements}`);
        }
      } else {
        console.log('Could not find device selector');
      }
    } else {
      console.log('No empty slots found');
    }

  } catch (error) {
    console.error('Error during test:', error);
    await page.screenshot({ path: 'error-state.png' });
  }

  await browser.close();
})();