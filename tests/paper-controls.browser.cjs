const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{
for(const [width,height] of [[1280,900],[390,740],[320,740],[390,420]])for(const order of [['orange','pink'],['pink','orange']]){
const page=await browser.newPage({viewport:{width,height}});
await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');
const click=async name=>{for(let i=0;i<12&&await page.locator('#dialogue').getAttribute('data-more')==='true';i++)await page.getByRole('button',{name:'つづきへ',exact:true}).click();await page.getByRole('button',{name,exact:true}).click();};
await page.evaluate(()=>{state.chapter=2;state.orange=false;state.pink=false;move('room');});
for(let i=0;i<2;i++){
const color=order[i];await click(color==='orange'?'オレンジ色の紙を読む':'ピンク色の紙を読む');
const hint=page.getByRole('button',{name:'紙をもっと調べる',exact:true}),back=page.getByRole('button',{name:'紙を選びなおす',exact:true});
assert.equal(await hint.isEnabled(),true);assert.equal(await back.isDisabled(),i===1);
if(color==='orange')await page.getByLabel('野菜の名前').fill('トマト');
else{await page.getByLabel('一つ目の材料').fill('たまご');await page.getByLabel('二つ目の材料').fill('たまご');}
await hint.click();assert.equal(await hint.isDisabled(),true);assert.equal(await back.isDisabled(),i===1);
const lines=await page.locator('#dialogue').innerText();await hint.evaluate(b=>b.click());assert.equal(await page.locator('#dialogue').innerText(),lines);
await page.reload();await page.waitForTimeout(330);await page.getByRole('button',{name:'つづきから遊ぶ',exact:true}).click();
assert.equal(await hint.isDisabled(),true);assert.equal(await back.isDisabled(),i===1);
assert.equal(await page.getByLabel(color==='orange'?'野菜の名前':'一つ目の材料').inputValue(),color==='orange'?'トマト':'たまご');
await click('名前を唱える');assert.equal(await hint.isDisabled(),true);assert.equal(await back.isDisabled(),i===1);
if(color==='orange')await page.getByLabel('野菜の名前').fill('かぼちゃ');
else{await page.getByLabel('一つ目の材料').fill('たまご');await page.getByLabel('二つ目の材料').fill('砂糖');}
await click('名前を唱える');assert.equal(await page.evaluate(()=>state.phase),'paper-solved');await click('つづきへ');
}
assert.equal(await page.evaluate(()=>state.phase),'final-ready');
await page.close();console.log(`PASS paper controls ${width}x${height}, ${order.join(' first, then ')}: hint exhaustion, remaining paper, errors, drafts and resume`);
}
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
