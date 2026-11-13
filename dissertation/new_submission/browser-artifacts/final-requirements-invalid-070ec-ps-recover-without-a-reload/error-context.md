# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: final-requirements.spec.js >> invalid, empty and identical stops recover without a reload
- Location: e2e\final-requirements.spec.js:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('option', { name: 'Kapan', exact: true })
    - locator resolved to <li class="" role="option" id="_r_0_-option-0" aria-selected="false">…</li>

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "Skip to journey planner" [ref=e4] [cursor=pointer]:
    - /url: "#journey"
  - banner [ref=e5]:
    - link "Kathmandu Bus Route Finder home" [ref=e6] [cursor=pointer]:
      - /url: /
      - generic [ref=e16]:
        - text: Kathmandu
        - generic [ref=e17]: Bus Route Finder
    - navigation "Main navigation" [ref=e18]:
      - link "Journey Planner" [ref=e19] [cursor=pointer]:
        - /url: /#journey
      - link "About the project" [ref=e20] [cursor=pointer]:
        - /url: /about
  - main [ref=e21]:
    - region [ref=e22]:
      - generic [ref=e23]:
        - paragraph [ref=e24]: Across the valley. One journey at a time.
        - heading "Where do you want to go?" [level=1] [ref=e25]
        - paragraph [ref=e26]: Choose bus stops or a saved place for your next journey.
        - paragraph [ref=e27]: तपाईं कहाँ जान चाहनुहुन्छ?
    - generic [ref=e28]:
      - generic [ref=e29]:
        - generic [ref=e30]:
          - generic [ref=e31]:
            - generic [ref=e32]:
              - heading "Plan your journey" [level=2] [ref=e37]
              - generic [ref=e38]: Kathmandu Valley
            - generic [ref=e39]:
              - generic [ref=e41]:
                - generic [ref=e42]:
                  - text: From
                  - generic [ref=e43]: Origin
                - combobox "Origin" [expanded] [active] [ref=e44]: Kapan
                - listbox "Origin bus stops" [ref=e45]:
                  - option "Kapan" [ref=e46] [cursor=pointer]
                  - option "Aani Gumba Kapan" [ref=e50] [cursor=pointer]
                  - option "Banglamukhi Kapan" [ref=e54] [cursor=pointer]
                - status [ref=e58]: 3 suggestions shown. Use arrow keys and Enter to select.
              - generic [ref=e60]:
                - generic [ref=e61]:
                  - text: To
                  - generic [ref=e62]: Destination
                - combobox "Destination" [ref=e63]: Kapan
            - status [ref=e64]: Starting location and destination cannot be the same.
            - generic [ref=e65]:
              - button "Find Routes" [ref=e66] [cursor=pointer]
              - button "Use my location" [ref=e69] [cursor=pointer]
              - button "Swap origin and destination" [ref=e74] [cursor=pointer]
              - button "Reset" [ref=e77] [cursor=pointer]
          - region [ref=e78]:
            - generic [ref=e79]:
              - generic [ref=e80]:
                - heading "My Places" [level=3] [ref=e81]
                - paragraph [ref=e82]: मेरो स्थानहरू
              - button "+ Add place" [ref=e83] [cursor=pointer]
            - paragraph [ref=e84]: Save a bus stop or address for faster journey searches.
        - region [ref=e85]:
          - generic [ref=e86]:
            - heading "Route Map" [level=2] [ref=e88]
            - generic [ref=e89]: 0 stops
          - paragraph [ref=e90]: Search for a journey to display the route.
          - status [ref=e91]: Some map tiles could not load. Check your internet connection and reload. Journey search still works.
          - generic "Kathmandu map; select a journey to display stops" [ref=e92]:
            - generic:
              - generic [ref=e93]:
                - button "Zoom in" [ref=e94] [cursor=pointer]: +
                - button "Zoom out" [ref=e95] [cursor=pointer]: −
              - generic [ref=e96]:
                - link "Leaflet" [ref=e97] [cursor=pointer]:
                  - /url: https://leafletjs.com
                - text: "| ©"
                - link "OpenStreetMap" [ref=e102] [cursor=pointer]:
                  - /url: https://www.openstreetmap.org/copyright
                - text: contributors
          - group [ref=e103]:
            - generic "About this map" [ref=e104] [cursor=pointer]
      - region "Route result" [ref=e106]:
        - heading "Ready when you are" [level=2] [ref=e113]
        - status [ref=e114]: Search for a journey to get started.
      - tablist "Planner content" [ref=e115]:
        - tab "Journey Details" [selected] [ref=e116] [cursor=pointer]
        - tab "Nearby Stops" [ref=e117] [cursor=pointer]
      - tabpanel "Journey Details" [ref=e118]:
        - region [ref=e119]:
          - heading "Try an Example Journey" [level=3] [ref=e120]
          - generic [ref=e121]:
            - button "Thankot → Tribhuvan Airport" [ref=e122] [cursor=pointer]
            - button "Kapan → Balaju" [ref=e123] [cursor=pointer]
            - button "Godawari → Jamal" [ref=e124] [cursor=pointer]
        - paragraph [ref=e125]: Select a stop in your journey to focus it on the map.
      - group [ref=e126]:
        - generic "Ask Route Assistant यात्रा सहायक" [ref=e127] [cursor=pointer]
  - contentinfo [ref=e132]:
    - generic [ref=e133]:
      - strong [ref=e134]: Kathmandu Bus Route Finder
      - paragraph [ref=e135]: A Robust Web-Based Bus Route Finder System for Kathmandu Valley
      - paragraph [ref=e136]: Based on the project dataset. Services and journey times may vary.
    - generic [ref=e137]:
      - generic [ref=e138]: Final Year Project · 2026
      - link "© OpenStreetMap contributors" [ref=e139] [cursor=pointer]:
        - /url: https://www.openstreetmap.org/copyright
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('invalid, empty and identical stops recover without a reload', async ({ page }) => {
  4  |   await page.route('https://tile.openstreetmap.org/**', route => route.abort());
  5  |   await page.goto('/');
  6  |   const origin = page.getByRole('combobox', { name: 'Origin', exact: true });
  7  |   const destination = page.getByRole('combobox', { name: 'Destination', exact: true });
  8  |   const search = page.getByRole('button', { name: 'Find Routes', exact: true });
  9  |   await search.click();
  10 |   await expect(page.locator('.result')).toContainText('Please select a starting location.');
  11 |   await origin.fill('Kapan');
  12 |   await page.getByRole('option', { name: 'Kapan', exact: true }).click();
  13 |   await search.click();
  14 |   await expect(page.locator('.result')).toContainText('Please select a destination.');
  15 |   await destination.fill('Kapan');
  16 |   await page.getByRole('option', { name: 'Kapan', exact: true }).click();
  17 |   await search.click();
  18 |   await expect(page.locator('.result')).toContainText('Starting location and destination cannot be the same.');
  19 |   for (const input of [origin, destination]) {
  20 |     await input.fill('Not a supported stop');
  21 |     await expect(input).toHaveAttribute('aria-invalid', 'true');
  22 |     await search.click();
  23 |     await expect(page.getByText('Please select a valid bus stop from the suggestions.', { exact: true })).toBeVisible();
  24 |     await expect(page.locator('.result--journey')).toHaveCount(0);
  25 |     await input.fill('Kapan');
> 26 |     await page.getByRole('option', { name: 'Kapan', exact: true }).click();
     |                                                                    ^ Error: locator.click: Test timeout of 30000ms exceeded.
  27 |   }
  28 |   await destination.fill('Balaju');
  29 |   await page.getByRole('option', { name: 'Balaju', exact: true }).click();
  30 |   await search.click();
  31 |   await expect(page.locator('.result')).toContainText('found.');
  32 |   await expect(page.locator('.stop-marker.stop-marker--origin')).toHaveCount(1);
  33 |   await expect(page.locator('.stop-marker.stop-marker--destination')).toHaveCount(1);
  34 |   await expect(page.locator('.stop-marker.stop-marker--transfer')).toHaveCount(1);
  35 |   await expect(page.locator('.segment-company strong').first()).not.toBeEmpty();
  36 |   await expect(page.locator('.route-id').first()).not.toBeEmpty();
  37 |   await page.getByRole('button', { name: 'Reset', exact: true }).click();
  38 |   await expect(origin).toHaveValue('');
  39 |   await expect(destination).toHaveValue('');
  40 |   await expect(page.locator('.stop-marker')).toHaveCount(0);
  41 |   await expect(page.locator('.map .leaflet-overlay-pane path')).toHaveCount(0);
  42 |   await expect(page.locator('.map')).toBeVisible();
  43 |   await expect(page.getByText('Tourist Places', { exact: true })).toHaveCount(0);
  44 | });
  45 | 
  46 | test('repeated searches are consistent and complete within a few seconds', async ({ page }, testInfo) => {
  47 |   await page.route('https://tile.openstreetmap.org/**', route => route.abort());
  48 |   await page.goto('/');
  49 |   await page.getByRole('combobox', { name: 'Origin', exact: true }).fill('Kapan');
  50 |   await page.getByRole('option', { name: 'Kapan', exact: true }).click();
  51 |   await page.getByRole('combobox', { name: 'Destination', exact: true }).fill('Balaju');
  52 |   await page.getByRole('option', { name: 'Balaju', exact: true }).click();
  53 |   let expected;
  54 |   const durations = [];
  55 |   for (let i = 0; i < 5; i++) {
  56 |     const start = Date.now();
  57 |     await page.getByRole('button', { name: 'Find Routes', exact: true }).click();
  58 |     await expect(page.locator('.result--journey')).toBeVisible({ timeout: 3000 });
  59 |     durations.push(Date.now() - start);
  60 |     const text = await page.locator('.result').innerText();
  61 |     if (expected) expect(text).toBe(expected);
  62 |     expected = text;
  63 |     expect(durations.at(-1)).toBeLessThan(3000);
  64 |   }
  65 |   await testInfo.attach('search-durations-ms', { body: JSON.stringify(durations), contentType: 'application/json' });
  66 | });
  67 | 
```