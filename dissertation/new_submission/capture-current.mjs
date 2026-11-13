import {chromium} from '../../frontend/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const root=new URL('./',import.meta.url);
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const records=[];
try {
 await page.goto('http://127.0.0.1:5173/');
 await page.getByRole('button',{name:'Find Routes',exact:true}).click();
 records.push({id:'UI01',actual:await page.locator('.result').innerText()});
 await page.locator('.result').screenshot({path:new URL('validation.png',root).pathname.replace(/^\/(\w:)/,'$1')});
 for(const [index,name] of [[0,'direct'],[1,'transfer']]) {
  await page.locator('.example-buttons button').nth(index).click();
  await page.waitForTimeout(1200);
  const actual=await page.locator('.result').innerText();
  records.push({id:name,actual,markers:await page.locator('.stop-marker').count(),loadedTiles:await page.locator('.leaflet-tile-loaded').count()});
  await page.locator('.result').screenshot({path:new URL(name+'.png',root).pathname.replace(/^\/(\w:)/,'$1')});
  if(name==='transfer')await page.screenshot({path:new URL('map.png',root).pathname.replace(/^\/(\w:)/,'$1'),fullPage:true});
 }
 await page.setViewportSize({width:390,height:844});
 records.push({id:'mobile',overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
 await page.locator('.result').screenshot({path:new URL('mobile.png',root).pathname.replace(/^\/(\w:)/,'$1')});
} finally {
 fs.writeFileSync(new URL('capture-observations.json',root),JSON.stringify({date:'2026-11-12',network:'No interception; real application. No physical GPS or participant study.',records},null,2));
 await browser.close();
}
