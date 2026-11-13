import { test, expect } from '@playwright/test';
import fs from 'node:fs';

test('compact planner fits target viewports and keeps secondary content accessible', async ({ page }, testInfo) => {
  await page.route('https://tile.openstreetmap.org/**', route => route.abort());
  const measurements = [];
  for (const [width, height] of [[1920,1080],[1440,900],[1366,768],[768,1024],[390,844]]) {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await expect(page.locator('.assistant-form')).not.toBeVisible();
    await expect(page.locator('#panel-tourist,.tourist-card')).toHaveCount(0);
    await expect(page.locator('.map')).toBeVisible();
    await expect(page.locator('.map-empty-state')).toHaveText('Search for a journey to display the route.');
    await expect(page.locator('.map')).toHaveCount(1);
    await expect(page.locator('.map .leaflet-overlay-pane path')).toHaveCount(0);
    await page.locator('.map').evaluate(el => { el.dataset.instanceCheck = 'original'; });
    await page.screenshot({path:testInfo.outputPath(`homepage-${width}.png`),fullPage:true});
    await page.locator('.example-buttons button').first().click();
    await expect(page.locator('.map')).toHaveAttribute('data-instance-check','original');
    await expect(page.locator('.map')).toHaveCount(1);
    await expect(page.locator('.map-empty-state')).toHaveCount(0);
    await expect(page.locator('.result--journey')).toBeVisible();
    const boxes = await page.evaluate(() => {
      const rect = selector => { const r = document.querySelector(selector).getBoundingClientRect(); return {top:r.top + scrollY, left:r.left, width:r.width, height:r.height}; };
      return { search:rect('.search-card'), result:rect('.result'), map:rect('.map-card'), mapCanvas:rect('.map'), overflow:document.documentElement.scrollWidth > innerWidth };
    });
    expect(boxes.overflow).toBe(false);
    if (width > 800) {
      expect(Math.abs(boxes.search.top - boxes.map.top)).toBeLessThan(2);
      expect(boxes.search.top).toBeLessThan(height); // Main search remains in the initial viewport.
      expect(boxes.result.top).toBeGreaterThanOrEqual(boxes.map.top + boxes.map.height);
      expect(boxes.mapCanvas.height).toBeGreaterThanOrEqual(420);
      expect(boxes.mapCanvas.height).toBeLessThanOrEqual(500);
    } else {
      expect(boxes.map.top).toBeGreaterThan(boxes.search.top);
      expect(boxes.result.top).toBeGreaterThan(boxes.map.top + boxes.map.height);
      expect(boxes.mapCanvas.height).toBe(320);
    }
    const closedHeight = await page.locator('.assistant-disclosure').evaluate(el => el.offsetHeight);
    await page.locator('.assistant-disclosure > summary').click();
    await expect(page.getByRole('textbox', {name:'Your journey request'})).toBeVisible();
    const openHeight = await page.locator('.assistant-disclosure').evaluate(el => el.offsetHeight);
    measurements.push({width,height,...boxes,assistantClosedHeight:closedHeight,assistantExpandedHeight:openHeight,savedByCollapsingAssistant:openHeight-closedHeight});
    await page.locator('.assistant-disclosure > summary').click();
    await page.screenshot({path:testInfo.outputPath(`planner-${width}.png`),fullPage:true});

  }
  fs.writeFileSync(testInfo.outputPath('layout-measurements.json'), JSON.stringify(measurements,null,2));
  await page.goto('/about');
  await expect(page.getByRole('heading',{name:'About the project'})).toBeVisible();
  await page.screenshot({path:testInfo.outputPath('about.png'),fullPage:true});
  await expect(page.getByRole('combobox')).toHaveCount(0);
  await expect(page.locator('.assistant-disclosure')).toHaveCount(0);
  await page.goto('/#destinations');
  await expect(page.locator('#panel-tourist')).toHaveCount(0);
  await expect(page.locator('.map')).toBeVisible();
});
