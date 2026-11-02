const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {assetPattern}=require('./assets.cjs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  for(const width of [1000,390]){
   const page=await browser.newPage({viewport:{width,height:900}}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');
   await page.evaluate(()=>{state.phase='cooking';state.dish='ハンバーグ';cookingStep=1;render();pauseCooking();});
   await page.locator('.cookware-art').evaluate(i=>i.decode());
   await page.locator('.painted-pan-food').evaluate(i=>i.decode());
   assert.equal(await page.locator('.pan-food:visible').count(),1);
   assert.equal(await page.locator('.pan-front:visible').count(),1);
   assert.ok(await page.locator('.pan-front').evaluate(e=>getComputedStyle(e).maskImage!=='none'));
   assert.equal(await page.evaluate(()=>getComputedStyle(document.querySelector('.pan-front')).backgroundImage.includes(document.querySelector('.cookware-art').currentSrc)),true,'front reuses the existing pan image');
   const meat=await page.locator('.pan-food').innerHTML();
   await page.evaluate(()=>{state.dish='アマトリチャーナ';cookingStep=1;render();pauseCooking();});
   assert.notEqual(await page.locator('.pan-food').innerHTML(),meat,'same pan updates when the cooking method changes');
   const sauce=await page.locator('.pan-food').innerHTML();
   await page.evaluate(()=>{cookingStep=2;updateCookingControls();});
   assert.notEqual(await page.locator('.pan-food').innerHTML(),sauce,'pasta joins the sauce at the finishing stage');
   assert.equal(await page.locator('#stage-object .dish-art:not(.cookware-art)').count(),0);
   await page.evaluate(()=>{state.dish='ハンバーグ';cookingStep=2;render();pauseCooking();});
   assert.equal(await page.locator('.pan-food').count(),0,'food is not drawn over a lid');
   assert.equal(await page.locator('.pan-front,.pan-contact-shadow').count(),0,'front and contact shadow leave with the uncovered pan');
   await page.evaluate(()=>{state.dish='野菜炒め';cookingStep=1;render();pauseCooking();});
   await page.locator('.painted-pan-food').evaluate(i=>i.decode());
   assert.equal(await page.locator('.painted-pan-food').evaluate(e=>getComputedStyle(e).animationPlayState),'paused');
   await page.emulateMedia({reducedMotion:'reduce'});
   assert.equal(await page.locator('.painted-pan-food').evaluate(e=>getComputedStyle(e).animationName),'none');
   await page.emulateMedia({reducedMotion:'no-preference'});
   await page.evaluate(()=>{cookingStep=3;updateCookingControls();result();});
   await page.locator('#stage-object img').evaluate(i=>i.decode());
   assert.equal(await page.locator('.pan-food').count(),0);
   assert.equal(await page.locator('.served-warm .steam').count(),1);
   assert.equal(await page.locator('#steam i').first().evaluate(e=>getComputedStyle(e).animationPlayState),'running','completed dishes keep their steam moving');
   await page.locator('#settings').click();
   assert.equal(await page.locator('#steam i').first().evaluate(e=>getComputedStyle(e).animationPlayState),'paused');
   await page.locator('#reduce').check();
   assert.equal(await page.locator('#steam i').first().evaluate(e=>getComputedStyle(e).animationName),'none');
   await page.locator('#settings-dialog .close').click();
   for(const dish of ['ポテトサラダ','パンプキンプリン']){
    await page.evaluate(dish=>{state.phase=dish==='パンプキンプリン'?'final-result':'result';state.dish=dish;render();},dish);
    assert.equal(await page.locator('.served-warm').count(),0,'cold dishes do not steam');
   }
   assert.deepEqual(errors,[]);
   console.log(`PASS ${width}px: food stages, lid, reveal steam, pause and reduced motion`);
   await page.close();
  }
  const page=await browser.newPage();
  await page.route(assetPattern('frying-pan.png'),r=>r.abort());
  await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');
  await page.evaluate(()=>{state.phase='cooking';state.dish='野菜炒め';cookingStep=1;render();pauseCooking();});
  await page.locator('.food-fallback').waitFor();
  assert.equal(await page.locator('.pan-food').isVisible(),false,'ingredients do not float without their pan');
  assert.equal(await page.locator('.pan-front').isVisible(),false);
  assert.equal(await page.locator('.pan-contact-shadow').isVisible(),false);
  console.log('PASS failed pan: food layer hidden');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
