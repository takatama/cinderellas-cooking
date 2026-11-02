const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {assetPattern,settleImages}=require('./assets.cjs');
const base=process.env.TEST_URL||'http://127.0.0.1:4173';
const link=(dish,step)=>base+'/?preview=cooking&dish='+dish+'&step='+step;
const cases=[['pilaf',0,'buttered-rice-in-pan.png'],['chicken-rice',2,'tomato-rice-in-pan.png'],['chicken-rice',3,'tomato-rice-in-pan.png'],['omurice',1,'tomato-rice-in-pan.png']];
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  for(const width of [1000,390,320]){
   const p=await browser.newPage({viewport:{width,height:900}}),errors=[];
   p.on('pageerror',e=>errors.push(e.message));
   await p.goto(base);
   await p.evaluate(()=>localStorage.setItem(Progress.KEY,'keep-existing-save'));
   for(const [dish,step,file] of cases){
    await p.goto(link(dish,step));
    await settleImages(p);
    assert.equal(await p.locator('.painted-pan-food').getAttribute('data-asset'),file);
    assert.equal(await p.locator('.painted-pan-food').isVisible(),true);
    assert.ok(await p.locator('.painted-pan-food').evaluate(i=>{const c=getComputedStyle(i);return Math.abs(parseFloat(c.width)/parseFloat(c.height)-i.naturalWidth/i.naturalHeight)<.01;}));
    assert.equal(await p.locator('.pan-front').isVisible(),true);
    assert.equal(await p.locator('.pan-contact-shadow').isVisible(),true);
    assert.equal(await p.locator('.painted-pan-food').evaluate(e=>getComputedStyle(e).animationName),'none','rice stays inside the pan');
    if(dish!=='pilaf'){
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
    if(step<3)await p.getByRole('button',{name:'できあがりまで進む',exact:true}).click();
    await p.getByRole('button',{name:'できた料理を見る',exact:true}).click();
    assert.equal(await p.locator('.pan-food,.pan-front,.pan-contact-shadow').count(),0);
    await p.getByRole('button',{name:'調理を見直す',exact:true}).click();
    assert.equal(await p.evaluate(()=>cookingStep),step);
    assert.equal(await p.evaluate(()=>localStorage.getItem(Progress.KEY)),'keep-existing-save');
   }
   // Rice appears only in its actual cooking stage, never over a lid or as an egg substitute.
   for(const [dish,steps] of [['pilaf',[1,2,3]],['chicken-rice',[0,1]],['omurice',[0,2,3]]])
    for(const step of steps){
     await p.goto(link(dish,step));
     await settleImages(p);
     assert.equal(await p.locator('.painted-pan-food').count(),0,dish+' stage '+step);
    }
   assert.deepEqual(errors,[]);
   await p.close();
   console.log(`PASS ${width}px: rice assets, proportions, pan depth, stages, pause, reduced motion, manual reveal and save isolation`);
  }
  for(const [dish,step,file] of [cases[0],cases[1],['chicken-rice',2,'frying-pan.png']]){
   const p=await browser.newPage();
   await p.route(assetPattern(file),route=>route.abort());
   await p.goto(link(dish,step));
   await settleImages(p);
   assert.equal(await p.locator('.painted-pan-food').isVisible(),false);
   assert.equal(await p.locator('.pan-contact-shadow').isVisible(),false);
   if(file==='frying-pan.png')assert.equal(await p.locator('.pan-front').isVisible(),false);
   await p.getByRole('button',{name:'できあがりまで進む',exact:true}).click();
   await p.getByRole('button',{name:'できた料理を見る',exact:true}).click();
   assert.equal(await p.locator('.cookware-art').count(),0);
   await p.close();
   console.log('PASS rice image failure and reveal: '+file);
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
