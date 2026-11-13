import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://tile.openstreetmap.org/**', route => route.abort());
  await page.goto('/');
});

test('keyboard selection, escape, unknown input and reset', async ({ page }) => {
  const origin = page.getByRole('combobox', { name: 'Origin', exact: true });
  await origin.fill('rAt');
  await expect(page.getByRole('option').first()).toHaveAccessibleName('Rata Makai Chowk');
  await origin.press('ArrowDown');
  await origin.press('ArrowDown');
  await origin.press('ArrowUp');
  await origin.press('Enter');
  await expect(origin).toHaveValue('Rata Makai Chowk');
  await expect(origin).toHaveAttribute('aria-expanded', 'false');
  await page.getByRole('combobox', { name: 'Destination' }).fill('Chabahil');
  await expect(page.getByRole('button', { name: 'Find Routes', exact: true })).toBeEnabled();
  await origin.fill('Unknown stop');
  await expect(page.getByText('Please select a valid bus stop from the suggestions.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Find Routes', exact: true })).toBeEnabled();
  await origin.press('Escape');
  await expect(origin).toHaveAttribute('aria-expanded', 'false');
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(origin).toHaveValue('');
});

test('full dataset selection, independent fields, swap, and project route', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 850 });
  const origin = page.getByRole('combobox', { name: 'Origin', exact: true });
  const destination = page.getByRole('combobox', { name: 'Destination' });
  await origin.fill('Chu');
  await page.getByRole('option', { name: 'Chuchepati' }).click();
  await destination.fill('Rat');
  await page.getByRole('option', { name: 'Ratna Park', exact: true }).click();
  await expect(origin).toHaveValue('Chuchepati');
  await page.getByRole('button', { name: 'Swap origin and destination' }).click();
  await expect(origin).toHaveValue('Ratna Park');
  await expect(destination).toHaveValue('Chuchepati');
  await page.getByRole('button', { name: 'Find Routes', exact: true }).click();
  await expect(page.locator('.result')).toContainText('found.');
  await origin.fill('');
  await expect(page.getByRole('option')).toHaveCount(10);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
