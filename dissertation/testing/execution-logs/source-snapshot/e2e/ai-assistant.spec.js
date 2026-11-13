import { test, expect } from '@playwright/test';
import { stopsById } from '../src/data/network.js';
import { parseJourneyIntentLocal, recommendJourney } from '../src/services/aiJourneyAssistant.js';

test.beforeEach(async ({page}) => { await page.route('**/api/walking-route', route => route.fulfill({status:503,json:{message:'Walking directions unavailable'}}));
  await page.route('https://tile.openstreetmap.org/**',route=>route.abort()); await page.goto('/'); await page.locator('.assistant-disclosure > summary').click(); });
async function ask(page,message) {
 await page.getByRole('textbox',{name:'Your journey request'}).fill(message);
 await page.getByRole('button',{name:'Find Route',exact:true}).click();
}

test('simple endpoint requests work without preference controls or explanations', async ({page}) => {
 for (const query of ['I want to go from Bouddha to Kapan','Find a route from Thankot to Airport','Take me from Lagankhel to Balaju']) {
  await ask(page,query);
  await expect(page.locator('.result--journey')).toBeVisible();
  await expect(page.locator('.recommendation-card')).toContainText('Estimated travel time:');
  await expect(page.locator('.recommendation-explanation')).toHaveCount(0);
  await expect(page.getByRole('button',{name:/^(Fastest|Fewer transfers|Less walking)$/})).toHaveCount(0);
  await expect(page.getByText('More journey options',{exact:true})).toHaveCount(0);
  await expect(page.getByRole('button',{name:/^(Fastest|Fewer transfers|Less walking)$/})).toHaveCount(0);
  await expect(page.locator('.assistant-disclosure')).not.toContainText(/Balanced|Shortest estimated time|Recommended because/);
 }
 const expected=await page.locator('#recommendation-title').innerText();
 await ask(page,'Take me from Lagankhel to Balaju');
 await expect(page.locator('#recommendation-title')).toHaveText(expected);
 await page.getByRole('button',{name:'View Journey',exact:true}).click();
 await expect(page.locator('.result')).toBeFocused();
 await expect(page.locator('.stop-marker.stop-marker--origin')).toHaveCount(1);
 await expect(page.locator('.stop-marker.stop-marker--destination')).toHaveCount(1);
});

test('natural language bus routes and missing origin/unknown destination', async ({page}) => {
 await ask(page,'Take me from Kapan to Boudha with the fewest transfers');
 await expect(page.getByRole('combobox',{name:'Origin',exact:true})).toHaveValue('Kapan');
 await expect(page.getByRole('combobox',{name:'Destination',exact:true})).toHaveValue('Bouddha Stupa');
 await expect(page.locator('.result')).toContainText('found.');
 await ask(page,'Go from Thankot to the airport');
 await expect(page.getByRole('heading',{name:'Direct Route',exact:true})).toBeVisible();
 await ask(page,'Find a route from Kapan to Balaju');
 await expect(page.locator('.journey-endpoints')).toContainText('Balaju');
 await ask(page,'I want the route with the least walking to Balaju');
 await expect(page.locator('.assistant-status')).toContainText('please select your starting point');
 await expect(page.locator('.result')).not.toContainText('found.');
 await ask(page,'Take me from Kapan to Mars');
 await expect(page.locator('.assistant-status')).toContainText('could not match that destination');
 await expect(page.locator('.stop-marker')).toHaveCount(0);
});

