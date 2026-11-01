// Regression: dishes must stay on the painting, not in the empty frame below it.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});try{
const page=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');await page.locator('#scene').evaluate(img=>img.decode());
await page.evaluate(()=>{state=initialState();start();for(const pair of state.round)choose(pair.options.find(x=>['豚肉','じゃがいも','カレールー'].includes(x)));});
for(const [width,height] of [[1280,900],[1000,900],[760,900],[690,900],[390,740],[320,740],[320,900],[390,420],[1280,720],[1280,900]]){
await page.setViewportSize({width,height});await page.waitForTimeout(80);
const measure=()=>page.evaluate(()=>{const rect=id=>{const r=$(id).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right};};return {art:rect('art'),canvas:rect('scene-canvas'),plane:rect('table-plane'),object:rect('stage-object'),table:rect('table-ingredients'),advance:rect('advance'),story:document.querySelector('.story').getBoundingClientRect().height,overflow:document.documentElement.scrollWidth>innerWidth};});
let m=await measure();assert.equal(m.overflow,false);
for(const key of ['x','y','width','height'])assert.ok(Math.abs(m.canvas[key]-m.plane[key])<1,`${width}x${height}: painting/table plane ${key}`);
assert.ok(m.table.bottom<=m.canvas.bottom+1);assert.ok(m.table.y>=m.canvas.y-1);
if(width<=390&&height>=740){assert.ok(Math.abs(m.art.height-m.art.width/1.5)<1,'narrow frame fits the painting');assert.ok(Math.abs(m.art.bottom-m.canvas.bottom)<1,'no empty strip under painting');}
await page.evaluate(()=>{cook();pauseCooking();cookingStep=3;render();});await page.locator('#stage-object img').evaluate(img=>img.decode());m=await measure();
assert.ok(m.object.bottom<=m.canvas.bottom+1,`${width}: pot stays on painted worktop`);
assert.ok(m.object.y>=m.canvas.y-1);assert.ok(Math.abs((m.object.x+m.object.width/2)-(m.canvas.x+m.canvas.width/2))<1);
assert.equal(await page.locator('#stage-object').getAttribute('data-food'),'お料理中');
await page.evaluate(()=>result());await page.locator('#stage-object img').evaluate(img=>img.decode());const served=await measure();assert.ok(served.object.bottom<=served.canvas.bottom+1);assert.ok(Math.abs(served.advance.y-m.advance.y)<1,'reveal does not move controls');
if(process.env.SCREENSHOTS)await page.screenshot({path:`${process.env.SCREENSHOTS}/scene-${width}x${height}.png`,fullPage:true});
await page.evaluate(()=>{state.phase='ready';render();});console.log(`PASS ${width}x${height}: painted frame, ingredients, covered pot, reveal, stable controls`);
}
assert.deepEqual(errors,[]);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
