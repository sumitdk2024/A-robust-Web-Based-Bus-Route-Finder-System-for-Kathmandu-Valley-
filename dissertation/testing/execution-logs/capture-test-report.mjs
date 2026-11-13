import { chromium } from '../../../frontend/node_modules/playwright/index.mjs';
import { createServer } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.join(here,'browser-html-report');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.json':'application/json','.zip':'application/zip'};
const server=createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
  const page=await browser.newPage({viewport:{width:1100,height:900}});
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await page.getByText('two transfers keep segment details and map markers',{exact:true}).waitFor();
  const summary=await page.locator('body').innerText();
  await page.screenshot({path:path.join(here,'../screenshots/TR01-browser-test-report.png'),fullPage:false});
  await page.getByText('two transfers keep segment details and map markers',{exact:true}).click();
  await page.getByText('Test Steps',{exact:true}).waitFor();
  const detail=await page.locator('body').innerText();
  await page.screenshot({path:path.join(here,'../screenshots/TR02-two-transfer-test-result.png'),fullPage:false});
  fs.writeFileSync(path.join(here,'test-report-capture-observations.json'),JSON.stringify({executed:new Date().toISOString(),source:'Unmodified Playwright HTML report produced by actual suite rerun; served locally without request interception; screenshots are browser viewport captures',viewport:{width:1100,height:900},summaryText:summary,detailText:detail},null,2));
  console.log(JSON.stringify({summary:summary.slice(0,1600),detail:detail.slice(0,2400)},null,2));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
