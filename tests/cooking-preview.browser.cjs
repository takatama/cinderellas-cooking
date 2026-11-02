const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 try{for(const width of [1000,390,320]){
  const p=await b.newPage({viewport:{width,height:900}}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  const base=process.env.TEST_URL||'http://127.0.0.1:4173';
  await p.goto(base);
  await p.evaluate(()=>localStorage.setItem(Progress.KEY,'keep-existing-progress'));
  await p.goto(base+'/?preview=cooking&dish=vegetable-stir-fry');
  await p.locator('.cookware-art').evaluate(i=>i.decode());
  await p.locator('.painted-pan-food').evaluate(i=>i.decode());
  assert.ok(await p.locator('.painted-pan-food').evaluate(i=>{const c=getComputedStyle(i);return Math.abs(parseFloat(c.width)/parseFloat(c.height)-i.naturalWidth/i.naturalHeight)<.01;}),'painted food preserves its original aspect ratio');
  assert.deepEqual(await p.evaluate(()=>({phase:state.phase,dish:state.dish,step:cookingStep})),{phase:'cooking',dish:'野菜炒め',step:1});
  assert.equal(await p.locator('.pan-toss').evaluate(e=>getComputedStyle(e).animationName),'pan-toss');
  assert.equal(await p.locator('.painted-pan-food').isVisible(),true);
  await p.waitForTimeout(3100);
  assert.equal(await p.evaluate(()=>cookingStep),1,'preview keeps cooking visible');
  await p.locator('#settings').click();
  assert.equal(await p.locator('.pan-toss').evaluate(e=>getComputedStyle(e).animationPlayState),'paused');
  await p.locator('#reduce').check();
  assert.equal(await p.locator('.pan-toss').evaluate(e=>getComputedStyle(e).animationName),'none');
  await p.locator('#reduce').uncheck();
  await p.locator('#settings-dialog .close').click();
  await p.getByRole('button',{name:'できあがりまで進む',exact:true}).click();
  await p.getByRole('button',{name:'できた料理を見る',exact:true}).click();
  assert.equal(await p.locator('.pan-toss').count(),0);
  await p.getByRole('button',{name:'調理を見直す',exact:true}).click();
  assert.equal(await p.locator('.painted-pan-food').count(),1);
  assert.equal(await p.evaluate(()=>localStorage.getItem(Progress.KEY)),'keep-existing-progress');
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await p.reload();
  assert.equal(await p.evaluate(()=>state.phase),'cooking');
  await p.getByRole('link',{name:'通常のゲームへ'}).click();
  assert.equal(await p.locator('.cooking-preview-toolbar').count(),0);
  assert.equal(await p.evaluate(()=>state.phase),'intro');
  await p.goto(base+'/?preview=cooking&dish=unknown');
  assert.equal(await p.locator('.cooking-preview-toolbar').count(),0);
  const saveBeforeNewPreviews=await p.evaluate(()=>localStorage.getItem(Progress.KEY));
  for(const [dish,step,kind] of [['hamburg-steak',1,'sear'],['amatriciana',2,'pasta'],['tomato-spaghetti',2,'pasta']]){
   await p.goto(base+'/?preview=cooking&dish='+dish+'&step='+step);
   await p.locator('.cookware-art').evaluate(i=>i.decode());
   await p.locator('.painted-pan-food').evaluate(i=>i.decode());
  assert.ok(await p.locator('.painted-pan-food').evaluate(i=>{const c=getComputedStyle(i);return Math.abs(parseFloat(c.width)/parseFloat(c.height)-i.naturalWidth/i.naturalHeight)<.01;}),'painted food preserves its original aspect ratio');
   assert.equal(await p.evaluate(()=>cookingStep),step);
   assert.equal(await p.locator('.painted-pan-food').getAttribute('data-food-kind'),kind);
   assert.equal(await p.locator('.painted-pan-food').isVisible(),true);
   if(kind==='sear'){
    assert.equal(await p.locator('.pan-toss').count(),0,'patties are not tossed');
    assert.equal(await p.locator('.painted-pan-food').evaluate(e=>getComputedStyle(e).animationName),'none');
   }else{
    assert.equal(await p.locator('.pan-toss').evaluate(e=>getComputedStyle(e).animationName),'pan-fold');
    await p.locator('#settings').click();
    assert.equal(await p.locator('.pan-toss').evaluate(e=>getComputedStyle(e).animationPlayState),'paused');
    await p.locator('#reduce').check();
    assert.equal(await p.locator('.pan-toss').evaluate(e=>getComputedStyle(e).animationName),'none');
    await p.locator('#reduce').uncheck();
    await p.locator('#settings-dialog .close').click();
    await p.emulateMedia({reducedMotion:'reduce'});
    assert.equal(await p.locator('.pan-toss').evaluate(e=>getComputedStyle(e).animationName),'none');
    await p.emulateMedia({reducedMotion:'no-preference'});
   }
   await p.getByRole('button',{name:'調理を見直す',exact:true}).click();
   assert.equal(await p.evaluate(()=>cookingStep),step,'replay retains the requested stage');
   assert.equal(await p.evaluate(()=>localStorage.getItem(Progress.KEY)),saveBeforeNewPreviews);
  }
  assert.deepEqual(errors,[]);
  await p.close();console.log(`PASS ${width}px: cooking deep link, animation, pause, reduced motion, reveal/replay, save isolation, exit, invalid query, meat/pasta stage links`);
 }}finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
