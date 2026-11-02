const {assetUrl,assetPattern}=require('./assets.cjs');
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{
for(const [width,height] of [[1280,900],[1000,800],[760,740],[690,740],[390,740],[320,740],[1280,720],[390,420]]){
const context=await browser.newContext({viewport:{width,height}}),page=await context.newPage();
await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');
const moveTo=async phase=>{await page.evaluate(p=>{state.chapter=2;state.orange=false;state.pink=false;move(p);},phase);await page.locator('.castle-backdrop').evaluate(img=>img.decode());};
await moveTo('door');
assert.equal(await page.locator('.door-inscription').innerText(),'おえかき');
assert.equal(await page.locator('.castle-backdrop').getAttribute('src'),assetUrl('castle-door-closed.png'));
const bounds=await page.locator('.castle-scene').boundingBox();
assert.ok(bounds.x>=-1&&bounds.x+bounds.width<=width+1);
assert.ok(Math.abs(bounds.width/bounds.height-1.5)<.01);
await page.evaluate(()=>move('door-open'));await page.locator('.castle-backdrop').evaluate(img=>img.decode());
assert.equal(await page.locator('.castle-backdrop').getAttribute('src'),assetUrl('castle-door-open.png'));
assert.equal(await page.locator('.door-inscription').isVisible(),false);
await moveTo('room');
for(const [orange,pink] of [[false,false],[true,false],[false,true],[true,true]]){
await page.evaluate(([o,p])=>{state.orange=o;state.pink=p;render();},[orange,pink]);
assert.equal(await page.locator('[data-paper="orange"]').isVisible(),!orange);
assert.equal(await page.locator('[data-paper="pink"]').isVisible(),!pink);
assert.equal(await page.locator('#stage-object img').count(),0);
}
await page.evaluate(()=>{state.orange=true;state.pink=false;move('room');});
await page.reload();await page.waitForTimeout(320);await page.getByRole('button',{name:'つづきから遊ぶ',exact:true}).click();
assert.equal(await page.locator('[data-paper="orange"]').isVisible(),false);
assert.equal(await page.locator('[data-paper="pink"]').isVisible(),true);
await page.evaluate(()=>{state.orange=true;state.pink=true;move('final-cooking');});
assert.equal(await page.locator('.oven-baking').count(),1);
assert.equal(await page.locator('#stage-object img').count(),0);
assert.equal(await page.locator('#steam').isVisible(),false);
await moveTo('door');
if(process.env.SCREENSHOTS)await page.screenshot({path:`${process.env.SCREENSHOTS}/${width}-${height}-door.png`,fullPage:true});
await moveTo('room');
if(process.env.SCREENSHOTS)await page.screenshot({path:`${process.env.SCREENSHOTS}/${width}-${height}-room.png`,fullPage:true});
await page.route(assetPattern('castle-door-closed.png'),r=>r.abort());
await page.evaluate(()=>move('door-open'));await page.evaluate(()=>move('door'));
await page.waitForFunction(()=>document.querySelector('.castle-scene').dataset.loaded==='false');
assert.equal(await page.locator('.door-inscription').isVisible(),true);
for(let i=0;i<10&&await page.locator('#dialogue').getAttribute('data-more')==='true';i++)await page.locator('#advance button').click();
assert.equal(await page.getByLabel('四桁の数字').isVisible(),true);
await page.getByLabel('四桁の数字').fill('5467');await page.getByRole('button',{name:'数字を合わせる',exact:true}).click();
assert.equal(await page.evaluate(()=>state.phase),'door-open');
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
console.log(`Castle art ${width}x${height}: open/closed, papers, resume, cooking and missing image passed`);
await context.close();
}
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
