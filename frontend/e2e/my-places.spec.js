import { test, expect } from '@playwright/test';
import { stopsById } from '../src/data/network.js';

test.beforeEach(async ({page}) => {
  await page.route('https://tile.openstreetmap.org/**',route=>route.abort());
  await page.route('**/api/walking-route',route=>route.fulfill({status:503}));
  await page.goto('/');
});
async function saveStop(page,label,name) {
  await page.getByRole('button',{name:'+ Add place',exact:true}).click();
  await page.getByRole('textbox',{name:'Place label',exact:true}).fill(label);
  await page.getByRole('combobox',{name:'Search bus stop',exact:true}).fill(name);
  await page.getByRole('option',{name,exact:true}).click();
  await page.getByRole('button',{name:'Save place',exact:true}).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
}
async function saveAddress(page,label,query) {
  await page.getByRole('button',{name:'+ Add place',exact:true}).click();
  await page.getByRole('textbox',{name:'Place label',exact:true}).fill(label);
  await page.getByRole('radio',{name:'Address',exact:true}).check();
  await page.getByRole('textbox',{name:'Nepal address',exact:true}).fill(query);
  await page.getByRole('textbox',{name:'Nepal address',exact:true}).press('Enter');
  await page.locator('.address-results button').first().click();
  await expect(page.locator('.selected-address')).toContainText('Nearest supported bus stop:');
  await page.getByRole('button',{name:'Save place',exact:true}).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
}

test('save, reload, From/To, edit and delete a supported stop', async ({page},testInfo) => {
  await saveStop(page,'Home','Ratna Park');
  await expect(page.locator('.saved-place-card')).toHaveCount(1);
  await page.locator('.search-card').screenshot({path:testInfo.outputPath('saved-stop-card.png')});
  await page.reload();
  await page.getByRole('button',{name:'Use Home as origin',exact:true}).click();
  await expect(page.getByRole('combobox',{name:'Origin',exact:true})).toHaveValue('Ratna Park');
  await page.getByRole('button',{name:'Use Home as destination',exact:true}).click();
  await expect(page.getByRole('combobox',{name:'Destination',exact:true})).toHaveValue('Ratna Park');
  await page.getByRole('button',{name:'Manage Home',exact:true}).click();
  await page.getByRole('button',{name:'Edit',exact:true}).click();
  await page.getByRole('textbox',{name:'Place label',exact:true}).fill('College');
  await page.getByRole('combobox',{name:'Search bus stop',exact:true}).fill('Lagankhel');
  await page.getByRole('option',{name:'Lagankhel',exact:true}).click();
  await page.getByRole('button',{name:'Save place',exact:true}).click();
  await expect(page.getByRole('combobox',{name:'Origin',exact:true})).toHaveValue('Lagankhel');
  await page.reload();
  await expect(page.locator('.saved-place-card')).toContainText('College');
  await expect(page.locator('.saved-place-card')).toContainText('Lagankhel');
  await page.getByRole('button',{name:'Manage College',exact:true}).click();
  await page.getByRole('button',{name:'Delete',exact:true}).click();
  await expect(page.locator('.saved-place-card')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('.saved-place-card')).toHaveCount(0);
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('kathmanduBusFinder.savedPlaces')))).toEqual([]);
});

test('dialog supports Escape, focus return and invalid-stop validation', async ({page}) => {
  const add=page.getByRole('button',{name:'+ Add place',exact:true});
  await add.click();
  await expect(page.getByRole('textbox',{name:'Place label',exact:true})).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(add).toBeFocused();
  await add.click();
  await page.getByRole('textbox',{name:'Place label',exact:true}).fill('Home');
  await page.getByRole('combobox',{name:'Search bus stop',exact:true}).fill('Unsupported');
  await page.getByRole('combobox',{name:'Search bus stop',exact:true}).press('Escape');
  await page.getByRole('button',{name:'Save place',exact:true}).click();
  await expect(page.getByRole('alert')).toContainText('Please select a supported bus stop.');
});

