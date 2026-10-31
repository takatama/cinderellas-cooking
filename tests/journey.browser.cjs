// Run against a local static server: NODE_PATH=<playwright modules> node tests/journey.browser.cjs
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox']});
try{
for(const [width,pinkFirst] of [[1280,false],[390,true],[320,false]]){
const context=await browser.newContext({viewport:{width,height:900},reducedMotion:width===320?'reduce':'no-preference'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const click=async text=>page.getByRole('button',{name:text,exact:false}).click();
const phase=()=>page.evaluate(()=>state.phase);
const checkWidth=async()=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
const shot=async name=>{await page.evaluate(()=>Promise.all(document.getAnimations().filter(a=>a.effect.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{}))));await checkWidth();if(process.env.SCREENSHOTS)await page.screenshot({path:process.env.SCREENSHOTS+`/${width}-${name}.png`,fullPage:true});};
await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');
for(let i=0;i<4;i++)await click('つづきを読む');
assert.match(await page.locator('#dialogue').innerText(),/材料を選んであげますか/);
await click('いいえ');assert.equal(await phase(),'pause');await click('お願いにもどる');await click('はい');
async function chooseSet(items){for(let n=0;n<3&&await phase()==='select';n++){let options=await page.locator('.ingredient strong').allTextContents();const choice=options.find(o=>items.includes(o));assert.ok(choice,options.join(','));await page.getByRole('button',{name:choice+'を選ぶ',exact:true}).click();await checkWidth();}assert.equal(await phase(),'ready');await click('お料理をお願いする');await click('できあがりまで進む');await click('できた料理を見てみる');assert.equal(await phase(),'result');}
for(let ch=0;ch<3;ch++){
const wrong=[['しらたき','たまご','ちくわぶ'],['じゃがいも','キャベツ','青のり'],['お米','たまご','とり肉']][ch];
await chooseSet(wrong);await shot(`wrong-${ch}`);assert.match(await page.locator('#dialogue').innerText(),/おいしい/);await click('材料を選びなおす');
// Saving a partly answered shuffled round must keep both selection and question order.
const wanted=[['豚肉','じゃがいも','カレールー'],['ひき肉','パン粉','玉ねぎ'],['パスタ','トマト','ベーコン']][ch];const firstOptions=await page.locator('.ingredient strong').allTextContents();await page.getByRole('button',{name:firstOptions.find(x=>wanted.includes(x))+'を選ぶ',exact:true}).click();const before=await page.locator('.ingredient').first().getAttribute('aria-label');await page.reload();await click('つづきから遊ぶ');assert.equal(await page.locator('.ingredient').first().getAttribute('aria-label'),before);assert.equal(await page.locator('#table-ingredients figure').count(),1);
await chooseSet(wanted);await shot(`success-${ch}`);
await click(ch===0?'おかわりをよそう':'つづきを読む');
if(ch<2){assert.equal(await phase(),ch===0?'mother':'prince');await shot(`request-${ch+1}`);await click('いいえ');await page.reload();await click('つづきから遊ぶ');assert.equal(await phase(),'hold');await click('お話を再開する');await click('はい');}
}
assert.equal(await phase(),'castle');await click('お城へ行く');assert.equal(await phase(),'door');await shot('door');
await page.getByLabel('四桁の数字').fill('1234');await click('数字を合わせる');assert.equal(await phase(),'door');assert.match(await page.locator('#dialogue').innerText(),/まだ鍵は開きません/);
for(let i=0;i<3;i++)await click('扉を詳しく調べる');await page.getByLabel('四桁の数字').fill('５４６７');await click('数字を合わせる');await click('部屋に入る');await shot('room');
for(const color of pinkFirst?['pink','orange']:['orange','pink']){
await click(color==='pink'?'ピンク色の紙を読む':'オレンジ色の紙を読む');await click('紙をもっと調べる');
if(color==='pink'){await page.getByLabel('一つ目の材料').fill('たまご');await page.getByLabel('二つ目の材料').fill('卵');}else await page.getByLabel('野菜の名前').fill('トマト');
await click('名前を唱える');assert.equal(await phase(),color);assert.match(await page.locator('#dialogue').innerText(),/まだ紙ははがれません/);
if(color==='pink'){await page.getByLabel('一つ目の材料').fill('さとう');await page.getByLabel('二つ目の材料').fill('卵');}else await page.getByLabel('野菜の名前').fill('カボチャ');
await click('名前を唱える');assert.equal(await phase(),'paper-solved');await shot(`solved-${color}`);await page.reload();await click('つづきから遊ぶ');assert.equal(await phase(),'paper-solved');await click('つづきを読む');
}
assert.equal(await phase(),'final-ready');await click('魔法のオーブンで料理する');await click('できた料理を見る');await shot('pudding');await click('またあとで');await click('お話を再開する');await click('はい');
for(let i=0;i<3;i++)await click('つづきを読む');assert.equal(await phase(),'complete');await shot('complete');
await click('ここまでのお話を読む');assert.match(await page.locator('#history-content').innerText(),/お取り寄せ/);await click('お話にもどる');
await page.reload();await click('つづきから遊ぶ');assert.equal(await phase(),'complete');await click('最初から遊ぶ');assert.equal(await phase(),'intro');assert.equal(await page.locator('#dialogue .words').count(),1);
assert.deepEqual(errors,[]);console.log(`PASS ${width}px: all three recipes, retries, pause/resume, door, both papers (${pinkFirst?'pink first':'orange first'}), ending, history, restart`);await context.close();
}
// Missing art and malformed storage must not prevent the first playthrough.
const context=await browser.newContext();const page=await context.newPage();await page.route('**/assets/**',r=>r.abort());await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');await page.evaluate(()=>localStorage.setItem('cinderella-first-journey-v1','{"version":1,"state":{"phase":"select"}}'));await page.reload();assert.equal(await page.evaluate(()=>state.phase),'intro');for(let i=0;i<4;i++)await page.getByRole('button',{name:'つづきを読む',exact:false}).click();await page.getByRole('button',{name:'はい',exact:true}).click();assert.equal(await page.locator('.ingredient').count(),2);console.log('PASS missing images and corrupt save recovery');await context.close();
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
