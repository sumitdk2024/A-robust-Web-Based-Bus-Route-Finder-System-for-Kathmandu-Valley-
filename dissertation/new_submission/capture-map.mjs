import {chromium} from '../../frontend/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const b=await chromium.launch({channel:'chrome',headless:true});
try {
 const p=await b.newPage({viewport:{width:1440,height:1000}});
 await p.goto('http://127.0.0.1:5173/');
 await p.locator('.example-buttons button').nth(1).click();
 await p.locator('.map').scrollIntoViewIfNeeded();
 await p.waitForTimeout(1800);
 await p.locator('.map-card').screenshot({path:fileURLToPath(new URL('map-panel.png',import.meta.url))});
 fs.writeFileSync(new URL('map-observation.json',import.meta.url),JSON.stringify({date:'2026-11-12',network:'No interception; native element screenshot',loadedTiles:await p.locator('.leaflet-tile-loaded').count(),markers:await p.locator('.stop-marker').count()},null,2));
}finally{await b.close();}
