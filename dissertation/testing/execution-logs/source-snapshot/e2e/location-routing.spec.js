import { test, expect } from '@playwright/test';
import { networkStops, stopsById } from '../src/data/network.js';
import { findNearestStops } from '../src/utils/distance.js';

test.beforeEach(async ({ page, context }) => {
  await page.route('https://tile.openstreetmap.org/**', route => route.abort());
  await context.grantPermissions(['geolocation']);
});

for (const [country, latitude, longitude] of [['Denmark',55.6761,12.5683],['India',26.7606,83.3732]]) {
  test(`${country} is rejected before nearby stops, pedestrian calls or location map layers`, async ({page,context}) => {
    let calls=0;
    await page.route('**/api/walking-route',route=>{calls++;return route.fulfill({status:503});});
    await context.setGeolocation({latitude,longitude});
    await page.goto('/');
    await page.getByRole('combobox',{name:'Destination',exact:true}).fill('Balaju');
    await page.getByRole('option',{name:'Balaju',exact:true}).click();
    await page.getByRole('button',{name:'Use my location',exact:true}).click();
    await expect(page.locator('#location-status')).toHaveText('Live location is available only within Nepal. Please select a starting bus stop manually.');
    await expect(page.getByRole('combobox',{name:'Origin',exact:true})).toHaveValue('');
    await expect(page.locator('.user-location-marker,.walking-route,.walking-route-fallback,.result--journey')).toHaveCount(0);
    expect(calls).toBe(0);
    await page.getByRole('combobox',{name:'Origin',exact:true}).fill('Kapan');
    await page.getByRole('option',{name:'Kapan',exact:true}).click();
    await page.getByRole('button',{name:'Find Routes',exact:true}).click();
    await expect(page.locator('.result--journey')).toBeVisible();
  });
}

test('Pokhara passes country eligibility but has no bus dataset coverage', async ({page,context}) => {
  let calls=0;
  await page.route('**/api/walking-route',route=>{calls++;return route.fulfill({status:503});});
  await context.setGeolocation({latitude:28.2096,longitude:83.9856});
  await page.goto('/');
  await page.getByRole('button',{name:'Use my location',exact:true}).click();
  await expect(page.locator('#location-status')).toHaveText('No supported bus stop was found near your current location.');
  await expect(page.locator('.user-location-marker,.walking-route,.walking-route-fallback')).toHaveCount(0);
  expect(calls).toBe(0);
});

test('Kathmandu compares three pedestrian durations, draws returned geometry and uses provider totals', async ({page,context}) => {
  const location={latitude:stopsById.thankot.latitude+0.001,longitude:stopsById.thankot.longitude};
  const candidates=findNearestStops(networkStops,location.latitude,location.longitude,3);
  const fastest=candidates[1];
  let calls=0;
  await page.route('**/api/walking-route',async route=>{
    calls++;
    const {start,end}=route.request().postDataJSON();
    const preferred=end.lat===fastest.latitude && end.lon===fastest.longitude;
    await route.fulfill({json:{geometry:{type:'LineString',coordinates:[[start.lon,start.lat],[start.lon+0.002,start.lat+0.001],[end.lon,end.lat]]},distanceMetres:preferred?720:1200,durationSeconds:preferred?480:900}});
  });
  await context.setGeolocation(location);
  await page.goto('/');
  await page.getByRole('button',{name:'Use my location',exact:true}).click();
  await expect(page.getByRole('combobox',{name:'Origin',exact:true})).toHaveValue(fastest.name);
  expect(calls).toBe(3);
  await expect(page.locator('.walking-route')).toHaveCount(1);
  await expect(page.locator('.walking-route-fallback')).toHaveCount(0);
  expect((await page.locator('.walking-route').getAttribute('d')).match(/L/g).length).toBeGreaterThanOrEqual(2);
  await page.getByRole('tab',{name:'Nearby Stops',exact:true}).click();
  const first=page.locator('.nearest-stops li').first();
  await expect(first).toContainText(fastest.name);
  await expect(first).toContainText('~8 min walk');
  await expect(first).toContainText('720 m');
  await first.getByRole('button').click();
  await page.getByRole('combobox',{name:'Destination',exact:true}).fill('Tribhuvan Airport');
  await page.getByRole('option',{name:'Tribhuvan Airport',exact:true}).click();
  await page.getByRole('button',{name:'Find Routes',exact:true}).click();
  await expect(page.locator('.walking-segment')).toContainText('Pedestrian route');
  await expect(page.locator('.walking-segment')).toContainText('~8 min walk');
  await expect(page.locator('.walking-segment')).toContainText('720 m');
  expect(calls).toBe(3); // Selecting/searching uses the in-memory candidate routes.
});

test('provider failure keeps the stop and labels the approximate walking fallback', async ({page,context}) => {
  await page.route('**/api/walking-route',route=>route.fulfill({status:503}));
  await context.setGeolocation({latitude:stopsById.thankot.latitude,longitude:stopsById.thankot.longitude});
  await page.goto('/');
  await page.getByRole('button',{name:'Use my location',exact:true}).click();
  await expect(page.getByRole('combobox',{name:'Origin',exact:true})).toHaveValue('Thankot');
  await expect(page.locator('#location-status')).toHaveText('Walking directions are temporarily unavailable. An approximate distance is shown instead.');
  await expect(page.locator('.walking-route-fallback')).toHaveCount(1);
  await expect(page.locator('.map-caption')).toContainText('Approximate connection');
  await page.getByRole('combobox',{name:'Destination',exact:true}).fill('Tribhuvan Airport');
  await page.getByRole('option',{name:'Tribhuvan Airport',exact:true}).click();
  await page.getByRole('button',{name:'Find Routes',exact:true}).click();
  await expect(page.locator('.walking-segment')).toContainText('Approximate walking estimate');
});

test('reset cancels outstanding pedestrian routes without restoring location or origin', async ({page,context}) => {
  let release;
  const gate=new Promise(resolve=>{release=resolve;});
  await page.route('**/api/walking-route',async route=>{await gate;await route.fulfill({status:503}).catch(()=>{});});
  await context.setGeolocation({latitude:27.7,longitude:85.3});
  await page.goto('/');
  await page.getByRole('button',{name:'Use my location',exact:true}).click();
  await expect(page.locator('#location-status')).toHaveText('Finding walking route to the bus stop...');
  await page.getByRole('button',{name:'Reset',exact:true}).click();
  release();
  await expect(page.locator('.user-location-marker,.walking-route,.walking-route-fallback')).toHaveCount(0);
  await expect(page.getByRole('combobox',{name:'Origin',exact:true})).toHaveValue('');
  await expect(page.locator('#location-status')).toBeEmpty();
});
