const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});try{
for(const width of [1280,390,320]){
const context=await browser.newContext({viewport:{width,height:width===1280?900:740}}),page=await context.newPage();await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');
const next=()=>page.locator('#advance .primary');const origin=await next().boundingBox();
for(let i=0;i<16&&await next().count();i++){const rect=await next().boundingBox();assert.equal(rect.y,origin.y);assert.equal(rect.x,origin.x);await next().click();}
// Reading stops on the cooperation question; the old advance target is inert.
while(await page.locator('#dialogue').getAttribute('data-more')==='true')await next().click();
assert.equal(await next().count(),0);await page.locator('#dialogue').click();assert.equal(await page.evaluate(()=>state.phase),'intro');for(let i=0;i<5;i++)await page.mouse.click(origin.x+origin.width/2,origin.y+origin.height/2);assert.equal(await page.evaluate(()=>state.phase),'intro');
await page.waitForTimeout(320);await page.getByRole('button',{name:'はい',exact:true}).click();assert.equal(await page.locator('.ingredient').count(),2);const before=await page.evaluate(()=>state.items.length);await page.mouse.click(origin.x+origin.width/2,origin.y+origin.height/2);assert.equal(await page.evaluate(()=>state.items.length),before);
await page.waitForTimeout(320);await page.locator('.ingredient').first().dblclick();assert.equal(await page.evaluate(()=>state.items.length),1);
assert.equal(await page.getByText('上の選択肢から選んでください',{exact:true}).count(),0);
assert.equal(await page.locator('button').filter({hasText:'→'}).count(),0);
// The question precedes the aside, regardless of shuffled pair order.
await page.evaluate(()=>{state.round=[{pairIndex:2,options:['カレールー','ちくわぶ']},{pairIndex:0,options:['豚肉','しらたき']},{pairIndex:1,options:['じゃがいも','たまご']}];state.items=[];state.step=0;render();});
assert.equal(await page.locator('#dialogue').evaluate(el=>el.firstElementChild.className),'question');assert.match(await page.locator('#dialogue .speech').innerText(),/ちくわぶ/);
// Retry and cooking skip occupy the same left corner; the reveal stays on the right.
await page.evaluate(()=>{state.items=['カレールー','豚肉','じゃがいも'];state.step=2;state.phase='ready';render();});
assert.equal(await page.locator('#dialogue').getAttribute('data-more'),'false');
const retry=await page.getByRole('button',{name:'材料を選びなおす',exact:true}).boundingBox();const request=await page.getByRole('button',{name:'お料理をお願いする',exact:true}).boundingBox();assert.equal(retry.y,request.y);assert.ok(retry.x<request.x);
await page.getByRole('button',{name:'お料理をお願いする',exact:true}).click();assert.equal(await page.getByRole('button',{name:'つづきへ',exact:true}).count(),0);
const skip=page.getByRole('button',{name:'できあがりまで進む',exact:true});assert.equal((await skip.boundingBox()).x,retry.x);assert.equal((await skip.boundingBox()).y,retry.y);
await page.getByRole('button',{name:'⚙ 設定',exact:true}).click();const beat=await page.evaluate(()=>cookingStep);await page.waitForTimeout(1100);assert.equal(await page.evaluate(()=>cookingStep),beat);await page.getByRole('button',{name:'閉じる',exact:true}).first().click();
await page.waitForTimeout(2850);assert.equal(await page.evaluate(()=>cookingStep),3);assert.equal(await page.evaluate(()=>state.phase),'cooking');assert.equal(await page.locator('#stage-object').getAttribute('data-food'),'お料理中');await page.getByRole('button',{name:'できた料理を見る',exact:true}).click();assert.equal(await page.evaluate(()=>state.phase),'result');

await page.evaluate(()=>start());const order=await page.locator('.ingredient').first().getAttribute('aria-label');await page.getByRole('button',{name:'⚙ 設定',exact:true}).click();await page.getByRole('button',{name:'閉じる',exact:true}).first().click();assert.equal(await page.locator('.ingredient').first().getAttribute('aria-label'),order);
// A fixture starts a later chapter; all reading and form interactions are real UI actions.
await page.evaluate(()=>move('prince'));await page.locator('#dialogue').click();const text=await page.locator('#dialogue').innerText();await page.reload();await page.waitForTimeout(320);await page.getByRole('button',{name:'つづきから遊ぶ',exact:true}).click();assert.equal(await page.locator('#dialogue').innerText(),text);assert.equal(await page.locator('#stage-object').innerText(),'');assert.equal(await page.locator('.secret-order').count(),1);
// Saves produced before pagination have no new fields and still resume.
await page.evaluate(()=>{const saved=JSON.parse(localStorage.getItem('cinderella-first-journey-v1'));delete saved.state.readPage;delete saved.state.readKey;delete saved.state.answerDraft;localStorage.setItem('cinderella-first-journey-v1',JSON.stringify(saved));});await page.reload();await page.waitForTimeout(320);await page.getByRole('button',{name:'つづきから遊ぶ',exact:true}).click();assert.equal(await page.evaluate(()=>state.phase),'prince');assert.equal(await page.evaluate(()=>state.readPage),0);
await page.evaluate(()=>move('door'));while(await page.locator('#dialogue').getAttribute('data-more')==='true')await next().click();
assert.match(await page.locator('#dialogue').innerText(),/おえかき/);assert.equal(await page.getByLabel('四桁の数字').count(),1);await page.getByLabel('四桁の数字').fill('1234');await page.getByRole('button',{name:'扉を詳しく調べる'}).click();assert.equal(await page.getByLabel('四桁の数字').inputValue(),'1234');await page.getByLabel('四桁の数字').press('Enter');assert.match(await page.locator('#dialogue').innerText(),/まだ鍵/);
await page.getByLabel('四桁の数字').fill('5467');await page.getByLabel('四桁の数字').press('Enter');assert.equal(await page.evaluate(()=>state.phase),'door-open');
assert.equal(await page.locator('#settings').count(),1);assert.equal(await page.locator('.mast button').count(),0);
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
// At text enlargement and a keyboard-sized viewport, inputs and submission stay reachable.
await page.evaluate(()=>move('pink'));await page.evaluate(()=>document.querySelectorAll('.words').forEach(e=>e.style.fontSize='30px'));await page.getByLabel('一つ目の材料').fill('たまご');await page.setViewportSize({width,height:420});await page.getByLabel('二つ目の材料').fill('さとう');await page.getByRole('button',{name:'名前を唱える'}).click();assert.equal(await page.evaluate(()=>state.phase),'paper-solved');
if(width===1280){await page.setViewportSize({width,height:720});await page.evaluate(()=>restartStory());await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>{const art=$('art').getBoundingClientRect(),canvas=$('scene-canvas').getBoundingClientRect();return canvas.width<=art.width+1&&canvas.height<=art.height+1;}),true);}
await context.close();console.log(`PASS ${width}px fixed advance rail, click burst isolation, double-click guard, page resume, secret order, persistent puzzle input, Enter, enlarged text and keyboard-sized viewport`);
}
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
