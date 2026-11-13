import { test, expect } from '@playwright/test';

test('invalid, empty and identical stops recover without a reload', async ({ page }) => {
  await page.route('https://tile.openstreetmap.org/**', route => route.abort());
  await page.goto('/');
  const origin = page.getByRole('combobox', { name: 'Origin', exact: true });
  const destination = page.getByRole('combobox', { name: 'Destination', exact: true });
  const search = page.getByRole('button', { name: 'Find Routes', exact: true });
  await search.click();
  await expect(page.locator('.result')).toContainText('Please select a starting location.');
  await origin.fill('Kapan');
  await page.getByRole('option', { name: 'Kapan', exact: true }).click();
  await search.click();
  await expect(page.locator('.result')).toContainText('Please select a destination.');
  await destination.fill('Kapan');
  await page.getByRole('option', { name: 'Kapan', exact: true }).click();
  await search.click();
  await expect(page.locator('.result')).toContainText('Starting location and destination cannot be the same.');
  for (const input of [origin, destination]) {
    await input.fill('Not a supported stop');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await search.click();
    await expect(page.getByText('Please select a valid bus stop from the suggestions.', { exact: true })).toBeVisible();
    await expect(page.locator('.result--journey')).toHaveCount(0);
    await input.fill('Kapan');
    await page.getByRole('option', { name: 'Kapan', exact: true }).click();
  }
  await destination.fill('Balaju');
  await page.getByRole('option', { name: 'Balaju', exact: true }).click();
  await search.click();
  await expect(page.locator('.result')).toContainText('found.');
  await expect(page.locator('.stop-marker.stop-marker--origin')).toHaveCount(1);
  await expect(page.locator('.stop-marker.stop-marker--destination')).toHaveCount(1);
  await expect(page.locator('.stop-marker.stop-marker--transfer')).toHaveCount(1);
  await expect(page.locator('.segment-company strong').first()).not.toBeEmpty();
  await expect(page.locator('.route-id').first()).not.toBeEmpty();
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(origin).toHaveValue('');
  await expect(destination).toHaveValue('');
  await expect(page.locator('.stop-marker')).toHaveCount(0);
  await expect(page.locator('.map .leaflet-overlay-pane path')).toHaveCount(0);
  await expect(page.locator('.map')).toBeVisible();
  await expect(page.getByText('Tourist Places', { exact: true })).toHaveCount(0);
});

test('repeated searches are consistent and complete within a few seconds', async ({ page }, testInfo) => {
  await page.route('https://tile.openstreetmap.org/**', route => route.abort());
  await page.goto('/');
  await page.getByRole('combobox', { name: 'Origin', exact: true }).fill('Kapan');
  await page.getByRole('option', { name: 'Kapan', exact: true }).click();
  await page.getByRole('combobox', { name: 'Destination', exact: true }).fill('Balaju');
  await page.getByRole('option', { name: 'Balaju', exact: true }).click();
  let expected;
  const durations = [];
  for (let i = 0; i < 5; i++) {
    const start = Date.now();
    await page.getByRole('button', { name: 'Find Routes', exact: true }).click();
    await expect(page.locator('.result--journey')).toBeVisible({ timeout: 3000 });
    durations.push(Date.now() - start);
    const text = await page.locator('.result').innerText();
    if (expected) expect(text).toBe(expected);
    expected = text;
    expect(durations.at(-1)).toBeLessThan(3000);
  }
  await testInfo.attach('search-durations-ms', { body: JSON.stringify(durations), contentType: 'application/json' });
});
