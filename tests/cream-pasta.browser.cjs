const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {assetPattern,settleImages}=require('./assets.cjs');
const base=process.env.TEST_URL||'http://127.0.0.1:4173';
const preview=base+'/?preview=cooking&dish=carbonara&step=2';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1000,height:900}});
  await page.goto(preview);
  await settleImages(page);
  const saved=await page.evaluate(()=>{
   // Preserve a real v1 save, including randomized questions and puzzle/reading data.
   state.answerDraft={door:{四桁の数字:'１２３４'},orange:{答え:'メモ'}};
   state.orange=true;
   state.readLayout=2;
   state.items=state.round.map(r=>r.options.find(item=>state.items.includes(item)));
   history=[{title:'保存した会話',lines:[{who:'シンデレラ',text:'材料を選びました。'}]}];
   Progress.save(localStorage,{state,history,cookingStep});
   return localStorage.getItem(Progress.KEY);
  });
  assert.equal(await page.evaluate(()=>Progress.validSave(JSON.parse(localStorage.getItem(Progress.KEY)))),true);
  await page.reload();
  await settleImages(page);
  for(const dialog of ['history','settings']){
   await page.locator('#'+dialog).click();
   assert.equal(await page.locator('.pan-toss').evaluate(e=>getComputedStyle(e).animationPlayState),'paused');
   await page.locator('#'+dialog+'-dialog .close').first().click();
  }
  await page.evaluate(()=>{
   Object.defineProperty(document,'hidden',{configurable:true,value:true});
   document.dispatchEvent(new Event('visibilitychange'));
  });
  assert.equal(await page.locator('.pan-toss').evaluate(e=>getComputedStyle(e).animationPlayState),'paused');
  await page.evaluate(()=>{
   delete document.hidden;
   document.dispatchEvent(new Event('visibilitychange'));
  });
  assert.equal(await page.locator('.pan-toss').evaluate(e=>getComputedStyle(e).animationPlayState),'running');
  await page.getByRole('button',{name:'できあがりまで進む',exact:true}).click();
  await page.getByRole('button',{name:'できた料理を見る',exact:true}).click();
  assert.equal(await page.locator('.pan-food,.pan-front,.pan-contact-shadow').count(),0);
  assert.equal(await page.evaluate(()=>localStorage.getItem(Progress.KEY)),saved,'preview keeps every byte of the existing save');
  await page.goto(base);
  await page.waitForTimeout(330); // Resume uses the shared 300ms accidental-click guard.
  await page.getByRole('button',{name:'つづきから遊ぶ',exact:true}).click();
  await page.evaluate(()=>pauseCooking());
  await settleImages(page);
  assert.equal(await page.locator('.painted-pan-food').getAttribute('data-asset'),'cream-pasta-in-pan.png');
  const restored=await page.evaluate(()=>({state,history,cookingStep}));
  const original=JSON.parse(saved);
  for(const key of ['items','round','answerDraft','orange','pink','readLayout','readPage'])
   assert.deepEqual(restored.state[key],original.state[key],key+' survives resume');
  assert.deepEqual(restored.history,original.history);
  assert.equal(restored.cookingStep,2);
  await page.close();
  console.log('PASS cream pasta: dialogs, visibility, manual reveal, complete save isolation and real v1 resume');

  for(const file of ['cream-pasta-in-pan.png','frying-pan.png']){
   const p=await browser.newPage({viewport:{width:390,height:740}});
   let release;
   const gate=new Promise(resolve=>release=resolve);
   await p.route(assetPattern(file),async route=>{await gate;await route.abort();});
   await p.goto(preview,{waitUntil:'domcontentloaded'});
   await p.waitForFunction(()=>document.querySelector('.painted-pan-food'));
   assert.equal(await p.locator('.painted-pan-food').isVisible(),false,'loading food or vessel stays hidden');
   release();
   await settleImages(p);
   assert.equal(await p.locator('.painted-pan-food').isVisible(),false,'failed food or vessel stays hidden');
   assert.equal(await p.locator('.pan-contact-shadow').isVisible(),false);
   if(file==='frying-pan.png')assert.equal(await p.locator('.pan-front').isVisible(),false);
   await p.getByRole('button',{name:'できあがりまで進む',exact:true}).click();
   await p.getByRole('button',{name:'できた料理を見る',exact:true}).click();
   await settleImages(p);
   assert.equal(await p.locator('#stage-object .dish-art').getAttribute('data-asset'),'carbonara.png');
   await p.close();
   console.log('PASS cream pasta: delayed/failed '+file+' and reveal without it');
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
