const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{
for(const [width,height] of [[1280,900],[390,740],[320,740]]){
const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');
await page.evaluate(()=>Promise.all(['help-scene','mother-normal','mother-delighted','mother-pleased'].map(id=>$(id).decode())));
await page.evaluate(()=>move('mother'));assert.equal(await page.locator('#stage-object img').count(),0);
for(let bits=0;bits<8;bits++){
const dish=await page.evaluate(bits=>{start();const wanted=Journey.recipes[1].pairs.map((p,i)=>p[(bits>>(2-i))&1]);for(const pair of state.round)choose(pair.options.find(x=>wanted.includes(x)));return Journey.dishFor(state.items,1);},bits);
assert.equal(await page.locator('#stage-object img').count(),0);
await page.evaluate(()=>{cook();pauseCooking();cookingStep=3;updateCookingControls();});
assert.equal(await page.locator('#stage-object').getAttribute('data-food'),'お料理中');
await page.getByRole('button',{name:'できた料理を見る',exact:true}).click();
await page.locator('#stage-object img').evaluate(i=>i.decode());
assert.equal(await page.locator('#stage-object img').getAttribute('alt'),dish);
assert.equal(await page.locator('#stage-object .food-card').count(),0);
const geometry=await page.evaluate(()=>{const c=$('table-plane').getBoundingClientRect(),p=$('stage-object').getBoundingClientRect();return {inside:p.x>=c.x-1&&p.right<=c.right+1&&p.y>=c.y-1&&p.bottom<=c.bottom+1,overflow:document.documentElement.scrollWidth>innerWidth};});
assert.equal(geometry.inside,true);assert.equal(geometry.overflow,false);
assert.equal(await page.locator(dish==='ハンバーグ'?'#mother-delighted':'#mother-pleased').isVisible(),true);
if(process.env.SCREENSHOTS)await page.screenshot({path:`${process.env.SCREENSHOTS}/mother-${width}-${bits}.png`,fullPage:true});
}
await page.reload();await page.waitForTimeout(330);await page.getByRole('button',{name:'つづきから遊ぶ',exact:true}).click();await page.locator('#stage-object img').evaluate(i=>i.decode());
assert.equal(await page.locator('#stage-object img').getAttribute('alt'),'ポテトサラダ');
assert.deepEqual(errors,[]);await page.close();console.log(`PASS ${width}px: all 8 ingredient combinations reveal 6 image plates, correct expression, resume`);
}
const page=await browser.newPage();await page.route('**/assets/hamburg-steak.png',r=>r.abort());await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');await page.evaluate(()=>{move('mother');state.phase='result';state.dish='ハンバーグ';render();});
await page.waitForTimeout(150);assert.match(await page.locator('#stage-object').innerText(),/ハンバーグ/);assert.equal(await page.locator('#advance button').isEnabled(),true);await page.close();console.log('PASS missing hamburg image: readable fallback and continuation');
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
