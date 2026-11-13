import { test, expect } from '@playwright/test';
import { networkStops } from '../src/data/network.js';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/walking-route', route => route.fulfill({status:503,json:{message:'Walking directions unavailable'}}));
  await page.route('https://tile.openstreetmap.org/**', route => route.abort());
});

test('location selects origin, offers three stops, and preserves journey search and reset', async ({ page, context }) => {
  const stop = networkStops.find(stop => stop.name === 'Thankot');
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: stop.latitude, longitude: stop.longitude, accuracy: 20 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Use my location' }).click();
  const origin = page.getByRole('combobox', { name: 'Origin', exact: true });
  await expect(origin).toHaveValue('Thankot');
  await page.getByRole('tab', { name: 'Nearby Stops', exact: true }).click();
  const nearby = page.getByRole('region', { name: 'Nearest stops', exact: true });
  await expect(nearby.getByRole('button')).toHaveCount(3);
  await expect(nearby.locator('li').first()).toContainText('0 m');
  await expect(page.locator('.user-location-marker')).toHaveCount(1);
  await nearby.getByRole('button').nth(1).click();
  await expect(nearby.getByRole('button').nth(1)).toHaveAttribute('aria-pressed', 'true');
  await expect(origin).not.toHaveValue('Thankot');
  await page.getByRole('tab', { name: 'Nearby Stops', exact: true }).click();
  await nearby.getByRole('button').first().click();
  await page.getByRole('combobox', { name: 'Destination', exact: true }).fill('Tribhuvan Airport');
  await page.getByRole('option', { name: 'Tribhuvan Airport', exact: true }).click();
  await page.getByRole('button', { name: 'Find Routes', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Direct Route', exact: true })).toBeVisible();
  await expect(page.locator('.user-location-marker')).toHaveCount(1);
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(origin).toHaveValue('');
  await expect(nearby).toHaveCount(0);
  await expect(page.locator('.user-location-marker')).toHaveCount(0);
});

for (const [code, message] of [[1, 'Location access was denied. Please select a starting bus stop manually.'], [2, 'Unable to obtain your location. Try again or select a stop manually.'], [3, 'Location request timed out. Try again or select a stop manually.']]) {
  test(`location error ${code} restores button and preserves manual input`, async ({ page }) => {
    await page.addInitScript(code => Object.defineProperty(navigator, 'geolocation', { value: {
      getCurrentPosition: (success, failure) => { window.failLocation = () => failure({ code }); },
    } }), code);
    await page.goto('/');
    await page.getByRole('combobox', { name: 'Origin', exact: true }).fill('Jamal');
    await page.getByRole('option', { name: 'Jamal', exact: true }).click();
    await page.getByRole('button', { name: 'Use my location' }).click();
    await expect(page.getByRole('button', { name: 'Finding your location...' })).toBeDisabled();
    await page.evaluate(() => window.failLocation());
    await expect(page.locator('#location-status')).toHaveText(message);
    await expect(page.getByRole('button', { name: 'Use my location' })).toBeEnabled();
    await expect(page.getByRole('combobox', { name: 'Origin', exact: true })).toHaveValue('Jamal');
  });
}

test('reset ignores a pending location response', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'geolocation', { value: {
    getCurrentPosition: success => { window.finishLocation = () => success({ coords: { latitude: 27.7, longitude: 85.3, accuracy: 10 } }); },
  } }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Use my location' }).click();
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await page.evaluate(() => window.finishLocation());
  await expect(page.getByRole('combobox', { name: 'Origin', exact: true })).toHaveValue('');
  await expect(page.locator('.user-location-marker')).toHaveCount(0);
});
