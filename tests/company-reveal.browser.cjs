const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{
 for(const [width,reducedMotion] of [[1280,'no-preference'],[390,'no-preference'],[320,'reduce']]){
  const page=await browser.newPage({viewport:{width,height:850},reducedMotion});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');
  await page.evaluate(()=>{state.chapter=2;state.storyStep=0;move('ending');});
  while(await page.locator('#dialogue').getAttribute('data-more')==='true')await page.getByRole('button',{name:'つづきへ',exact:true}).click();
  await page.getByRole('button',{name:'つづきへ',exact:true}).click();
  assert.equal(await page.evaluate(()=>state.storyStep),1);
  await page.waitForFunction(()=>document.querySelector('[data-finale="company"]').dataset.tableau!=='loading');
  assert.equal(await page.locator('.company-reveal-light').count(),1);
  assert.equal(await page.locator('.company-sunray').count(),reducedMotion==='reduce'?0:1);
  if(width===1280){
   await page.waitForTimeout(1000);await page.screenshot({path:'/tmp/cinderella-company-reveal.png'});
   await page.getByRole('button',{name:'⚙ 設定',exact:true}).click();
   const time=await page.locator('[data-finale="company"]').evaluate(el=>el.getAnimations()[0].currentTime);
   await page.waitForTimeout(400);
   assert.equal(await page.locator('[data-finale="company"]').evaluate(el=>el.getAnimations()[0].currentTime),time);
   await page.getByRole('button',{name:'閉じる',exact:true}).click();
  }
  await page.waitForFunction(()=>!document.querySelector('.company-reveal-light'));
  assert.equal(await page.locator('.company-tableau').isVisible(),true);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.reload();await page.waitForTimeout(350);await page.getByRole('button',{name:'つづきから遊ぶ',exact:true}).click();
  assert.equal(await page.evaluate(()=>state.storyStep),1);
  assert.equal(await page.locator('.company-reveal-light').count(),0,'saved company scene does not replay');
  await page.evaluate(()=>{state.storyStep=0;render();state.storyStep=1;render();state.storyStep=2;render();});
  assert.equal(await page.locator('.company-reveal-light').count(),0,'next scene cancels the effect');
  assert.equal(await page.locator('[data-finale="mail-order"]').count(),1);
  assert.deepEqual(errors,[]);await page.close();console.log(`PASS company ${width}px ${reducedMotion}: arrival, pause, save, next-scene cleanup`);
 }
 // A failed approved painting still reveals the existing fallback and leaves controls usable.
 const page=await browser.newPage();await page.route('**/assets/company-ceo*',r=>r.abort());await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');
 await page.evaluate(()=>{state.chapter=2;state.storyStep=0;move('ending');state.storyStep=1;render();});
 await page.waitForFunction(()=>document.querySelector('[data-finale="company"]').dataset.tableau==='false');
 await page.waitForFunction(()=>!document.querySelector('.company-reveal-light'));
 assert.equal(await page.locator('.finale-cast').isVisible(),true);
 assert.equal(await page.locator('[data-finale="company"]').evaluate(el=>getComputedStyle(el).opacity),'1');
 assert.equal(await page.getByRole('button',{name:'つづきへ',exact:true}).isEnabled(),true);
 await page.close();console.log('PASS company missing-art fallback');
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
