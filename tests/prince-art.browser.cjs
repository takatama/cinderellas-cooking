const {assetUrl,assetPattern,settleImages}=require('./assets.cjs');
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{
for(const width of [1280,1000,760,690,390,320]){
const page=await browser.newPage({viewport:{width,height:width===1280?720:900},reducedMotion:'reduce'}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');
await page.evaluate(()=>move('prince'));await settleImages(page);
assert.equal(await page.locator('#prince-normal').isVisible(),true);
assert.equal(await page.locator('#journey-art').isVisible(),false);
assert.equal(await page.locator('#help-scene').getAttribute('src'),assetUrl('help-characters.png'));
assert.equal(await page.locator('#help-scene').evaluate(i=>i.classList.contains('cinderella-only')),true);
assert.equal(await page.locator('#stage-object').textContent(),'');
await page.evaluate(()=>start());
for(let step=0;step<3;step++){
assert.equal(await page.locator('.choices img').count(),2);
await page.locator('.choices img').evaluateAll(imgs=>Promise.all(imgs.map(img=>img.decode())));
await page.evaluate(()=>choose(state.round[state.step].options[0]));
}
await page.locator('#table-ingredients img').evaluateAll(imgs=>Promise.all(imgs.map(img=>img.decode())));
assert.equal(await page.locator('#table-ingredients img').count(),3);
await page.reload();await page.waitForTimeout(350);
await page.getByRole('button',{name:'つづきから遊ぶ',exact:true}).click();
assert.equal(await page.locator('#table-ingredients img').count(),3);
for(const dish of ['アマトリチャーナ','カルボナーラ']){
await page.evaluate(dish=>{start();for(const pair of state.round){choose(pair.options[0]);}state.phase='result';state.dish=dish;render();},dish);await settleImages(page);
const mood=dish==='アマトリチャーナ'?'delighted':'pleased';
assert.equal(await page.locator('#prince-'+mood).isVisible(),true);
assert.equal(await page.locator('#prince-'+(mood==='pleased'?'delighted':'pleased')).isVisible(),false);
assert.equal(await page.locator('#prince-normal').isVisible(),true);
assert.equal(await page.locator('#sister-delighted').isVisible(),false);
const bounds=await page.evaluate(()=>{const c=$('scene-canvas').getBoundingClientRect(),m=$('prince-normal').getBoundingClientRect();return {inside:m.x>=c.x&&m.right<=c.right&&m.y>=c.y&&m.bottom<=c.bottom,overflow:document.documentElement.scrollWidth>innerWidth};});
assert.equal(bounds.inside,true);assert.equal(bounds.overflow,false);
await page.evaluate(()=>start());
assert.equal(await page.locator('#prince-delighted').isVisible(),false);
assert.equal(await page.locator('#prince-pleased').isVisible(),false);
}
await page.evaluate(()=>move('castle'));
assert.equal(await page.locator('#prince-normal').isVisible(),false);
await page.evaluate(()=>restartStory());
assert.equal(await page.locator('#help-scene').evaluate(i=>i.classList.contains('cinderella-only')),false);
assert.deepEqual(errors,[]);await page.close();console.log(`PASS prince layers, expressions, retry, exit, ${width}px`);
}
for(const file of ['prince.png','prince-delighted.png','prince-pleased.png','help-characters.png']){
const page=await browser.newPage();await page.route(assetPattern(file),r=>r.abort());
await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');
await page.evaluate(()=>move('prince'));await settleImages(page);await settleImages(page);
if(file==='prince.png'||file==='help-characters.png')assert.equal(await page.locator('#journey-art').isVisible(),true);
else{await page.evaluate(file=>{state.phase='result';state.dish=file==='prince-delighted.png'?'アマトリチャーナ':'カルボナーラ';render();},file);await settleImages(page);assert.equal(await page.locator('#prince-normal').isVisible(),true);}
assert.ok(await page.locator('#actions button, #advance button').count()>0);await page.close();console.log(`PASS missing ${file}`);
}
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
