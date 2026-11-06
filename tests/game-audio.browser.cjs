const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({headless:true, executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium', args:['--no-sandbox']});
  try {
    for (const width of [1280,390,320]) {
      const page = await browser.newPage({viewport:{width,height:740}});
      await page.addInitScript(() => {
        window.testMedia = [];
        window.Audio = class {
          constructor(src) {this.src=src;this.plays=0;this.paused=true;testMedia.push(this);}
          play() {this.plays++;this.paused=false;return Promise.resolve();}
          pause() {this.paused=true;}
          removeAttribute() {this.src='';}
          load() {}
        };
      });
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4173');
      assert.equal(await page.evaluate(()=>testMedia.length),0,'no media before opt-in');
      await page.getByRole('button',{name:'⚙ 設定',exact:true}).click();
      for (const channel of ['music','effects']) {
        assert.equal(await page.locator('#'+channel+'-enabled').isChecked(),false);
        await page.locator('#'+channel+'-enabled').check();
      }
      await page.locator('#music-volume').fill('35');
      await page.locator('#effects-volume').fill('60');
      assert.equal(await page.locator('#music-level').textContent(),'35%');
      await page.getByRole('button',{name:'閉じる',exact:true}).click();
      await page.evaluate(()=>{state.chapter=2;move('door');});
      assert.equal(await page.evaluate(()=>testMedia.at(-1).volume),0.35);
      await page.evaluate(()=>render());
      assert.equal(await page.evaluate(()=>testMedia.length),1,'same BGM element on rerender');
      await page.getByRole('button',{name:'⚙ 設定',exact:true}).click();
      assert.equal(await page.evaluate(()=>testMedia.every(m=>m.paused)),true);
      await page.getByRole('button',{name:'閉じる',exact:true}).click();
      await page.waitForFunction(()=>testMedia[0].paused === false);
      await page.evaluate(()=>{
        state=Progress.initialState();state.chapter=0;
        state.round=Journey.createRound(0);state.step=2;
        state.items=state.round.map(r=>r.options.find(x=>['豚肉','じゃがいも','カレールー'].includes(x)));
        state.phase='cooking';state.dish=Journey.recipes[0].target;cookingStep=3;result();
      });
      assert.equal(await page.evaluate(()=>testMedia.filter(m=>m.src.endsWith('success.mp3')).length),1);
      await page.evaluate(()=>render());
      assert.equal(await page.evaluate(()=>testMedia.filter(m=>m.src.endsWith('success.mp3')).length),1,'no duplicate reward on rerender');
      await page.reload();
      assert.equal(await page.evaluate(()=>testMedia.length),0,'restore screen does not replay result cue');
      await page.getByRole('button',{name:'つづきから遊ぶ',exact:true}).click();
      assert.equal(await page.evaluate(()=>testMedia.length),0,'saved result remains silent');
      await page.getByRole('button',{name:'⚙ 設定',exact:true}).click();
      assert.equal(await page.locator('#music-enabled').isChecked(),true);
      assert.equal(await page.locator('#effects-volume').inputValue(),'60');
      await page.locator('#music-enabled').uncheck();
      await page.locator('#effects-enabled').uncheck();
      await page.getByRole('button',{name:'閉じる',exact:true}).click();
      await page.evaluate(()=>{move('door');audio.effect('choose');});
      assert.equal(await page.evaluate(()=>testMedia.length),0,'both channels remain off');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      assert.deepEqual(errors,[]);
      await page.close();
      console.log(`PASS ${width}px: opt-in, independent levels, pause/resume, no repeated reward, saved preferences`);
    }
    const page=await browser.newPage();
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4173');
    for(const file of ['choose','success','other-dish','opening','ending','wish5-harp']) {
      const response=await page.request.get(new URL(`audio/${file}.mp3`,page.url()).href);
      assert.equal(response.status(),200,file);
      assert.ok((await response.body()).length>1000,file);
    }
    await page.evaluate(async()=>{
      const sample=new Audio('audio/choose.mp3');
      await new Promise((resolve,reject)=>{sample.onloadedmetadata=resolve;sample.onerror=()=>reject(Error('media decode failed'));sample.load();});
      if (!(sample.duration>0 && sample.duration<1)) throw Error('selection cue must be brief');
    });
    console.log('PASS six delivered MP3 files and native Chromium media decoding');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