test('bus-stop clarification automatically continues and Bhaktapur uses the main stop', async ({page}) => {
 await ask(page,'Fastest route from Lagankhel to Bhaktapur');
 await expect(page.getByRole('combobox',{name:'Destination',exact:true})).toHaveValue('Koteshwor Bhaktapur Stop');
 await expect(page.locator('.result')).toContainText('found.');
 await expect(page.locator('.recommendation-explanation')).toHaveCount(0);
 await page.getByRole('button',{name:'View Journey',exact:true}).click();
 await expect(page.locator('.result')).toBeFocused();
 await ask(page,'Find a route from Kapan to Baneshwor');
 await expect(page.locator('.intent-suggestions')).toContainText('Did you mean?');
 await expect(page.locator('.intent-suggestions small')).toHaveText(['Bus stop','Bus stop']);
 await expect(page.locator('.result')).not.toContainText('found.');
 await page.locator('.intent-suggestions button').filter({hasText:'New Baneshwor'}).click();
 await expect(page.locator('.result')).toContainText('found.');
 await expect(page.getByRole('button',{name:'Use interpreted journey',exact:true})).toHaveCount(0);
 await expect(page.locator('.understood,.developer-details')).toHaveCount(0);
 await expect(page.locator('#recommendation-title')).toContainText('New Baneshwor');
 await ask(page,'Find a route from Kapan to Narayanhiti Palace Museum');
 await expect(page.locator('.assistant-status')).toContainText('could not match that destination');
 await expect(page.locator('.recommendation-card')).toHaveCount(0);
});

test('location assistant and normal location search compare starts deterministically and show one recommendation', async ({page,context}) => {
 const point=stopsById.baluwatar;
 await context.grantPermissions(['geolocation']);
 await context.setGeolocation({latitude:point.latitude,longitude:point.longitude,accuracy:10});
 const query='I am near Baluwatar and want to go to Ratna Park';
 await ask(page,query);
 await expect(page.locator('.recommendation-card')).toHaveCount(1);
 await expect(page.locator('.recommendation-options,.journey-alternatives')).toHaveCount(0);
 await expect(page.locator('.walking-segment').first()).toContainText('Your location');

 const expected=recommendJourney(parseJourneyIntentLocal(query),{location:point});
 await expect(page.getByRole('combobox',{name:'Origin',exact:true})).toHaveValue(expected.selected.origin.name);
 for(const width of [375,768,1280]) {
  await page.setViewportSize({width,height:900});
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await page.getByRole('button',{name:'Reset',exact:true}).click();
 await page.getByRole('combobox',{name:'Destination',exact:true}).fill('Tribhuvan Airport');
 await page.getByRole('option',{name:'Tribhuvan Airport',exact:true}).click();
 await page.getByRole('button',{name:'Use my location',exact:true}).click();
 await expect(page.locator('.recommendation-card')).toHaveCount(1);
 await expect(page.locator('.recommendation-options,.journey-alternatives')).toHaveCount(0);
 await expect(page.locator('.result')).toContainText('found.');
});

test('reset cancels an assistant location request without a stale recommendation', async ({page}) => {
 await page.addInitScript(()=>Object.defineProperty(navigator,'geolocation',{value:{getCurrentPosition:success=>{window.finishAssistantLocation=()=>success({coords:{latitude:27.7,longitude:85.3,accuracy:10}});}}}));
 await page.reload(); await page.locator('.assistant-disclosure > summary').click();
 await ask(page,'Go from my location to the airport');
 await expect(page.getByRole('button',{name:'Finding journey',exact:false})).toBeDisabled();
 await page.getByRole('button',{name:'Reset',exact:true}).click();
 await page.evaluate(()=>window.finishAssistantLocation());
 await expect(page.locator('.recommendation-card')).toHaveCount(0);
 await expect(page.getByRole('combobox',{name:'Origin',exact:true})).toHaveValue('');
});


test('travel infinitive does not hide Thankot destination', async ({page}) => {
 await ask(page,'I want to travel from kapan to Thankot');
 await expect(page.getByRole('combobox',{name:'Origin',exact:true})).toHaveValue('Kapan');
 await expect(page.getByRole('combobox',{name:'Destination',exact:true})).toHaveValue('Thankot');
 await expect(page.locator('.understood')).toHaveCount(0);
 await expect(page.locator('#recommendation-title')).toContainText('Thankot');
 await expect(page.locator('.result')).toContainText('found.');
});

