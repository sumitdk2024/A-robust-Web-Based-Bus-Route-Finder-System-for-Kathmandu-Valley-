import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => { await page.route('https://tile.openstreetmap.org/**', route => route.abort()); await page.goto('/'); });
test('direct and transfer journeys, all stops and map focus', async ({ page }) => {
 await page.locator('.example-buttons button').nth(0).click();
 await expect(page.getByRole('heading', { name: 'Direct Route', exact: true })).toBeVisible();
 await expect(page.locator('.journey')).toContainText('R01_A');
 await expect(page.locator('.stop-marker')).toHaveCount(28);
 await page.locator('.example-buttons button').nth(1).click();
 await expect(page.getByRole('heading', { name: '1 Transfer', exact: true })).toBeVisible();
 await expect(page.locator('.stop-marker')).toHaveCount(25);
 await expect(page.locator('.transfer')).toContainText('Change bus here');
 await page.getByText('View journey details', { exact: true }).click();
 await page.locator('.stop-list button').first().click();
 await expect(page.locator('.leaflet-popup-content')).toContainText('Kapan');
 await page.getByRole('button', { name: 'Show all stops (25)' }).click();
 await expect(page.locator('.stop-list li')).toHaveCount(25);
});
test('validation, reset, swap and repeat search', async ({ page }) => {
 await page.getByRole('button',{name:'Find Routes',exact:true}).click();
 await expect(page.locator('.result')).toContainText('Please select a starting location.');
 await page.locator('.example-buttons button').nth(0).click();
 await page.getByRole('button',{name:'Swap origin and destination'}).click();
 await expect(page.getByRole('combobox',{name:'Origin',exact:true})).toHaveValue('Tribhuvan Airport');
 await page.getByRole('button',{name:'Find Routes',exact:true}).click();
 await expect(page.locator('.result')).toContainText('found.');
 await page.getByRole('button',{name:'Reset',exact:true}).click();
 await expect(page.getByRole('combobox',{name:'Origin',exact:true})).toHaveValue('');
 await expect(page.locator('.stop-marker')).toHaveCount(0);
});
test('responsive layout', async ({ page }) => {
 for(const width of [375,768,1280]) { await page.setViewportSize({width,height:900}); await page.locator('.example-buttons button').nth(0).click(); await expect(page.getByRole('heading',{name:'Direct Route',exact:true})).toBeVisible(); await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true); }
});


test('homepage has My Places instead of Quick Stops or journey alternatives', async ({ page }) => {
 await expect(page.getByRole('heading',{name:'My Places',exact:true})).toBeVisible();
 await expect(page.getByText('Quick stops',{exact:true})).toHaveCount(0);
 await expect(page.locator('.quick-destinations,.journey-alternatives')).toHaveCount(0);
 await expect(page.getByRole('button',{name:'+ Add place',exact:true})).toBeVisible();
});

test('two transfers keep segment details and map markers', async ({ page }) => {
 await page.getByRole('combobox', { name: 'Origin', exact: true }).fill('Baadbhanjyan (Thankot)');
 await page.getByRole('option', { name: 'Baadbhanjyan (Thankot)', exact: true }).click();
 await page.getByRole('combobox', { name: 'Destination', exact: true }).fill('Petrol Pump Panipokhari');
 await page.getByRole('option', { name: 'Petrol Pump Panipokhari', exact: true }).click();
 await page.getByRole('button', { name: 'Find Routes', exact: true }).click();
 await expect(page.getByRole('heading', { name: '2 Transfers', exact: true })).toBeVisible();
 await expect(page.locator('.journey-leg')).toHaveCount(3);
 await expect(page.locator('.transfer')).toHaveCount(2);
 await expect(page.locator('.stop-marker.stop-marker--transfer')).toHaveCount(2);
 await page.locator('.journey-leg details').first().locator('summary').click();
 await expect(page.locator('.journey-leg details').first().locator('ol')).toBeVisible();
});

