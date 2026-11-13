import { test, expect } from '@playwright/test';
import { findJourney } from '../src/utils/findJourney.js';
import { getJourneyStops } from '../src/utils/journeyStops.js';

test.beforeEach(async ({ page }) => {
  await page.route('https://tile.openstreetmap.org/**', route => route.abort());
  await page.goto('/');
  await expect(page.locator('.stop-marker,.leaflet-tooltip')).toHaveCount(0);
});

test('only endpoints and transfers have permanent labels, without duplicate markers', async ({ page }) => {
  for (const [from, to] of [['thankot','airport'], ['kapan','balaju'], ['baadbhanjyan(thankot)','petrol_pump-panipokhari']]) {
    const result = findJourney(from, to);
    const stops = getJourneyStops(result);
    const unique = new Map(stops.map(stop => [stop.id, stop]));
    for (const [field, name] of [['Origin', stops[0].name], ['Destination', stops.at(-1).name]]) {
      await page.getByRole('combobox', { name: field, exact: true }).fill(name);
      await page.getByRole('option', { name, exact: true }).click();
    }
    await page.getByRole('button', { name: 'Find Routes', exact: true }).click();
    await expect(page.locator('.result--journey')).toBeVisible();
    await expect(page.locator('.stop-marker')).toHaveCount(unique.size);
    const prominent = [...unique.values()].filter(stop => stop.role !== 'intermediate');
    await expect(page.locator('.leaflet-tooltip')).toHaveCount(prominent.length);
    expect((await page.locator('.leaflet-tooltip').allTextContents()).sort()).toEqual(prominent.map(stop => stop.name).sort());
    await expect(page.locator('.stop-marker.stop-marker--transfer')).toHaveCount(new Set(result.transfers).size);
    for (const stop of unique.values()) {
      await expect(page.locator(`.stop-marker[title^="${stop.name}:"]`)).toHaveCount(1);
    }
    await expect(page.locator('.map .leaflet-overlay-pane path')).toHaveCount(result.legs.length);
  }
});

test.describe('mobile intermediate stops', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });
  test('small dots retain touch targets, popups and keyboard access', async ({ page }) => {
    await page.locator('.example-buttons button').first().click();
    const dot = page.locator('.stop-marker.stop-marker--intermediate').first();
    await expect(dot).toBeVisible();
    const label = await dot.getAttribute('aria-label');
    const name = label.split(':')[0];
    const sizes = await dot.evaluate(el => ({ target: el.getBoundingClientRect().width, dot: el.firstElementChild.getBoundingClientRect().width }));
    expect(sizes.target).toBeGreaterThanOrEqual(44);
    expect(sizes.dot).toBe(12);
    await dot.focus();
    await dot.press('Enter');
    await expect(page.locator('.leaflet-popup-content')).toContainText(name);
    await expect(page.locator('.leaflet-popup-content')).toContainText('Intermediate stop');
    await page.locator('.leaflet-popup-close-button').click();
    // Use the existing stop-list focus action to zoom into dense stops before
    // tapping; their touch targets can overlap at a whole-journey overview.
    await page.locator('.journey-leg details > summary').first().click();
    await page.locator('.journey-leg details').getByRole('button', { name, exact: true }).click();
    await expect(page.locator('.leaflet-popup-content')).toContainText(name);
    await page.locator('.leaflet-popup-close-button').click();
    await dot.tap({ position: { x: 22, y: 22 } });
    await expect(page.locator('.leaflet-popup-content')).toContainText(name);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect(page.locator('.stop-marker,.leaflet-tooltip,.leaflet-popup')).toHaveCount(0);
  });
});
