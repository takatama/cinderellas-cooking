const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{
for(const [width,height] of [[1280,900],[1280,720],[390,740],[320,740],[390,420]]){
const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');
const decode=async()=>{await page.locator('#journey-art img,#stage-object img').evaluateAll(imgs=>Promise.all(imgs.map(img=>img.decode().catch(()=>{}))));
for(const ratio of await page.locator('.finale-actor>img,.mail-order-tableau').evaluateAll(imgs=>imgs.filter(i=>i.naturalWidth&&i.getBoundingClientRect().height).map(i=>{const b=i.getBoundingClientRect();return (b.width/b.height)/(i.naturalWidth/i.naturalHeight);})))assert.ok(Math.abs(ratio-1)<.01,'finale characters retain their original aspect ratio');};
const read=async()=>{for(let i=0;i<12&&await page.locator('#dialogue').getAttribute('data-more')==='true';i++)await page.getByRole('button',{name:'つづきへ',exact:true}).click();};
const click=async name=>{await read();await page.waitForTimeout(330);await page.getByRole('button',{name:name.replace(/[\s　]*→$/u,''),exact:true}).click();};
for(const phase of ['room','orange','pink','final-ready','final-cooking']){
await page.evaluate(p=>{state.chapter=2;state.orange=true;state.pink=true;move(p);},phase);
assert.equal(await page.locator('#stage-object').textContent(),'');
assert.equal(await page.locator('#stage-object img,.finale-cast,.finale-table').count(),0,'no final dish, cast or table before manual reveal');
assert.equal(await page.locator('.castle-backdrop').getAttribute('src'),'assets/magic-room.png');
}
await click('できた料理を見る　→');await decode();
assert.equal(await page.evaluate(()=>state.phase),'final-result');
assert.equal(await page.locator('#stage-object img').getAttribute('src'),'assets/pumpkin-pudding.png');
assert.equal(await page.locator('#stage-object').evaluate(el=>el.parentElement.id),'table-plane');
assert.equal(await page.locator('.finale-prince>img').first().getAttribute('src'),'assets/prince.png');
assert.equal(await page.locator('.finale-prince .finale-expression').getAttribute('src'),'assets/prince-delighted.png');
assert.equal(await page.locator('#story-scene-frame').isVisible(),false,'no kitchen behind the castle cast');
await read();const position=await page.evaluate(()=>({key:state.readKey,page:state.readPage}));
await page.reload();await page.waitForTimeout(330);await page.getByRole('button',{name:'つづきから遊ぶ',exact:true}).click();await decode();
assert.deepEqual(await page.evaluate(()=>({key:state.readKey,page:state.readPage})),position);
assert.equal(await page.locator('[data-finale="tasting"]').count(),1);
await click('またあとで');assert.equal(await page.locator('.finale-cast,#stage-object img').count(),0);
await click('お話を再開する');await click('はい');await decode();
for(const [step,scene,file] of [[0,'investment','magic-room.png'],[1,'company','company-workshop.png'],[2,'mail-order','mail-order-home.png']]){
assert.equal(await page.evaluate(()=>state.storyStep),step);
assert.equal(await page.locator('.finale-scene').getAttribute('data-finale'),scene);
assert.equal(await page.locator('.castle-backdrop').getAttribute('src'),'assets/'+file);
assert.equal(await page.locator('#stage-object img').getAttribute('src'),'assets/pumpkin-pudding.png');
if(step===0)assert.equal(await page.locator('.finale-prince .finale-expression').getAttribute('src'),'assets/prince-pleased.png');
if(step===1)assert.equal(await page.locator('.finale-parcels').isVisible(),true);
if(step===2){assert.equal(await page.locator('.finale-prince,.finale-cinderella').count(),0);assert.equal(await page.locator('.mail-order-tableau').isVisible(),true);assert.equal(await page.locator('.finale-cast').isVisible(),false);assert.equal(await page.locator('.finale-parcels').isVisible(),false);}
await page.reload();await page.waitForTimeout(330);await page.getByRole('button',{name:'つづきから遊ぶ',exact:true}).click();await decode();
assert.equal(await page.locator('.finale-scene').getAttribute('data-finale'),scene);
for(const w of [width===320?1280:320,width]){
await page.setViewportSize({width:w,height});await page.waitForTimeout(80);
const bounds=await page.evaluate(()=>{const c=document.querySelector('.finale-scene').getBoundingClientRect(),o=$('stage-object').getBoundingClientRect();return {ratio:c.width/c.height,inside:o.left>=c.left-1&&o.right<=c.right+1&&o.top>=c.top-1&&o.bottom<=c.bottom+1,overflow:document.documentElement.scrollWidth>innerWidth};});
assert.ok(Math.abs(bounds.ratio-1.5)<.01);assert.equal(bounds.inside,true);assert.equal(bounds.overflow,false);
}
if(process.env.SCREENSHOTS)await page.screenshot({path:`${process.env.SCREENSHOTS}/${width}-${height}-${scene}.png`,fullPage:true});
await click('つづきへ');await decode();
}
assert.equal(await page.evaluate(()=>state.phase),'complete');
assert.equal(await page.locator('.finale-scene').getAttribute('data-finale'),'thanks');
assert.equal(await page.locator('.finale-cinderella').count(),1);
assert.equal(await page.locator('.finale-prince,.finale-sister,.finale-mother,#stage-object img').count(),0);
if(process.env.SCREENSHOTS)await page.screenshot({path:`${process.env.SCREENSHOTS}/${width}-${height}-thanks.png`,fullPage:true});
assert.deepEqual(errors,[]);await page.close();console.log(`PASS final art ${width}x${height}: reveal, cast, expressions, pause, saves, endings, resize`);
}
for(const files of [['pumpkin-pudding.png'],['prince-delighted.png'],['help-characters.png','prince.png','mother.png'],['magic-room.png','tasting-table.png','company-workshop.png','mail-order-home.png'],['mail-order-epilogue.png']]){
const page=await browser.newPage();for(const file of files)await page.route('**/assets/'+file,r=>r.abort());
await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');
const click=async name=>{for(let i=0;i<12&&await page.locator('#dialogue').getAttribute('data-more')==='true';i++)await page.getByRole('button',{name:'つづきへ',exact:true}).click();await page.waitForTimeout(330);await page.getByRole('button',{name,exact:true}).click();};
await page.evaluate(()=>{state.chapter=2;state.orange=true;state.pink=true;move('final-result');});
await page.waitForTimeout(150);
if(files.includes('pumpkin-pudding.png'))assert.match(await page.locator('#stage-object').textContent(),/パンプキンプリン/);
if(files.includes('prince-delighted.png'))assert.equal(await page.locator('.finale-prince>img').first().isVisible(),true);
await click('はい');
for(let step=0;step<3;step++){
assert.equal(await page.evaluate(()=>state.storyStep),step);
assert.ok(await page.locator('#advance button').count()>0);
assert.ok((await page.locator('#dialogue').innerText()).length>0);
if(step===2&&files.includes('mail-order-epilogue.png')){await page.waitForFunction(()=>document.querySelector('.finale-scene').dataset.tableau==='false');assert.equal(await page.locator('.finale-cast').isVisible(),true);assert.equal(await page.locator('.finale-parcels').isVisible(),true);}
await click('つづきへ');
}
assert.equal(await page.evaluate(()=>state.phase),'complete');
await page.close();console.log(`PASS final art fallback: ${files.join(', ')}`);
}
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
