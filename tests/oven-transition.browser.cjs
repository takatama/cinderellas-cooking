const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try {
for(const [width,reducedMotion] of [[1280,'no-preference'],[390,'no-preference'],[320,'reduce']]) {
 const page=await browser.newPage({viewport:{width,height:800},reducedMotion});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');
 await page.evaluate(()=>{state.chapter=2;state.orange=state.pink=true;move('final-cooking');});
 await page.waitForTimeout(500);
 assert.equal(await page.evaluate(()=>state.phase),'final-cooking');
 assert.equal(await page.locator('.oven-transition').count(),1);
 if(width===1280){
  await page.getByRole('button',{name:'⚙ 設定',exact:true}).click();
  const time=await page.evaluate(()=>document.querySelector('.oven-transition-white').getAnimations()[0].currentTime);
  await page.waitForTimeout(700);
  assert.equal(await page.evaluate(()=>state.phase),'final-cooking');
  assert.ok(Math.abs(await page.evaluate(()=>document.querySelector('.oven-transition-white').getAnimations()[0].currentTime)-time)<30);
  await page.getByRole('button',{name:'閉じる',exact:true}).click();
 }
 await page.evaluate(()=>{
  window.ovenSwitches=[];
  const original=ovenTransition.sync;
  ovenTransition.sync=()=>{
   if(state.phase==='final-result') window.ovenSwitches.push(Number(getComputedStyle(document.querySelector('.oven-transition-white')).opacity));
   original();
  };
 });
 await page.waitForFunction(()=>state.phase==='final-result');
 assert.ok(await page.evaluate(()=>ovenSwitches.includes(1)),'scene switches under a fully opaque white veil');
 await page.waitForFunction(()=>!document.querySelector('.oven-transition'));
 assert.equal(await page.locator('[data-finale="tasting"]').count(),1);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.evaluate(()=>move('final-cooking'));
 await page.reload();
 await page.waitForTimeout(350);
 await page.getByRole('button',{name:'つづきから遊ぶ',exact:true}).click();
 await page.waitForFunction(()=>state.phase==='final-cooking');
 await page.waitForFunction(()=>state.phase==='final-result');
 await page.waitForFunction(()=>!document.querySelector('.oven-transition'));
 await page.evaluate(()=>{move('final-cooking');restartStory();});
 await page.waitForTimeout(4500);
 assert.equal(await page.evaluate(()=>state.phase),'intro');
 assert.equal(await page.locator('.oven-transition').count(),0);
 assert.deepEqual(errors,[]);
 await page.close();console.log(`PASS ${width}px ${reducedMotion}: automatic white reveal, save/resume, restart cleanup`);
}
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
