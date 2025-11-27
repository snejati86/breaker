import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the app
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    console.log('✅ App loaded successfully');

    // Refresh the page to start completely fresh
    await page.reload();
    await page.waitForLoadState('networkidle');
    console.log('✅ Page refreshed for fresh start');

    // Take initial screenshot
    await page.screenshot({ path: 'fresh-initial-state.png' });

    // Find and click on an empty slot
    const emptySlots = await page.locator('.bg-gray-400.cursor-pointer').all();
    console.log(`✅ Found ${emptySlots.length} empty slots`);

    if (emptySlots.length > 0) {
      // Click the first empty slot
      await emptySlots[0].click();
      console.log('✅ Clicked on empty slot to create new breaker');
      
      await page.waitForTimeout(1000);

      // Select 15A breaker
      const breakerRatingSelector = await page.locator('select').filter({ hasText: 'A' }).first();
      if (await breakerRatingSelector.isVisible()) {
        await breakerRatingSelector.selectOption('15');
        console.log('✅ Created 15A breaker (closest to requested 10V)');
      }

      await page.screenshot({ path: 'fresh-breaker-created.png' });

      // Add exactly ONE bulb
      const deviceSelector = await page.locator('select:has(option[value=""]:text-is("+ Plug In..."))').first();
      if (await deviceSelector.isVisible()) {
        // Count bulbs before adding
        const bulbsBeforeCount = await page.locator('.bg-gray-800 >> text=LED Bulb').count();
        console.log(`LED bulbs before adding: ${bulbsBeforeCount}`);
        
        await deviceSelector.selectOption('LED Bulb');
        console.log('✅ Selected LED Bulb from dropdown');
        
        await page.waitForTimeout(1500);
        
        // Count bulbs after adding
        const bulbsAfterCount = await page.locator('.bg-gray-800 >> text=LED Bulb').count();
        console.log(`LED bulbs after adding: ${bulbsAfterCount}`);
        
        // Count specifically in the current circuit's outlet container
        const currentCircuitPanel = await page.locator('.flex-grow.bg-gray-900');
        const outletContainer = await currentCircuitPanel.locator('div:has-text("OUTLET")').first();
        const specificOutletBulbs = await outletContainer.locator('text=LED Bulb').count();
        console.log(`LED bulbs in current circuit outlet: ${specificOutletBulbs}`);
        
        // Take final screenshot
        await page.screenshot({ path: 'fresh-final-verification.png' });
        
        // The difference should be exactly 1
        const bulbsAdded = bulbsAfterCount - bulbsBeforeCount;
        
        if (bulbsAdded === 1) {
          console.log('✅ SUCCESS: Exactly one LED bulb was added');
        } else {
          console.log(`❌ Expected to add 1 bulb, but added ${bulbsAdded}`);
        }
        
        if (specificOutletBulbs === 1) {
          console.log('✅ SUCCESS: Exactly one LED bulb visible in the current outlet');
          console.log('🎉 TASK COMPLETED SUCCESSFULLY!');
          console.log('📋 Summary:');
          console.log('   - Created new 15A breaker (closest to 10V request)');
          console.log('   - Added exactly one LED bulb to the breaker');
          console.log('   - Verified only one bulb appears in the outlet list');
        } else {
          console.log(`❌ Expected 1 bulb in current outlet, but found ${specificOutletBulbs}`);
        }
        
      } else {
        console.log('❌ Could not find device selector');
      }
    } else {
      console.log('❌ No empty slots found');
    }

  } catch (error) {
    console.error('❌ Error during test:', error);
    await page.screenshot({ path: 'fresh-error-state.png' });
  }

  await browser.close();
})();