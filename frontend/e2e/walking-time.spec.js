import { test, expect } from '@playwright/test';
import { networkStops } from '../src/data/network.js';
import { estimateWalkingTime, formatWalkingTime, calculateTotalJourneyTime, formatEstimatedTimeRange } from '../src/utils/travelTime.js';
import { findJourney } from '../src/utils/findJourney.js';

test('nearby selection adds walking and total; manual origin and swap remove it', async ({ page, context }) => {
  await page.route('**/api/walking-route', route => route.fulfill({status:503,json:{message:'Walking directions unavailable'}}));
  await page.route('https://tile.openstreetmap.org/**', route => route.abort());
  const stop = networkStops.find(stop => stop.id === 'thankot');
  const location = {latitude:stop.latitude + 0.001,longitude:stop.longitude,accuracy:10};
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation(location);
  await page.goto('/');
  await page.getByRole('button', {name:'Use my location',exact:true}).click();
  await page.getByRole('tab', { name: 'Nearby Stops', exact: true }).click();
  const nearby = page.getByRole('region', {name:'Nearest stops',exact:true});
  await expect(nearby.getByRole('button')).toHaveCount(3);
  await expect(nearby.locator('li').first()).toContainText('min walk');
  await nearby.getByRole('button').nth(1).click();
  const originName = await page.getByRole('combobox',{name:'Origin',exact:true}).inputValue();
  const selected = networkStops.find(stop => stop.name === originName);
  const walking = estimateWalkingTime(location, selected);
  await page.getByRole('combobox',{name:'Destination',exact:true}).fill('Tribhuvan Airport');
  await page.getByRole('option',{name:'Tribhuvan Airport',exact:true}).click();
  await page.getByRole('button',{name:'Find Routes',exact:true}).click();
  await expect(page.locator('.walking-segment')).toContainText(selected.name);
  await expect(page.locator('.walking-segment')).toContainText(formatWalkingTime(walking.walkingMinutes));
  const total = calculateTotalJourneyTime(findJourney(selected.id,'airport'),walking);
  await expect(page.locator('.journey-summary')).toContainText(formatEstimatedTimeRange(total.estimatedMinutes));
  await page.getByText('About this estimate', {exact:true}).click();
  await expect(page.locator('.time-breakdown')).toBeVisible();
  for (const width of [375,768,1280]) {
    await page.setViewportSize({width,height:900});
    await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  await page.getByRole('combobox',{name:'Origin',exact:true}).fill(originName);
  await page.getByRole('option',{name:originName,exact:true}).click();
  await page.getByRole('button',{name:'Find Routes',exact:true}).click();
  await expect(page.locator('.result')).toContainText('found.');
  await expect(page.locator('.walking-segment')).toHaveCount(0);
  await expect(page.locator('.time-breakdown')).toHaveCount(0);
  await page.getByRole('tab', { name: 'Nearby Stops', exact: true }).click();
  await nearby.getByRole('button').first().click();
  await page.getByRole('button',{name:'Swap origin and destination'}).click();
  await page.getByRole('button',{name:'Find Routes',exact:true}).click();
  await expect(page.locator('.result')).toContainText('found.');
  await expect(page.locator('.walking-segment')).toHaveCount(0);
});
