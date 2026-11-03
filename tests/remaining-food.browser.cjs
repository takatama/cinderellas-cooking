const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {assetPattern,settleImages}=require('./assets.cjs');
const base=process.env.TEST_URL||'http://127.0.0.1:4173';
const cases=[
 ['omurice',2,'pan','thin-egg-in-pan.png'],['omurice',3,'pan','thin-egg-in-pan.png'],
 ['oyakodon',1,'pan','chicken-onion-in-pan.png'],['oyakodon',2,'pan','egg-simmer-in-pan.png'],
 ['amatriciana',1,'pan','tomato-sauce-in-pan.png'],['carbonara',1,'pan','sauteed-onions-in-pan.png'],
 ['chicken-rice',1,'pan','sauteed-onions-in-pan.png'],
 ['hamburg-steak',0,'bowl','meat-mixture-in-bowl.png'],['menchi-katsu',0,'bowl','meat-mixture-in-bowl.png'],
 ['potato-croquettes',1,'bowl','mashed-potato-in-bowl.png'],['potato-salad',1,'bowl','mashed-potato-in-bowl.png'],
 ['potato-salad',2,'bowl','potato-mixture-in-bowl.png'],['potato-salad',3,'bowl','potato-mixture-in-bowl.png'],
 ['menchi-katsu',1,'fryer','breaded-cutlets-in-oil.png'],['potato-croquettes',2,'fryer','breaded-cutlets-in-oil.png']
];
(async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  for(const width of [1000,390,320]){
   const p=await b.newPage({viewport:{width,height:900}}),errors=[];
   p.on('pageerror',e=>errors.push(e.message));
   await p.goto(base);await p.evaluate(()=>localStorage.setItem(Progress.KEY,'keep-player-save'));
   for(const [dish,step,vessel,file] of cases){
    await p.goto(base+'/?preview=cooking&dish='+dish+'&step='+step);await settleImages(p);
    assert.equal(await p.locator('.painted-pan-food').getAttribute('data-asset'),file);
    assert.equal(await p.locator('#stage-object').getAttribute('data-vessel'),vessel);
    assert.equal(await p.locator('.painted-pan-food').isVisible(),true);
    assert.equal(await p.locator('.pan-front').isVisible(),true);
    assert.equal(await p.locator('.pan-contact-shadow').isVisible(),true);
    assert.ok(await p.locator('.painted-pan-food').evaluate(i=>{const c=getComputedStyle(i);return Math.abs(parseFloat(c.width)/parseFloat(c.height)-i.naturalWidth/i.naturalHeight)<.01;}));
    assert.equal(await p.locator('.painted-pan-food').evaluate(e=>getComputedStyle(e).animationName),'none','eggs, sauces, mixtures and frying food stay in their vessel');
    if(step<3)await p.getByRole('button',{name:'できあがりまで進む',exact:true}).click();
    if(dish==='oyakodon')assert.equal(await p.locator('.pan-food,.pan-front,.pan-contact-shadow').count(),0,'lid hides egg and all food layers');
    await p.getByRole('button',{name:'できた料理を見る',exact:true}).click();
    assert.equal(await p.locator('.pan-food,.pan-front,.pan-contact-shadow').count(),0);
    assert.equal(await p.evaluate(()=>localStorage.getItem(Progress.KEY)),'keep-player-save');
    await p.getByRole('button',{name:'調理を見直す',exact:true}).click();
    assert.equal(await p.evaluate(()=>cookingStep),step);
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   }
   assert.deepEqual(errors,[]);await p.close();console.log('PASS '+width+'px: all remaining food stages, ratio, vessel depth, lid, reveal, replay and save isolation');
  }
  for(const [dish,step,vessel,file] of [cases[0],cases[7],cases[14]]){
   for(const failed of [file,{'pan':'frying-pan.png','bowl':'mixing-bowl.png','fryer':'frying-pot.png'}[vessel]]){
    const p=await b.newPage();let release;const gate=new Promise(resolve=>release=resolve);
    await p.route(assetPattern(failed),async r=>{await gate;await r.abort();});
    await p.goto(base+'/?preview=cooking&dish='+dish+'&step='+step,{waitUntil:'domcontentloaded'});
    await p.waitForFunction(()=>document.querySelector('.painted-pan-food'));
    assert.equal(await p.locator('.painted-pan-food').isVisible(),false,'unready ingredient/vessel is hidden');
    release();await settleImages(p);
    assert.equal(await p.locator('.painted-pan-food').isVisible(),false);
    assert.equal(await p.locator('.pan-contact-shadow').isVisible(),false);
    if(failed!==file)assert.equal(await p.locator('.pan-front').isVisible(),false);
    await p.getByRole('button',{name:'できあがりまで進む',exact:true}).click();
    await p.getByRole('button',{name:'できた料理を見る',exact:true}).click();
    assert.equal(await p.locator('.cookware-art').count(),0);await p.close();
    console.log('PASS delayed/failed '+failed+': no floating food, reveal remains possible');
   }
  }
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
