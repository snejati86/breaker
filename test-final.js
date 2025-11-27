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

    // Find and click on an empty slot
    const emptySlots = await page.locator('.bg-gray-400.cursor-pointer').all();
    console.log(`Found ${emptySlots.length} empty slots`);

    if (emptySlots.length > 0) {
      // Click the first empty slot
      await emptySlots[0].click();
      console.log('Clicked on empty slot to create new breaker');
      
      await page.waitForTimeout(1000);

      // Select 15A breaker (closest available to the requested 10V)
      const breakerRatingSelector = await page.locator('select').filter({ hasText: 'A' }).first();
      if (await breakerRatingSelector.isVisible()) {
        await breakerRatingSelector.selectOption('15');
        console.log('✅ Created 15A breaker (closest available to 10V)');
      }

      // Add exactly ONE bulb
      const deviceSelector = await page.locator('select:has(option[value=""]:text-is("+ Plug In..."))').first();
      if (await deviceSelector.isVisible()) {
        await deviceSelector.selectOption('LED Bulb');
        console.log('✅ Added one LED bulb to the breaker');
        
        await page.waitForTimeout(1000);
        
        // Count bulbs in the current outlet only by looking at the outlet container
        // The outlet shows individual device entries, so count those
        const currentOutlet = await page.locator('div:has-text("OUTLET")').first();
        const bulbsInOutlet = await currentOutlet.locator('.. >> text=LED Bulb').count();
        
        console.log(`Bulbs in the current outlet: ${bulbsInOutlet}`);
        
        // Take final screenshot
        await page.screenshot({ path: 'final-verification.png' });
        
        if (bulbsInOutlet === 1) {
          console.log('✅ SUCCESS: Exactly one LED bulb is visible in the outlet');
          console.log('✅ TASK COMPLETED: Created breaker, added bulb, verified count = 1');
        } else {
          console.log(`❌ ISSUE: Expected 1 bulb in outlet, but found ${bulbsInOutlet}`);
        }

        // Additional verification - count the visible LED Bulb elements in the right panel
        const rightPanelBulbs = await page.locator('div.flex-grow.bg-gray-900 .bg-gray-800').locator('text=LED Bulb').count();
        console.log(`LED bulb elements in current circuit panel: ${rightPanelBulbs}`);
        
      } else {
        console.log('❌ Could not find device selector');
      }
    } else {
      console.log('❌ No empty slots found');
    }

  } catch (error) {
    console.error('❌ Error during test:', error);
    await page.screenshot({ path: 'final-error-state.png' });
  }

  await browser.close();
})();