test('addresses support origin and destination walks, swap and reset without invoking GPS', async ({page},testInfo) => {
  await page.addInitScript(()=>{
    window.gpsCalls=0;
    Object.defineProperty(navigator,'geolocation',{value:{getCurrentPosition:()=>{window.gpsCalls++;}}});
  });
  await page.reload();
  const home={displayName:'New Baneshwor, Kathmandu',latitude:stopsById.new_baneshwor.latitude+0.0001,longitude:stopsById.new_baneshwor.longitude};
  const office={displayName:'Lagankhel, Lalitpur',latitude:stopsById.lagankhel.latitude+0.0001,longitude:stopsById.lagankhel.longitude};
  await page.route('**/api/geocode',route=>route.fulfill({json:{results:[route.request().postDataJSON().query.includes('Baneshwor')?home:office]}}));
  const requests=[];
  await page.route('**/api/walking-route',route=>{
    const body=route.request().postDataJSON();requests.push(body);
    return route.fulfill({json:{geometry:{type:'LineString',coordinates:[[body.start.lon,body.start.lat],[body.start.lon+0.0002,body.start.lat+0.0002],[body.end.lon,body.end.lat]]},distanceMetres:650,durationSeconds:360}});
  });
  await saveAddress(page,'Home','New Baneshwor, Kathmandu');
  await saveAddress(page,'Office','Lagankhel, Lalitpur');
  await page.getByRole('button',{name:'Use Home as origin',exact:true}).click();
  await page.getByRole('button',{name:'Use Office as destination',exact:true}).click();
  await expect(page.getByRole('button',{name:'Find Routes',exact:true})).toBeEnabled();
  await expect(page.getByRole('combobox',{name:'Origin',exact:true})).toHaveValue('New Baneshwor');
  await expect(page.getByRole('combobox',{name:'Destination',exact:true})).toHaveValue('Lagankhel');
  await page.getByRole('button',{name:'Find Routes',exact:true}).click();
  await expect(page.locator('.result--journey')).toBeVisible();
  await expect(page.locator('.journey-endpoints')).toContainText('Home');
  await expect(page.locator('.journey-endpoints')).toContainText('Office');
  await expect(page.locator('.walking-segment')).toHaveCount(2);
  await expect(page.locator('.walking-segment--destination')).toContainText('Walk to Office');
  await expect(page.locator('.walking-segment--destination')).toContainText('~6 min walk');
  await expect(page.locator('.walking-segment--destination')).toContainText('650 m');
  await expect(page.locator('.saved-address-marker')).toHaveCount(2);
  await expect(page.locator('.user-location-marker')).toHaveCount(0);
  await page.screenshot({path:testInfo.outputPath('address-journey.png'),fullPage:true});
  expect(requests.some(body=>body.start.lat===home.latitude && body.end.lat===stopsById.new_baneshwor.latitude)).toBe(true);
  expect(requests.some(body=>body.start.lat===stopsById.lagankhel.latitude && body.end.lat===office.latitude)).toBe(true);
  await page.getByRole('button',{name:'Swap origin and destination',exact:true}).click();
  await expect(page.getByRole('button',{name:'Find Routes',exact:true})).toBeEnabled();
  await page.getByRole('button',{name:'Find Routes',exact:true}).click();
  await expect(page.locator('.journey-endpoints')).toContainText('Office');
  await expect(page.locator('.walking-segment--destination')).toContainText('Walk to Home');
  await page.getByRole('button',{name:'Reset',exact:true}).click();
  await expect(page.locator('.saved-address-marker,.saved-address-walking')).toHaveCount(0);
  await expect(page.locator('.saved-place-card')).toHaveCount(2);
  expect(await page.evaluate(()=>window.gpsCalls)).toBe(0);
  await page.reload();
  await expect(page.locator('.saved-place-card')).toHaveCount(2);
});

test('geocoding outside Nepal, missing addresses and Nepal without bus coverage show clear errors', async ({page}) => {
  await page.route('**/api/geocode',route=>{
    const query=route.request().postDataJSON().query;
    return route.fulfill(query.includes('Denmark')?{status:400}:query.includes('Missing')?{status:404}:{json:{results:[{displayName:'Pokhara, Nepal',latitude:28.2096,longitude:83.9856}]}});
  });
  await page.getByRole('button',{name:'+ Add place',exact:true}).click();
  await page.getByRole('radio',{name:'Address',exact:true}).check();
  for(const [query,message] of [['Copenhagen, Denmark','outside the supported area'],['Missing address','We could not find that address.']]) {
    await page.getByRole('textbox',{name:'Nepal address',exact:true}).fill(query);
    await page.getByRole('button',{name:'Search address',exact:true}).click();
    await expect(page.getByRole('alert')).toContainText(message);
  }
  await page.getByRole('textbox',{name:'Nepal address',exact:true}).fill('Pokhara, Nepal');
  await page.getByRole('button',{name:'Search address',exact:true}).click();
  await page.locator('.address-results button').click();
  await expect(page.getByRole('alert')).toContainText('No supported bus stop was found near this address.');
  await expect(page.locator('.saved-place-card')).toHaveCount(0);
});

