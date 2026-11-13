# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ai-assistant.spec.js >> simple endpoint requests work without preference controls or explanations
- Location: e2e\ai-assistant.spec.js:12:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Find Route', exact: true })
    - locator resolved to <button class="primary-button">Find Route</button>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed

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
                - combobox "Origin" [ref=e44]: Bouddha Stupa
              - generic [ref=e46]:
                - generic [ref=e47]:
                  - text: To
                  - generic [ref=e48]: Destination
                - combobox "Destination" [ref=e49]: Kapan
            - status [ref=e50]: Select a bus stop from the suggestions.
            - generic [ref=e51]:
              - button "Find Routes" [ref=e52] [cursor=pointer]
              - button "Use my location" [ref=e55] [cursor=pointer]
              - button "Swap origin and destination" [ref=e60] [cursor=pointer]
              - button "Reset" [ref=e63] [cursor=pointer]
          - region [ref=e64]:
            - generic [ref=e65]:
              - generic [ref=e66]:
                - heading "My Places" [level=3] [ref=e67]
                - paragraph [ref=e68]: मेरो स्थानहरू
              - button "+ Add place" [ref=e69] [cursor=pointer]
            - paragraph [ref=e70]: Save a bus stop or address for faster journey searches.
        - region [ref=e71]:
          - generic [ref=e72]:
            - heading "Route Map" [level=2] [ref=e74]
            - generic [ref=e75]: 0 stops
          - paragraph [ref=e76]: Search for a journey to display the route.
          - status [ref=e77]: Some map tiles could not load. Check your internet connection and reload. Journey search still works.
          - generic "Kathmandu map; select a journey to display stops" [ref=e78]:
            - generic:
              - generic [ref=e79]:
                - button "Zoom in" [ref=e80] [cursor=pointer]: +
                - button "Zoom out" [ref=e81] [cursor=pointer]: −
              - generic [ref=e82]:
                - link "Leaflet" [ref=e83] [cursor=pointer]:
                  - /url: https://leafletjs.com
                - text: "| ©"
                - link "OpenStreetMap" [ref=e88] [cursor=pointer]:
                  - /url: https://www.openstreetmap.org/copyright
                - text: contributors
          - group [ref=e89]:
            - generic "About this map" [ref=e90] [cursor=pointer]
      - region "Route result" [ref=e92]:
        - heading "Ready when you are" [level=2] [ref=e99]
        - status [ref=e100]: Search for a journey to get started.
      - tablist "Planner content" [ref=e101]:
        - tab "Journey Details" [selected] [ref=e102] [cursor=pointer]
        - tab "Nearby Stops" [ref=e103] [cursor=pointer]
      - tabpanel "Journey Details" [ref=e104]:
        - region [ref=e105]:
          - heading "Try an Example Journey" [level=3] [ref=e106]
          - generic [ref=e107]:
            - button "Thankot → Tribhuvan Airport" [ref=e108] [cursor=pointer]
            - button "Kapan → Balaju" [ref=e109] [cursor=pointer]
            - button "Godawari → Jamal" [ref=e110] [cursor=pointer]
        - paragraph [ref=e111]: Select a stop in your journey to focus it on the map.
      - group [ref=e112]:
        - generic "Ask Route Assistant यात्रा सहायक" [ref=e113] [cursor=pointer]
        - region [ref=e118]:
          - heading "Ask Route Assistant" [level=2] [ref=e119]
          - paragraph [ref=e120]: यात्रा सहायक
          - paragraph [ref=e121]: Describe where you want to go.
          - generic [ref=e122]:
            - generic [ref=e123]: Your journey request
            - textbox "Your journey request" [active] [ref=e124]:
              - /placeholder: I want to go from Bouddha to Kapan
              - text: Find a route from Thankot to Airport
            - button "Find Route" [ref=e125] [cursor=pointer]
  - contentinfo [ref=e126]:
    - generic [ref=e127]:
      - strong [ref=e128]: Kathmandu Bus Route Finder
      - paragraph [ref=e129]: A Robust Web-Based Bus Route Finder System for Kathmandu Valley
      - paragraph [ref=e130]: Based on the project dataset. Services and journey times may vary.
    - generic [ref=e131]:
      - generic [ref=e132]: Final Year Project · 2026
      - link "© OpenStreetMap contributors" [ref=e133] [cursor=pointer]:
        - /url: https://www.openstreetmap.org/copyright
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { stopsById } from '../src/data/network.js';
  3   | import { parseJourneyIntentLocal, recommendJourney } from '../src/services/aiJourneyAssistant.js';
  4   | 
  5   | test.beforeEach(async ({page}) => { await page.route('**/api/walking-route', route => route.fulfill({status:503,json:{message:'Walking directions unavailable'}}));
  6   |   await page.route('https://tile.openstreetmap.org/**',route=>route.abort()); await page.goto('/'); await page.locator('.assistant-disclosure > summary').click(); });
  7   | async function ask(page,message) {
  8   |  await page.getByRole('textbox',{name:'Your journey request'}).fill(message);
> 9   |  await page.getByRole('button',{name:'Find Route',exact:true}).click();
      |                                                                ^ Error: locator.click: Test timeout of 30000ms exceeded.
  10  | }
  11  | 
  12  | test('simple endpoint requests work without preference controls or explanations', async ({page}) => {
  13  |  for (const query of ['I want to go from Bouddha to Kapan','Find a route from Thankot to Airport','Take me from Lagankhel to Balaju']) {
  14  |   await ask(page,query);
  15  |   await expect(page.locator('.result--journey')).toBeVisible();
  16  |   await expect(page.locator('.recommendation-card')).toContainText('Estimated travel time:');
  17  |   await expect(page.locator('.recommendation-explanation')).toHaveCount(0);
  18  |   await expect(page.getByRole('button',{name:/^(Fastest|Fewer transfers|Less walking)$/})).toHaveCount(0);
  19  |   await expect(page.getByText('More journey options',{exact:true})).toHaveCount(0);
  20  |   await expect(page.getByRole('button',{name:/^(Fastest|Fewer transfers|Less walking)$/})).toHaveCount(0);
  21  |   await expect(page.locator('.assistant-disclosure')).not.toContainText(/Balanced|Shortest estimated time|Recommended because/);
  22  |  }
  23  |  const expected=await page.locator('#recommendation-title').innerText();
  24  |  await ask(page,'Take me from Lagankhel to Balaju');
  25  |  await expect(page.locator('#recommendation-title')).toHaveText(expected);
  26  |  await page.getByRole('button',{name:'View Journey',exact:true}).click();
  27  |  await expect(page.locator('.result')).toBeFocused();
  28  |  await expect(page.locator('.stop-marker.stop-marker--origin')).toHaveCount(1);
  29  |  await expect(page.locator('.stop-marker.stop-marker--destination')).toHaveCount(1);
  30  | });
  31  | 
  32  | test('natural language bus routes and missing origin/unknown destination', async ({page}) => {
  33  |  await ask(page,'Take me from Kapan to Boudha with the fewest transfers');
  34  |  await expect(page.getByRole('combobox',{name:'Origin',exact:true})).toHaveValue('Kapan');
  35  |  await expect(page.getByRole('combobox',{name:'Destination',exact:true})).toHaveValue('Bouddha Stupa');
  36  |  await expect(page.locator('.result')).toContainText('found.');
  37  |  await ask(page,'Go from Thankot to the airport');
  38  |  await expect(page.getByRole('heading',{name:'Direct Route',exact:true})).toBeVisible();
  39  |  await ask(page,'Find a route from Kapan to Balaju');
  40  |  await expect(page.locator('.journey-endpoints')).toContainText('Balaju');
  41  |  await ask(page,'I want the route with the least walking to Balaju');
  42  |  await expect(page.locator('.assistant-status')).toContainText('please select your starting point');
  43  |  await expect(page.locator('.result')).not.toContainText('found.');
  44  |  await ask(page,'Take me from Kapan to Mars');
  45  |  await expect(page.locator('.assistant-status')).toContainText('could not match that destination');
  46  |  await expect(page.locator('.stop-marker')).toHaveCount(0);
  47  | });
  48  | 
  49  | test('bus-stop clarification automatically continues and Bhaktapur uses the main stop', async ({page}) => {
  50  |  await ask(page,'Fastest route from Lagankhel to Bhaktapur');
  51  |  await expect(page.getByRole('combobox',{name:'Destination',exact:true})).toHaveValue('Koteshwor Bhaktapur Stop');
  52  |  await expect(page.locator('.result')).toContainText('found.');
  53  |  await expect(page.locator('.recommendation-explanation')).toHaveCount(0);
  54  |  await page.getByRole('button',{name:'View Journey',exact:true}).click();
  55  |  await expect(page.locator('.result')).toBeFocused();
  56  |  await ask(page,'Find a route from Kapan to Baneshwor');
  57  |  await expect(page.locator('.intent-suggestions')).toContainText('Did you mean?');
  58  |  await expect(page.locator('.intent-suggestions small')).toHaveText(['Bus stop','Bus stop']);
  59  |  await expect(page.locator('.result')).not.toContainText('found.');
  60  |  await page.locator('.intent-suggestions button').filter({hasText:'New Baneshwor'}).click();
  61  |  await expect(page.locator('.result')).toContainText('found.');
  62  |  await expect(page.getByRole('button',{name:'Use interpreted journey',exact:true})).toHaveCount(0);
  63  |  await expect(page.locator('.understood,.developer-details')).toHaveCount(0);
  64  |  await expect(page.locator('#recommendation-title')).toContainText('New Baneshwor');
  65  |  await ask(page,'Find a route from Kapan to Narayanhiti Palace Museum');
  66  |  await expect(page.locator('.assistant-status')).toContainText('could not match that destination');
  67  |  await expect(page.locator('.recommendation-card')).toHaveCount(0);
  68  | });
  69  | 
  70  | test('location assistant and normal location search compare starts deterministically and show one recommendation', async ({page,context}) => {
  71  |  const point=stopsById.baluwatar;
  72  |  await context.grantPermissions(['geolocation']);
  73  |  await context.setGeolocation({latitude:point.latitude,longitude:point.longitude,accuracy:10});
  74  |  const query='I am near Baluwatar and want to go to Ratna Park';
  75  |  await ask(page,query);
  76  |  await expect(page.locator('.recommendation-card')).toHaveCount(1);
  77  |  await expect(page.locator('.recommendation-options,.journey-alternatives')).toHaveCount(0);
  78  |  await expect(page.locator('.walking-segment').first()).toContainText('Your location');
  79  | 
  80  |  const expected=recommendJourney(parseJourneyIntentLocal(query),{location:point});
  81  |  await expect(page.getByRole('combobox',{name:'Origin',exact:true})).toHaveValue(expected.selected.origin.name);
  82  |  for(const width of [375,768,1280]) {
  83  |   await page.setViewportSize({width,height:900});
  84  |   await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  85  |  }
  86  |  await page.getByRole('button',{name:'Reset',exact:true}).click();
  87  |  await page.getByRole('combobox',{name:'Destination',exact:true}).fill('Tribhuvan Airport');
  88  |  await page.getByRole('option',{name:'Tribhuvan Airport',exact:true}).click();
  89  |  await page.getByRole('button',{name:'Use my location',exact:true}).click();
  90  |  await expect(page.locator('.recommendation-card')).toHaveCount(1);
  91  |  await expect(page.locator('.recommendation-options,.journey-alternatives')).toHaveCount(0);
  92  |  await expect(page.locator('.result')).toContainText('found.');
  93  | });
  94  | 
  95  | test('reset cancels an assistant location request without a stale recommendation', async ({page}) => {
  96  |  await page.addInitScript(()=>Object.defineProperty(navigator,'geolocation',{value:{getCurrentPosition:success=>{window.finishAssistantLocation=()=>success({coords:{latitude:27.7,longitude:85.3,accuracy:10}});}}}));
  97  |  await page.reload(); await page.locator('.assistant-disclosure > summary').click();
  98  |  await ask(page,'Go from my location to the airport');
  99  |  await expect(page.getByRole('button',{name:'Finding journey',exact:false})).toBeDisabled();
  100 |  await page.getByRole('button',{name:'Reset',exact:true}).click();
  101 |  await page.evaluate(()=>window.finishAssistantLocation());
  102 |  await expect(page.locator('.recommendation-card')).toHaveCount(0);
  103 |  await expect(page.getByRole('combobox',{name:'Origin',exact:true})).toHaveValue('');
  104 | });
  105 | 
  106 | 
  107 | test('travel infinitive does not hide Thankot destination', async ({page}) => {
  108 |  await ask(page,'I want to travel from kapan to Thankot');
  109 |  await expect(page.getByRole('combobox',{name:'Origin',exact:true})).toHaveValue('Kapan');
```