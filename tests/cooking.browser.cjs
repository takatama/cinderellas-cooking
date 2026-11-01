const {assetUrl,assetPattern}=require('./assets.cjs');
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{
for(const [width,height] of [[1280,900],[1000,900],[760,900],[690,900],[390,740],[320,740],[390,420]]){
const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');
const cases=await page.evaluate(()=>Journey.recipes.flatMap((r,chapter)=>{
const seen=new Set();return Array.from({length:8},(_,bits)=>r.pairs.map((p,i)=>p[(bits>>(2-i))&1])).flatMap(items=>{const dish=Journey.dishFor(items,chapter);if(seen.has(dish))return [];seen.add(dish);return [{chapter,items,dish}];});
}));
assert.equal(cases.length,16);
for(const c of cases){
await page.evaluate(c=>{state=initialState();state.chapter=c.chapter;start();for(const pair of state.round)choose(pair.options.find(x=>c.items.includes(x)));},c);
assert.equal(await page.locator('#stage-object img').count(),0,'no cookware or completed dish during selection');
await page.evaluate(()=>{cook();pauseCooking();});
assert.equal(await page.evaluate(()=>state.dish),c.dish);
for(let step=0;step<4;step++){
await page.evaluate(step=>{cookingStep=step;updateCookingControls();},step);
await page.locator('#stage-object img').evaluate(i=>i.decode());
const status=await page.evaluate(()=>{
const f=CookingArt.stageFor(state.dish,cookingStep),c=$('table-plane').getBoundingClientRect(),o=$('stage-object').getBoundingClientRect();
return {vessel:$('stage-object').dataset.vessel,expected:f.vessel,src:document.querySelector('#stage-object img').getAttribute('src'),file:CookingArt.vessels[f.vessel].file,steam:$('steam').classList.contains('active'),oil:!$('oil-bubbles').hidden,effect:f.effect,food:$('stage-object').dataset.food,inside:o.x>=c.x-1&&o.right<=c.right+1&&o.y>=c.y-1&&o.bottom<=c.bottom+1,overflow:document.documentElement.scrollWidth>innerWidth,advance:$('advance').getBoundingClientRect().y+scrollY};});
assert.equal(status.vessel,status.expected);assert.equal(status.src,assetUrl(status.file));assert.equal(status.steam,status.effect==='steam');assert.equal(status.oil,status.effect==='oil');assert.equal(status.food,'お料理中');assert.equal(status.inside,true,`${width}px ${c.dish} step ${step}`);assert.equal(status.overflow,false);
assert.equal(await page.getByRole('button',{name:'できた料理を見る',exact:true}).isDisabled(),step<3);
if(step===3){await page.getByRole('button',{name:'できた料理を見る',exact:true}).click();assert.equal(await page.locator('#stage-object').getAttribute('data-food'),c.dish);assert.equal(await page.locator('#stage-object .cookware-art').count(),0);assert.equal(await page.locator('#oil-bubbles').isVisible(),false);assert.equal(await page.evaluate(()=>Math.abs($('advance').getBoundingClientRect().y+scrollY)),Math.abs(status.advance));}
}
}
await page.evaluate(()=>{state.chapter=1;state.phase='cooking';state.items=['ひき肉','パン粉','玉ねぎ'];state.dish='ハンバーグ';state.round=Journey.createRound(1).map(r=>({...r,options:r.options}));state.items=state.round.map(r=>r.options.find(x=>['ひき肉','パン粉','玉ねぎ'].includes(x)));state.step=2;cookingStep=1;render();saveProgress();});
await page.reload();await page.waitForTimeout(330);await page.getByRole('button',{name:'つづきから遊ぶ',exact:true}).click();await page.evaluate(()=>pauseCooking());
assert.equal(await page.locator('#stage-object').getAttribute('data-vessel'),'pan');
await page.evaluate(()=>move('final-cooking'));
assert.equal(await page.locator('#stage-object').textContent(),'');assert.equal(await page.locator('#stage-object img').count(),0);assert.equal(await page.locator('#steam').isVisible(),false);assert.equal(await page.locator('.magic-oven').isVisible(),true);
assert.deepEqual(errors,[]);console.log(`PASS ${width}x${height}: all 16 dishes, 4 stages, reveal, resume, oven`);await page.close();
}
const page=await browser.newPage({viewport:{width:390,height:740}});await page.route(assetPattern('frying-pan.png'),r=>r.abort());await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');
await page.evaluate(()=>{state.chapter=1;state.phase='cooking';state.dish='ハンバーグ';cookingStep=1;render();});await page.waitForTimeout(100);
assert.match(await page.locator('#stage-object').textContent(),/フライパン/);
await page.evaluate(()=>{cookingStep=3;updateCookingControls();});assert.equal(await page.getByRole('button',{name:'できた料理を見る',exact:true}).isEnabled(),true);
await page.close();console.log('PASS missing pan: text fallback and reveal remain available');
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
