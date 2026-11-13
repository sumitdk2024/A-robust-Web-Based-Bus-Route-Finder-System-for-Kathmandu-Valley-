import { test, expect } from '@playwright/test';

test('main workflow has no browser errors or retired UI', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  // A local tile fixture avoids treating deliberate offline tile failures as
  // application console errors. Journey lines/coordinates remain real data.
  const tile = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jw1QAAAAASUVORK5CYII=', 'base64');
  await page.route('https://tile.openstreetmap.org/**', route => route.fulfill({ contentType: 'image/png', body: tile }));
  await page.goto('/');
  await page.getByRole('combobox', { name: 'Origin', exact: true }).fill('Kap');
  await page.getByRole('option', { name: 'Kapan', exact: true }).click();
  await page.getByRole('combobox', { name: 'Destination', exact: true }).fill('Bala');
  await page.getByRole('option', { name: 'Balaju', exact: true }).click();
  await page.getByRole('button', { name: 'Find Routes', exact: true }).click();
  await expect(page.locator('.result--journey')).toBeVisible();
  await expect(page.locator('.stop-marker.stop-marker--transfer')).toHaveCount(1);
  await page.getByRole('button', { name: '+ Add place', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.locator('.assistant-disclosure > summary').click();
  await page.getByRole('textbox', { name: 'Your journey request' }).fill('Find a route from Thankot to Airport');
  await page.getByRole('button', { name: 'Find Route', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Direct Route', exact: true })).toBeVisible();
  await expect(page.locator('.my-places')).not.toContainText(/localStorage|Saved on this browser|Separate from your current location/);
  await expect(page.locator('.quick-destinations,.journey-alternatives,.understood,.developer-details')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^(Fastest|Fewer transfers|Less walking|Use interpreted journey)$/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(page.locator('.stop-marker')).toHaveCount(0);
  await page.goto('/about');
  await expect(page.getByRole('heading', { name: 'About the project' })).toBeVisible();
  expect(errors).toEqual([]);
});
