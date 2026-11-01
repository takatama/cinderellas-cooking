const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{
for(const width of [1280,1000,760,690,390,320]){
const page=await browser.newPage({viewport:{width,height:width===1280?720:900},reducedMotion:'reduce'}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');
await page.evaluate(()=>Promise.all(['help-scene','mother-normal','mother-delighted','mother-pleased'].map(id=>$(id).decode())));
await page.evaluate(()=>move('mother'));
assert.equal(await page.locator('#mother-normal').isVisible(),true);
assert.equal(await page.locator('#journey-art').isVisible(),false);
assert.equal(await page.locator('#help-scene').getAttribute('src'),'assets/help-characters.png');
assert.equal(await page.locator('#help-scene').evaluate(i=>i.classList.contains('cinderella-only')),true);
assert.equal(await page.locator('#stage-object').textContent(),'');
for(const dish of ['ハンバーグ','メンチカツ']){
await page.evaluate(dish=>{start();for(const pair of state.round){choose(pair.options[0]);}state.phase='result';state.dish=dish;render();},dish);
const mood=dish==='ハンバーグ'?'delighted':'pleased';
assert.equal(await page.locator('#mother-'+mood).isVisible(),true);
assert.equal(await page.locator('#mother-'+(mood==='pleased'?'delighted':'pleased')).isVisible(),false);
assert.equal(await page.locator('#mother-normal').isVisible(),true);
assert.equal(await page.locator('#sister-delighted').isVisible(),false);
const bounds=await page.evaluate(()=>{const c=$('scene-canvas').getBoundingClientRect(),m=$('mother-normal').getBoundingClientRect();return {inside:m.x>=c.x&&m.right<=c.right&&m.y>=c.y&&m.bottom<=c.bottom,overflow:document.documentElement.scrollWidth>innerWidth};});
assert.equal(bounds.inside,true);assert.equal(bounds.overflow,false);
await page.evaluate(()=>start());
assert.equal(await page.locator('#mother-delighted').isVisible(),false);
assert.equal(await page.locator('#mother-pleased').isVisible(),false);
}
await page.evaluate(()=>move('prince'));
assert.equal(await page.locator('#mother-normal').isVisible(),false);
await page.evaluate(()=>restartStory());
assert.equal(await page.locator('#help-scene').evaluate(i=>i.classList.contains('cinderella-only')),false);
assert.deepEqual(errors,[]);await page.close();console.log(`PASS mother layers, expressions, retry, exit, ${width}px`);
}
for(const file of ['mother.png','mother-delighted.png','mother-pleased.png','help-characters.png']){
const page=await browser.newPage();await page.route('**/assets/'+file,r=>r.abort());
await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');
await page.evaluate(()=>move('mother'));await page.waitForTimeout(150);
if(file==='mother.png'||file==='help-characters.png')assert.equal(await page.locator('#journey-art').isVisible(),true);
else{await page.evaluate(file=>{state.phase='result';state.dish=file==='mother-delighted.png'?'ハンバーグ':'メンチカツ';render();},file);assert.equal(await page.locator('#mother-normal').isVisible(),true);}
assert.ok(await page.locator('#actions button, #advance button').count()>0);await page.close();console.log(`PASS missing ${file}`);
}
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