test('saved addresses retain the clearly labelled walking fallback', async ({page}) => {
  const point=stopsById.new_baneshwor;
  await page.route('**/api/geocode',route=>route.fulfill({json:{results:[{displayName:'New Baneshwor, Kathmandu',latitude:point.latitude+0.0001,longitude:point.longitude}]}}));
  await saveAddress(page,'Home','New Baneshwor, Kathmandu');
  await page.getByRole('button',{name:'Use Home as origin',exact:true}).click();
  await page.getByRole('combobox',{name:'Destination',exact:true}).fill('Kapan');
  await page.getByRole('option',{name:'Kapan',exact:true}).click();
  await page.getByRole('button',{name:'Find Routes',exact:true}).click();
  await expect(page.locator('.walking-segment')).toContainText('Approximate walking estimate');
  await expect(page.locator('.saved-address-walking')).toHaveCount(1);
  await expect(page.locator('.map-caption')).toContainText('approximate');
});

test('saved-place limit and storage quota failures are handled without losing manual search', async ({page}) => {
  await page.addInitScript(()=>{
    localStorage.setItem('kathmanduBusFinder.savedPlaces',JSON.stringify(Array.from({length:10},(_,i)=>({id:`p${i}`,label:`Place ${i}`,type:'bus_stop',stopId:'ratnapark'}))));
  });
  await page.reload();
  await page.getByRole('button',{name:'+ Add place',exact:true}).click();
  await expect(page.getByRole('alert')).toHaveText('You can save up to 10 places.');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('quota failure leaves the dialog open and the entered place intact', async ({page}) => {
  await page.addInitScript(()=>{Storage.prototype.setItem=()=>{throw new DOMException('quota','QuotaExceededError');};});
  await page.reload();
  await page.getByRole('button',{name:'+ Add place',exact:true}).click();
  await page.getByRole('textbox',{name:'Place label',exact:true}).fill('Home');
  await page.getByRole('combobox',{name:'Search bus stop',exact:true}).fill('Ratna Park');
  await page.getByRole('option',{name:'Ratna Park',exact:true}).click();
  await page.getByRole('button',{name:'Save place',exact:true}).click();
  await expect(page.getByRole('alert')).toHaveText('Unable to save this place.');
  await expect(page.getByRole('textbox',{name:'Place label',exact:true})).toHaveValue('Home');
});

test('GPS remains separate and does not add the current location to saved places', async ({page,context}) => {
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({latitude:stopsById.thankot.latitude,longitude:stopsById.thankot.longitude});
  await saveStop(page,'College','Lagankhel');
  await page.getByRole('button',{name:'Use my location',exact:true}).click();
  await expect(page.getByRole('combobox',{name:'Origin',exact:true})).toHaveValue('Thankot');
  await expect(page.locator('.user-location-marker')).toHaveCount(1);
  await expect(page.locator('.saved-place-card')).toHaveCount(1);
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('kathmanduBusFinder.savedPlaces')));
  expect(saved.map(place=>place.label)).toEqual(['College']);
  await page.getByRole('button',{name:'Use College as destination',exact:true}).click();
  await page.getByRole('button',{name:'Find Routes',exact:true}).click();
  await expect(page.locator('.result--journey')).toBeVisible();
});

test('saved-place cards and the dialog fit a phone viewport', async ({page},testInfo) => {
  await page.setViewportSize({width:390,height:844});
  await saveStop(page,'College','Lagankhel');
  await page.locator('.search-card').screenshot({path:testInfo.outputPath('my-places-mobile.png')});
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('button',{name:'+ Add place',exact:true}).click();
  await expect.poll(()=>page.getByRole('dialog').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await page.screenshot({path:testInfo.outputPath('place-dialog-mobile.png')});
  await page.keyboard.press('Escape');
});
