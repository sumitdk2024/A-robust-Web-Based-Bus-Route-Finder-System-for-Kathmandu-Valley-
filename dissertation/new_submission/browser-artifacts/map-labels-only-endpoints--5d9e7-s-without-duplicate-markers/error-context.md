# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: map-labels.spec.js >> only endpoints and transfers have permanent labels, without duplicate markers
- Location: e2e\map-labels.spec.js:11:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('.stop-marker[title^="Kapan:"]')
Expected: 1
Received: undefined

Call log:
  - Expect "toHaveCount" locator('.stop-marker[title^="Kapan:"]') with timeout 5000ms
  - waiting for locator('.stop-marker[title^="Kapan:"]')
  - Protocol error (Runtime.callFunctionOn): Internal server error, session closed.

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
        - heading "Where do you want to go?" [level=1] [ref=e24]
        - paragraph [ref=e25]: Choose bus stops or a saved place for your next journey.
    - generic [ref=e26]:
      - generic [ref=e27]:
        - generic [ref=e28]:
          - generic [ref=e29]:
            - generic [ref=e30]:
              - heading "Plan your journey" [level=2] [ref=e35]
              - generic [ref=e36]: Kathmandu Valley
            - generic [ref=e37]:
              - generic [ref=e39]:
                - generic [ref=e40]:
                  - text: From
                  - generic [ref=e41]: Origin
                - combobox "Origin" [ref=e42]: Kapan
              - generic [ref=e44]:
                - generic [ref=e45]:
                  - text: To
                  - generic [ref=e46]: Destination
                - combobox "Destination" [ref=e47]: Balaju
            - status [ref=e48]: Select a bus stop from the suggestions.
            - generic [ref=e49]:
              - button "Find Routes" [ref=e50] [cursor=pointer]
              - button "Use my location" [ref=e53] [cursor=pointer]
              - button "Swap origin and destination" [ref=e58] [cursor=pointer]
              - button "Reset" [ref=e61] [cursor=pointer]
          - region [ref=e62]:
            - generic [ref=e63]:
              - generic [ref=e64]:
                - heading "My Places" [level=3] [ref=e65]
                - paragraph [ref=e66]: मेरो स्थानहरू
              - button "+ Add place" [ref=e67] [cursor=pointer]
            - paragraph [ref=e68]: Save a bus stop or address for faster journey searches.
        - region [ref=e69]:
          - generic [ref=e70]:
            - heading "Route Map" [level=2] [ref=e72]
            - generic [ref=e73]: 25 stops
          - status [ref=e74]: Some map tiles could not load. Check your internet connection and reload. Journey search still works.
          - generic "Map of stops in the selected journey" [ref=e75]:
            - generic:
              - generic:
                - img:
                  - generic:
                    - generic [ref=e76] [cursor=pointer]
                    - generic [ref=e77] [cursor=pointer]
              - generic:
                - 'button "Kapan: Origin" [ref=e78] [cursor=pointer]':
                  - generic [aria-hidden] [ref=e79]: O
                - 'button "Banglamukhi Kapan: Intermediate stop" [ref=e80] [cursor=pointer]'
                - 'button "Dhaulagiri Chowk: Intermediate stop" [ref=e82] [cursor=pointer]'
                - 'button "Aani Gumba Kapan: Intermediate stop" [ref=e84] [cursor=pointer]'
                - 'button "Kharibot Faika: Intermediate stop" [ref=e86] [cursor=pointer]'
                - 'button "Sanima Bank Faika: Intermediate stop" [ref=e88] [cursor=pointer]'
                - 'button "Faika Chowk: Intermediate stop" [ref=e90] [cursor=pointer]'
                - 'button "Mandala Banquet Mahankal: Intermediate stop" [ref=e92] [cursor=pointer]'
                - 'button "Bajranagar: Intermediate stop" [ref=e94] [cursor=pointer]'
                - 'button "Mugum Gumbha Mahankal: Intermediate stop" [ref=e96] [cursor=pointer]'
                - 'button "Ramsterdam Cafe Mahankal: Intermediate stop" [ref=e98] [cursor=pointer]'
                - 'button "Mahankal: Intermediate stop" [ref=e100] [cursor=pointer]'
                - 'button "Chuchhepati: Intermediate stop" [ref=e102] [cursor=pointer]'
                - 'button "Shanti Goreto Chabahil: Intermediate stop" [ref=e104] [cursor=pointer]'
                - 'button "Maiju Bahal Chabahil: Intermediate stop" [ref=e106] [cursor=pointer]'
                - 'button "Chabahil: Intermediate stop" [ref=e108] [cursor=pointer]'
                - 'button "Gopi Krishna: Intermediate stop" [ref=e110] [cursor=pointer]'
                - 'button "Dhumbarahi: Intermediate stop" [ref=e112] [cursor=pointer]'
                - 'button "Narayan Gopal Chowk: Transfer · Change bus here" [ref=e114] [cursor=pointer]':
                  - generic [aria-hidden] [ref=e115]: T
                - 'button "Chiray Hospital: Intermediate stop" [ref=e116] [cursor=pointer]'
                - 'button "Basundhara: Intermediate stop" [ref=e118] [cursor=pointer]'
                - 'button "Samakhusi: Intermediate stop" [ref=e120] [cursor=pointer]'
                - 'button "Gongabu Chowk: Intermediate stop" [ref=e122] [cursor=pointer]'
                - 'button "Machha Pokhari: Intermediate stop" [ref=e124] [cursor=pointer]'
                - 'button "Balaju: Destination" [ref=e126] [cursor=pointer]':
                  - generic [aria-hidden] [ref=e127]: D
              - generic:
                - tooltip "Kapan"
                - tooltip "Narayan Gopal Chowk"
                - tooltip "Balaju"
            - generic:
              - generic [ref=e128]:
                - button "Zoom in" [ref=e129] [cursor=pointer]: +
                - button "Zoom out" [ref=e130] [cursor=pointer]: −
              - generic [ref=e131]:
                - link "Leaflet" [ref=e132] [cursor=pointer]:
                  - /url: https://leafletjs.com
                - text: "| ©"
                - link "OpenStreetMap" [ref=e137] [cursor=pointer]:
                  - /url: https://www.openstreetmap.org/copyright
                - text: contributors
          - generic [ref=e138]:
            - generic [ref=e139]:
              - generic [aria-hidden] [ref=e140]: O
              - text: Origin
            - generic [ref=e141]:
              - generic [aria-hidden] [ref=e142]: D
              - text: Destination
            - generic [ref=e143]:
              - generic [aria-hidden] [ref=e144]: •
              - text: Intermediate stop
            - generic [ref=e145]:
              - generic [aria-hidden] [ref=e146]: T
              - text: Transfer stop
            - generic [ref=e147]: Illustrative connection
          - group [ref=e149]:
            - generic "About this map" [ref=e150] [cursor=pointer]
      - region "Route result" [ref=e152]:
        - heading "Your journey" [level=2] [ref=e154]
        - status [ref=e155]: 1 Transfer found. 25 stops.
        - generic [ref=e156]:
          - heading "1 Transfer" [level=3] [ref=e157]
          - generic [ref=e161]: Bus connections
        - paragraph [ref=e162]: Kapan → Balaju
        - generic [ref=e163]:
          - generic "Journey summary" [ref=e164]:
            - generic [ref=e165]:
              - term [ref=e166]: Estimated travel time
              - definition [ref=e167]: Approx. 50–60 min
            - generic [ref=e168]:
              - term [ref=e169]: Stops
              - definition [ref=e170]: 25 stops
            - generic [ref=e171]:
              - term [ref=e172]: Bus changes
              - definition [ref=e173]: 1 transfer
            - generic [ref=e174]:
              - term [ref=e175]: Approximate bus distance
              - definition [ref=e176]: Approx. 11.1 km
          - group [ref=e177]:
            - generic "About this estimate" [ref=e178] [cursor=pointer]
        - list [ref=e179]:
          - listitem [ref=e180]:
            - generic [ref=e181]:
              - strong [ref=e184]: Nepal Yatayat
              - generic [ref=e185]: R16_A
            - paragraph [ref=e186]: outbound · Kapan ⇄ Tikathali
            - generic [ref=e187]:
              - button "Board Kapan" [ref=e188] [cursor=pointer]:
                - generic [ref=e189]: Board
                - strong [ref=e190]: Kapan
              - group [ref=e191]:
                - generic "Show 17 intermediate stops" [ref=e192] [cursor=pointer]
              - button "Alight Narayan Gopal Chowk" [ref=e193] [cursor=pointer]:
                - generic [ref=e194]: Alight
                - strong [ref=e195]: Narayan Gopal Chowk
          - listitem [ref=e196]:
            - generic [ref=e199]:
              - strong [ref=e200]: Change bus here
              - paragraph [ref=e201]: Transfer at Narayan Gopal Chowk
          - listitem [ref=e202]:
            - generic [ref=e203]:
              - strong [ref=e206]: Mahanagar Yatayat
              - generic [ref=e207]: R11_B
            - paragraph [ref=e208]: inbound · Ringroad
            - generic [ref=e209]:
              - button "Board Narayan Gopal Chowk" [ref=e210] [cursor=pointer]:
                - generic [ref=e211]: Board
                - strong [ref=e212]: Narayan Gopal Chowk
              - group [ref=e213]:
                - generic "Show 5 intermediate stops" [ref=e214] [cursor=pointer]
              - button "Alight Balaju" [ref=e215] [cursor=pointer]:
                - generic [ref=e216]: Alight
                - strong [ref=e217]: Balaju
        - group [ref=e218]:
          - generic "View journey details" [ref=e219] [cursor=pointer]
      - tablist "Planner content" [ref=e220]:
        - tab "Journey Details" [selected] [ref=e221] [cursor=pointer]
        - tab "Nearby Stops" [ref=e222] [cursor=pointer]
      - tabpanel "Journey Details" [ref=e223]:
        - region [ref=e224]:
          - heading "Try an Example Journey" [level=3] [ref=e225]
          - generic [ref=e226]:
            - button "Thankot → Tribhuvan Airport" [ref=e227] [cursor=pointer]
            - button "Kapan → Balaju" [ref=e228] [cursor=pointer]
            - button "Godawari → Jamal" [ref=e229] [cursor=pointer]
        - paragraph [ref=e230]: Select a stop in your journey to focus it on the map.
      - group [ref=e231]:
        - generic "Ask Route Assistant यात्रा सहायक" [ref=e232] [cursor=pointer]
  - contentinfo [ref=e237]:
    - generic [ref=e238]:
      - strong [ref=e239]: Kathmandu Bus Route Finder
      - paragraph [ref=e240]: A Robust Web-Based Bus Route Finder System for Kathmandu Valley
      - paragraph [ref=e241]: Based on the project dataset. Services and journey times may vary.
    - generic [ref=e242]:
      - generic [ref=e243]: Final Year Project · 2026
      - link "© OpenStreetMap contributors" [ref=e244] [cursor=pointer]:
        - /url: https://www.openstreetmap.org/copyright
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { findJourney } from '../src/utils/findJourney.js';
  3  | import { getJourneyStops } from '../src/utils/journeyStops.js';
  4  | 
  5  | test.beforeEach(async ({ page }) => {
  6  |   await page.route('https://tile.openstreetmap.org/**', route => route.abort());
  7  |   await page.goto('/');
  8  |   await expect(page.locator('.stop-marker,.leaflet-tooltip')).toHaveCount(0);
  9  | });
  10 | 
  11 | test('only endpoints and transfers have permanent labels, without duplicate markers', async ({ page }) => {
  12 |   for (const [from, to] of [['thankot','airport'], ['kapan','balaju'], ['baadbhanjyan(thankot)','petrol_pump-panipokhari']]) {
  13 |     const result = findJourney(from, to);
  14 |     const stops = getJourneyStops(result);
  15 |     const unique = new Map(stops.map(stop => [stop.id, stop]));
  16 |     for (const [field, name] of [['Origin', stops[0].name], ['Destination', stops.at(-1).name]]) {
  17 |       await page.getByRole('combobox', { name: field, exact: true }).fill(name);
  18 |       await page.getByRole('option', { name, exact: true }).click();
  19 |     }
  20 |     await page.getByRole('button', { name: 'Find Routes', exact: true }).click();
  21 |     await expect(page.locator('.result--journey')).toBeVisible();
  22 |     await expect(page.locator('.stop-marker')).toHaveCount(unique.size);
  23 |     const prominent = [...unique.values()].filter(stop => stop.role !== 'intermediate');
  24 |     await expect(page.locator('.leaflet-tooltip')).toHaveCount(prominent.length);
  25 |     expect((await page.locator('.leaflet-tooltip').allTextContents()).sort()).toEqual(prominent.map(stop => stop.name).sort());
  26 |     await expect(page.locator('.stop-marker.stop-marker--transfer')).toHaveCount(new Set(result.transfers).size);
  27 |     for (const stop of unique.values()) {
> 28 |       await expect(page.locator(`.stop-marker[title^="${stop.name}:"]`)).toHaveCount(1);
     |                                                                          ^ Error: expect(locator).toHaveCount(expected) failed
  29 |     }
  30 |     await expect(page.locator('.map .leaflet-overlay-pane path')).toHaveCount(result.legs.length);
  31 |   }
  32 | });
  33 | 
  34 | test.describe('mobile intermediate stops', () => {
  35 |   test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });
  36 |   test('small dots retain touch targets, popups and keyboard access', async ({ page }) => {
  37 |     await page.locator('.example-buttons button').first().click();
  38 |     const dot = page.locator('.stop-marker.stop-marker--intermediate').first();
  39 |     await expect(dot).toBeVisible();
  40 |     const label = await dot.getAttribute('aria-label');
  41 |     const name = label.split(':')[0];
  42 |     const sizes = await dot.evaluate(el => ({ target: el.getBoundingClientRect().width, dot: el.firstElementChild.getBoundingClientRect().width }));
  43 |     expect(sizes.target).toBeGreaterThanOrEqual(44);
  44 |     expect(sizes.dot).toBe(12);
  45 |     await dot.focus();
  46 |     await dot.press('Enter');
  47 |     await expect(page.locator('.leaflet-popup-content')).toContainText(name);
  48 |     await expect(page.locator('.leaflet-popup-content')).toContainText('Intermediate stop');
  49 |     await page.locator('.leaflet-popup-close-button').click();
  50 |     // Use the existing stop-list focus action to zoom into dense stops before
  51 |     // tapping; their touch targets can overlap at a whole-journey overview.
  52 |     await page.locator('.journey-leg details > summary').first().click();
  53 |     await page.locator('.journey-leg details').getByRole('button', { name, exact: true }).click();
  54 |     await expect(page.locator('.leaflet-popup-content')).toContainText(name);
  55 |     await page.locator('.leaflet-popup-close-button').click();
  56 |     await dot.tap({ position: { x: 22, y: 22 } });
  57 |     await expect(page.locator('.leaflet-popup-content')).toContainText(name);
  58 |     await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  59 |     await page.getByRole('button', { name: 'Reset', exact: true }).click();
  60 |     await expect(page.locator('.stop-marker,.leaflet-tooltip,.leaflet-popup')).toHaveCount(0);
  61 |   });
  62 | });
  63 | 
```