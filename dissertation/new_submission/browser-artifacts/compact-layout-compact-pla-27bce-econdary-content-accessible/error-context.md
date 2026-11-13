# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: compact-layout.spec.js >> compact planner fits target viewports and keeps secondary content accessible
- Location: e2e\compact-layout.spec.js:4:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).toBeVisible() failed

Locator:  getByRole('textbox', { name: 'Your journey request' })
Expected: visible
Received: undefined

Call log:
  - Expect "toBeVisible" getByRole('textbox', { name: 'Your journey request' }) with timeout 5000ms
  - waiting for getByRole('textbox', { name: 'Your journey request' })
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
                - combobox "Origin" [ref=e42]: Thankot
              - generic [ref=e44]:
                - generic [ref=e45]:
                  - text: To
                  - generic [ref=e46]: Destination
                - combobox "Destination" [ref=e47]: Tribhuvan Airport
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
            - generic [ref=e73]: 28 stops
          - status [ref=e74]: Some map tiles could not load. Check your internet connection and reload. Journey search still works.
          - generic "Map of stops in the selected journey" [ref=e75]:
            - generic:
              - generic:
                - img:
                  - generic [ref=e76] [cursor=pointer]
              - generic:
                - 'button "Thankot: Origin" [ref=e77] [cursor=pointer]':
                  - generic [aria-hidden] [ref=e78]: O
                - 'button "Thankot Checkpost: Intermediate stop" [ref=e79] [cursor=pointer]'
                - 'button "Gurjudhara: Intermediate stop" [ref=e81] [cursor=pointer]'
                - 'button "Satungal: Intermediate stop" [ref=e83] [cursor=pointer]'
                - 'button "Balkhu Pul: Intermediate stop" [ref=e85] [cursor=pointer]'
                - 'button "Naikap: Intermediate stop" [ref=e87] [cursor=pointer]'
                - 'button "Tinthana: Intermediate stop" [ref=e89] [cursor=pointer]'
                - 'button "Dhungeadda: Intermediate stop" [ref=e91] [cursor=pointer]'
                - 'button "Kalanki: Intermediate stop" [ref=e93] [cursor=pointer]'
                - 'button "Kalanki Mandir: Intermediate stop" [ref=e95] [cursor=pointer]'
                - 'button "Ravi Bhawan: Intermediate stop" [ref=e97] [cursor=pointer]'
                - 'button "Soltimod: Intermediate stop" [ref=e99] [cursor=pointer]'
                - 'button "Kalimati: Intermediate stop" [ref=e101] [cursor=pointer]'
                - 'button "Teku: Intermediate stop" [ref=e103] [cursor=pointer]'
                - 'button "Tripureshwor: Intermediate stop" [ref=e105] [cursor=pointer]'
                - 'button "Sundhara: Intermediate stop" [ref=e107] [cursor=pointer]'
                - 'button "Ratna Park: Intermediate stop" [ref=e109] [cursor=pointer]'
                - 'button "Bhrikutimandap: Intermediate stop" [ref=e111] [cursor=pointer]'
                - 'button "Bhadrakali: Intermediate stop" [ref=e113] [cursor=pointer]'
                - 'button "Maitighar: Intermediate stop" [ref=e115] [cursor=pointer]'
                - 'button "Bijuli Bazar: Intermediate stop" [ref=e117] [cursor=pointer]'
                - 'button "New Baneshwor: Intermediate stop" [ref=e119] [cursor=pointer]'
                - 'button "Civil Hospital: Intermediate stop" [ref=e121] [cursor=pointer]'
                - 'button "Shantinagar: Intermediate stop" [ref=e123] [cursor=pointer]'
                - 'button "Tinkune Chowk: Intermediate stop" [ref=e125] [cursor=pointer]'
                - 'button "Tinkune: Intermediate stop" [ref=e127] [cursor=pointer]'
                - 'button "Sinamangal: Intermediate stop" [ref=e129] [cursor=pointer]'
                - 'button "Tribhuvan Airport: Destination" [ref=e131] [cursor=pointer]':
                  - generic [aria-hidden] [ref=e132]: D
              - generic:
                - tooltip "Thankot"
                - tooltip "Tribhuvan Airport"
            - generic:
              - generic [ref=e133]:
                - button "Zoom in" [ref=e134] [cursor=pointer]: +
                - button "Zoom out" [ref=e135] [cursor=pointer]: −
              - generic [ref=e136]:
                - link "Leaflet" [ref=e137] [cursor=pointer]:
                  - /url: https://leafletjs.com
                - text: "| ©"
                - link "OpenStreetMap" [ref=e142] [cursor=pointer]:
                  - /url: https://www.openstreetmap.org/copyright
                - text: contributors
          - generic [ref=e143]:
            - generic [ref=e144]:
              - generic [aria-hidden] [ref=e145]: O
              - text: Origin
            - generic [ref=e146]:
              - generic [aria-hidden] [ref=e147]: D
              - text: Destination
            - generic [ref=e148]:
              - generic [aria-hidden] [ref=e149]: •
              - text: Intermediate stop
            - generic [ref=e150]:
              - generic [aria-hidden] [ref=e151]: T
              - text: Transfer stop
            - generic [ref=e152]: Illustrative connection
          - group [ref=e154]:
            - generic "About this map" [ref=e155] [cursor=pointer]
      - region "Route result" [ref=e157]:
        - heading "Your journey" [level=2] [ref=e159]
        - status [ref=e160]: Direct Route found. 28 stops.
        - generic [ref=e161]:
          - heading "Direct Route" [level=3] [ref=e162]
          - generic [ref=e166]: Sajha Yatayat
        - paragraph [ref=e167]: Thankot → Tribhuvan Airport
        - generic [ref=e168]:
          - generic "Journey summary" [ref=e169]:
            - generic [ref=e170]:
              - term [ref=e171]: Estimated travel time
              - definition [ref=e172]: Approx. 65–75 min
            - generic [ref=e173]:
              - term [ref=e174]: Stops
              - definition [ref=e175]: 28 stops
            - generic [ref=e176]:
              - term [ref=e177]: Bus changes
              - definition [ref=e178]: 0 transfers
            - generic [ref=e179]:
              - term [ref=e180]: Approximate bus distance
              - definition [ref=e181]: Approx. 16.7 km
          - group [ref=e182]:
            - generic "About this estimate" [ref=e183] [cursor=pointer]
        - list [ref=e184]:
          - listitem [ref=e185]:
            - generic [ref=e186]:
              - strong [ref=e189]: Sajha Yatayat
              - generic [ref=e190]: R01_A
            - paragraph [ref=e191]: outbound · Thankot ⇄ Airport
            - generic [ref=e192]:
              - button "Board Thankot" [ref=e193] [cursor=pointer]:
                - generic [ref=e194]: Board
                - strong [ref=e195]: Thankot
              - group [ref=e196]:
                - generic "Show 26 intermediate stops" [ref=e197] [cursor=pointer]
              - button "Alight Tribhuvan Airport" [ref=e198] [cursor=pointer]:
                - generic [ref=e199]: Alight
                - strong [ref=e200]: Tribhuvan Airport
        - group [ref=e201]:
          - generic "View journey details" [ref=e202] [cursor=pointer]
      - tablist "Planner content" [ref=e203]:
        - tab "Journey Details" [selected] [ref=e204] [cursor=pointer]
        - tab "Nearby Stops" [ref=e205] [cursor=pointer]
      - tabpanel "Journey Details" [ref=e206]:
        - region [ref=e207]:
          - heading "Try an Example Journey" [level=3] [ref=e208]
          - generic [ref=e209]:
            - button "Thankot → Tribhuvan Airport" [ref=e210] [cursor=pointer]
            - button "Kapan → Balaju" [ref=e211] [cursor=pointer]
            - button "Godawari → Jamal" [ref=e212] [cursor=pointer]
        - paragraph [ref=e213]: Select a stop in your journey to focus it on the map.
      - group [ref=e214]:
        - generic "Ask Route Assistant यात्रा सहायक" [active] [ref=e215] [cursor=pointer]
        - region [ref=e220]:
          - heading "Ask Route Assistant" [level=2] [ref=e221]
          - paragraph [ref=e222]: यात्रा सहायक
          - paragraph [ref=e223]: Describe where you want to go.
          - generic [ref=e224]:
            - generic [ref=e225]: Your journey request
            - textbox "Your journey request" [ref=e226]:
              - /placeholder: I want to go from Bouddha to Kapan
            - button "Find Route" [ref=e227] [cursor=pointer]
  - contentinfo [ref=e228]:
    - generic [ref=e229]:
      - strong [ref=e230]: Kathmandu Bus Route Finder
      - paragraph [ref=e231]: A Robust Web-Based Bus Route Finder System for Kathmandu Valley
      - paragraph [ref=e232]: Based on the project dataset. Services and journey times may vary.
    - generic [ref=e233]:
      - generic [ref=e234]: Final Year Project · 2026
      - link "© OpenStreetMap contributors" [ref=e235] [cursor=pointer]:
        - /url: https://www.openstreetmap.org/copyright
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import fs from 'node:fs';
  3  | 
  4  | test('compact planner fits target viewports and keeps secondary content accessible', async ({ page }, testInfo) => {
  5  |   await page.route('https://tile.openstreetmap.org/**', route => route.abort());
  6  |   const measurements = [];
  7  |   for (const [width, height] of [[1920,1080],[1440,900],[1366,768],[768,1024],[390,844]]) {
  8  |     await page.setViewportSize({ width, height });
  9  |     await page.goto('/');
  10 |     await expect(page.locator('.assistant-form')).not.toBeVisible();
  11 |     await expect(page.locator('#panel-tourist,.tourist-card')).toHaveCount(0);
  12 |     await expect(page.locator('.map')).toBeVisible();
  13 |     await expect(page.locator('.map-empty-state')).toHaveText('Search for a journey to display the route.');
  14 |     await expect(page.locator('.map')).toHaveCount(1);
  15 |     await expect(page.locator('.map .leaflet-overlay-pane path')).toHaveCount(0);
  16 |     await page.locator('.map').evaluate(el => { el.dataset.instanceCheck = 'original'; });
  17 |     await page.screenshot({path:testInfo.outputPath(`homepage-${width}.png`),fullPage:true});
  18 |     await page.locator('.example-buttons button').first().click();
  19 |     await expect(page.locator('.map')).toHaveAttribute('data-instance-check','original');
  20 |     await expect(page.locator('.map')).toHaveCount(1);
  21 |     await expect(page.locator('.map-empty-state')).toHaveCount(0);
  22 |     await expect(page.locator('.result--journey')).toBeVisible();
  23 |     const boxes = await page.evaluate(() => {
  24 |       const rect = selector => { const r = document.querySelector(selector).getBoundingClientRect(); return {top:r.top + scrollY, left:r.left, width:r.width, height:r.height}; };
  25 |       return { search:rect('.search-card'), result:rect('.result'), map:rect('.map-card'), mapCanvas:rect('.map'), overflow:document.documentElement.scrollWidth > innerWidth };
  26 |     });
  27 |     expect(boxes.overflow).toBe(false);
  28 |     if (width > 800) {
  29 |       expect(Math.abs(boxes.search.top - boxes.map.top)).toBeLessThan(2);
  30 |       expect(boxes.search.top).toBeLessThan(height); // Main search remains in the initial viewport.
  31 |       expect(boxes.result.top).toBeGreaterThanOrEqual(boxes.map.top + boxes.map.height);
  32 |       expect(boxes.mapCanvas.height).toBeGreaterThanOrEqual(420);
  33 |       expect(boxes.mapCanvas.height).toBeLessThanOrEqual(500);
  34 |     } else {
  35 |       expect(boxes.map.top).toBeGreaterThan(boxes.search.top);
  36 |       expect(boxes.result.top).toBeGreaterThan(boxes.map.top + boxes.map.height);
  37 |       expect(boxes.mapCanvas.height).toBe(320);
  38 |     }
  39 |     const closedHeight = await page.locator('.assistant-disclosure').evaluate(el => el.offsetHeight);
  40 |     await page.locator('.assistant-disclosure > summary').click();
> 41 |     await expect(page.getByRole('textbox', {name:'Your journey request'})).toBeVisible();
     |                                                                            ^ Error: expect(locator).toBeVisible() failed
  42 |     const openHeight = await page.locator('.assistant-disclosure').evaluate(el => el.offsetHeight);
  43 |     measurements.push({width,height,...boxes,assistantClosedHeight:closedHeight,assistantExpandedHeight:openHeight,savedByCollapsingAssistant:openHeight-closedHeight});
  44 |     await page.locator('.assistant-disclosure > summary').click();
  45 |     await page.screenshot({path:testInfo.outputPath(`planner-${width}.png`),fullPage:true});
  46 | 
  47 |   }
  48 |   fs.writeFileSync(testInfo.outputPath('layout-measurements.json'), JSON.stringify(measurements,null,2));
  49 |   await page.goto('/about');
  50 |   await expect(page.getByRole('heading',{name:'About the project'})).toBeVisible();
  51 |   await page.screenshot({path:testInfo.outputPath('about.png'),fullPage:true});
  52 |   await expect(page.getByRole('combobox')).toHaveCount(0);
  53 |   await expect(page.locator('.assistant-disclosure')).toHaveCount(0);
  54 |   await page.goto('/#destinations');
  55 |   await expect(page.locator('#panel-tourist')).toHaveCount(0);
  56 |   await expect(page.locator('.map')).toBeVisible();
  57 | });
  58 | 
```