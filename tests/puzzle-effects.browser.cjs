const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
 for(const [width,reducedMotion,order] of [[1280,'no-preference',['orange','pink']],[390,'no-preference',['pink','orange']],[320,'reduce',['orange','pink']]]){
  const page=await browser.newPage({viewport:{width,height:850},reducedMotion});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');
  async function setup(phase){await page.evaluate(phase=>{state.chapter=2;move(phase);while($('dialogue').dataset.more==='true'){$('advance').querySelector('.primary').click();}},phase);}
  await setup('door');
  // The door has two prelude pages, each needing a real read action.
  while(await page.locator('#dialogue').getAttribute('data-more')==='true')await page.getByRole('button',{name:'つづきへ',exact:true}).click();
  await page.getByLabel('四桁の数字',{exact:true}).fill('1234');await page.getByRole('button',{name:'数字を合わせる',exact:true}).click();
  assert.equal(await page.locator('.puzzle-effect').count(),0);
  await page.getByLabel('四桁の数字',{exact:true}).fill('5467');await page.getByRole('button',{name:'数字を合わせる',exact:true}).click();
  assert.equal(await page.evaluate(()=>state.phase),'door-open');assert.equal(await page.locator('.puzzle-effect-door').count(),1);
  assert.equal(await page.locator('.door-unlock-light').count(),reducedMotion==='reduce'?0:1);
  if(width===1280){await page.waitForTimeout(900);await page.screenshot({path:'/tmp/cinderella-door-unlock.png'});}
  await page.waitForFunction(()=>!document.querySelector('.puzzle-effect'));
  for(const color of order){
   await setup(color);
   if(color==='orange')await page.getByLabel('野菜の名前',{exact:true}).fill('かぼちゃ');
   else{await page.getByLabel('一つ目の材料',{exact:true}).fill('たまご');await page.getByLabel('二つ目の材料',{exact:true}).fill('砂糖');}
   await page.getByRole('button',{name:'名前を唱える',exact:true}).click();
   assert.equal(await page.evaluate(()=>state.phase),'paper-solved');
   assert.equal(await page.locator(`.puzzle-effect-${color} .dissolving-paper`).count(),1);
   assert.equal(await page.locator(`[data-paper="${color}"]`).isVisible(),false);
   assert.equal(await page.locator('.paper-spark').count(),reducedMotion==='reduce'?0:24);
   if(width===1280&&color==='orange'){
    await page.waitForTimeout(650);await page.screenshot({path:'/tmp/cinderella-paper-magic.png'});
    await page.getByRole('button',{name:'⚙ 設定',exact:true}).click();
    const times=await page.locator('.puzzle-effect').evaluate(el=>el.getAnimations({subtree:true}).map(a=>a.currentTime));
    await page.waitForTimeout(350);
    const paused=await page.locator('.puzzle-effect').evaluate(el=>el.getAnimations({subtree:true}).map(a=>a.currentTime));
    assert.deepEqual(paused,times);await page.getByRole('button',{name:'閉じる',exact:true}).click();
   }
   await page.waitForFunction(()=>!document.querySelector('.puzzle-effect'));
  }
  assert.equal(await page.locator('.oven-awake').count(),1);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.reload();await page.waitForTimeout(350);await page.getByRole('button',{name:'つづきから遊ぶ',exact:true}).click();
  assert.equal(await page.evaluate(()=>state.orange&&state.pink),true);assert.equal(await page.locator('.puzzle-effect').count(),0);
  assert.deepEqual(errors,[]);await page.close();console.log(`PASS ${width}px ${reducedMotion}: door reward, wrong answer, paper order ${order}, second-paper glow, pause, save`);
 }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
