const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const [width,height] of [[1280,900],[1280,720],[390,740],[320,740],[390,420]]){
const context=await browser.newContext({viewport:{width,height}}),page=await context.newPage();
await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173');
await page.evaluate(()=>{state.chapter=2;move('door');state.readPage=2;render();});
await page.locator('.castle-backdrop').evaluate(img=>img.decode());
const input=page.getByLabel('四桁の数字',{exact:true});
const check=async text=>{assert.equal(await input.inputValue(),text);assert.equal((await page.locator('.door-lock>span').allTextContents()).join(''),text);assert.equal((await page.locator('.door-dial output').allTextContents()).join(''),text);};
await check('0000');
await page.getByRole('button',{name:'1桁目を減らす',exact:true}).click();await check('9000');
await page.getByRole('button',{name:'1桁目を増やす',exact:true}).click();await check('0000');
for(let i=0;i<4;i++)for(let n=0;n<=i;n++)await page.getByRole('button',{name:`${i+1}桁目を増やす`,exact:true}).click();
await check('1234');
await page.getByRole('button',{name:'数字を合わせる',exact:true}).click();
assert.equal(await page.evaluate(()=>state.phase),'door');await check('1234');
await page.getByRole('button',{name:'扉を詳しく調べる',exact:true}).click();await check('1234');
await page.reload();await page.waitForTimeout(320);await page.getByRole('button',{name:'つづきから遊ぶ',exact:true}).click();await check('1234');
await input.fill('５４６７');
assert.equal((await page.locator('.door-lock>span').allTextContents()).join(''),'5467');
assert.equal((await page.locator('.door-dial output').allTextContents()).join(''),'5467');
await input.fill('');assert.equal((await page.locator('.door-lock>span').allTextContents()).join(''),'————');
await page.getByRole('button',{name:'2桁目を増やす',exact:true}).click();await check('0100');
await page.getByRole('button',{name:'4桁目を増やす',exact:true}).focus();await page.keyboard.press('Enter');await check('0101');
for(const button of await page.locator('.door-dial button').all()){const b=await button.boundingBox();assert.ok(b.width>=44&&b.height>=44);}
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
await page.getByRole('button',{name:'数字を合わせる',exact:true}).scrollIntoViewIfNeeded();
if(process.env.SCREENSHOTS)await page.screenshot({path:`${process.env.SCREENSHOTS}/${width}-${height}-dials.png`,fullPage:true});
await input.fill('５４６７');await page.getByRole('button',{name:'数字を合わせる',exact:true}).click();
assert.equal(await page.evaluate(()=>state.phase),'door-open');assert.equal(await page.locator('.door-lock').count(),0);
console.log(`PASS ${width}x${height}: four independent dials, wrap, input sync, wrong answer, hint, resume, keyboard, reveal`);
await context.close();
}}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
