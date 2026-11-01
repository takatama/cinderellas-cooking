'use strict';
const $=id=>document.getElementById(id);
const {dishFor,createRound}=Journey;
const recipe=()=>Journey.recipes[state.chapter||0];
const target=()=>recipe().target;
const initialState=()=>({phase:'intro',introStep:0,introBeat:0,chapter:0,step:0,items:[],dish:null,round:[],orange:false,pink:false,doorHint:0,paperHint:false,message:'',storyStep:0});
const foodAssets={
'豚肉':'pork.webp','しらたき':'shirataki.webp','じゃがいも':'potato.webp',
'たまご':'egg.webp','カレールー':'curry-roux.webp','ちくわぶ':'chikuwabu.webp',
'ひき肉':'ground-meat.webp','パン粉':'breadcrumbs.webp','キャベツ':'cabbage.webp','玉ねぎ':'onion.webp','青のり':'aonori.webp',
'パスタ':'pasta.webp','お米':'rice.webp','トマト':'tomato.webp','ベーコン':'bacon.webp','とり肉':'chicken.webp',
'カレー':'curry.png','おでん':'oden.png','カレー風味のおでん':'curry-oden.png','お料理中':'covered-pot.png',
'ハンバーグ':'hamburg-steak.png','メンチカツ':'menchi-katsu.png','ロールキャベツ':'cabbage-rolls.png',
'野菜炒め':'vegetable-stir-fry.png','コロッケ':'potato-croquettes.png','ポテトサラダ':'potato-salad.png',
'アマトリチャーナ':'amatriciana.png','トマトスパゲティ':'tomato-spaghetti.png','カルボナーラ':'carbonara.png',
'ピラフ':'pilaf.png','チキンライス':'chicken-rice.png','オムライス':'omurice.png','親子丼':'oyakodon.png',
'パンプキンプリン':'pumpkin-pudding.png'
};
function foodImage(name,stage=false){if(!foodAssets[name]){const card=document.createElement('span');card.className=stage?'food-card dish-card':'food-card';card.setAttribute('aria-hidden','true');card.textContent=foodSymbol(name);return card;}const img=document.createElement('img');img.src='assets/'+foodAssets[name];img.alt=stage?name:'';img.width=stage?600:300;img.height=stage?400:200;img.className=stage?'dish-art':'ingredient-art';img.decoding='async';img.draggable=false;img.onerror=()=>{img.hidden=true;if(stage){const note=document.createElement('span');note.className='food-fallback';note.textContent=name==='お料理中'?'お料理中…':name;img.replaceWith(note);}};return img;}
// Preload independent art so later choices and the final reveal are ready in cache.
Object.values(foodAssets).forEach(file=>{const preload=new Image();preload.src='assets/'+file;});
Object.values(CookingArt.vessels).forEach(v=>{const preload=new Image();preload.src='assets/'+v.file;});
let atlasReady=false,helpReady=false;
const resultReady={delighted:false,pleased:false};
const motherReady={normal:false,delighted:false,pleased:false};
const princeReady={normal:false,delighted:false,pleased:false};
function showMother(){return state.chapter===1&&!isCastle()&&motherReady.normal&&helpReady;}
function showPrince(){return state.chapter===2&&!isCastle()&&princeReady.normal&&helpReady;}
const sceneDescriptions=[
'三角の頭巾とエプロン姿のシンデレラが、自分の側の書見台に開いた料理の本を見ながらボウルを混ぜています。',
'お姉さんが料理の本を閉じ、腰の方へ持ち去ります。シンデレラは手を止めています。',
'お姉さんは本を腰の後ろに隠しています。シンデレラは本がなくなった台を見ています。',
'三角の頭巾をかぶったシンデレラが、プレイヤーと目を合わせて手を差し出し、材料選びをお願いします。',
'お姉さんは目を閉じて満面の笑顔。シンデレラもうれしそうです。',
'違う料理もおいしくて、お姉さんは目を開けたまま頬を染めています。'
];
function updateSister(){
updateJourneyArt();
const mother=showMother();
const prince=showPrince();
const princeRequestedMood=prince&&state.phase==='result'?(state.dish===target()?'delighted':'pleased'):null;
const princeMood=princeRequestedMood&&princeReady[princeRequestedMood]?princeRequestedMood:null;
const requestedMood=mother&&state.phase==='result'?(state.dish===target()?'delighted':'pleased'):null;
const motherMood=requestedMood&&motherReady[requestedMood]?requestedMood:null;
$('help-scene').classList.toggle('cinderella-only',mother||prince);
for(const mood of ['normal','delighted','pleased'])$('mother-'+mood).hidden=!mother||(mood!=='normal'&&motherMood!==mood);
for(const mood of ['normal','delighted','pleased'])$('prince-'+mood).hidden=!prince||(mood!=='normal'&&princeMood!==mood);
if(prince){
$('story-scene-frame').hidden=false;
$('art').dataset.scene='3';
$('story-scene').hidden=true;$('help-scene').hidden=false;
$('help-scene').alt='採用した頭巾と結い髪のシンデレラが、こちらへ手を差し出しています。';
$('prince-normal').alt=princeMood==='delighted'?'王子様は目を閉じ、おいしい思い出の料理に感動しています。':princeMood==='pleased'?'王子様は別の料理を味わい、穏やかに微笑んでいます。':'白と青の衣装の王子様が、頬に手を添えて思い出の料理を頼んでいます。';
for(const mood of ['delighted','pleased'])$('sister-'+mood).hidden=true;
return;
}
if(mother){
$('story-scene-frame').hidden=false;
$('art').dataset.scene='3';
$('story-scene').hidden=true;$('help-scene').hidden=false;
$('help-scene').alt='採用した頭巾と結い髪のシンデレラが、こちらへ手を差し出しています。';
$('mother-normal').alt=motherMood==='delighted'?'お母さんはおいしさに目を細め、満足そうな笑みを浮かべています。':motherMood==='pleased'?'お母さんは別の料理にも頬を染め、控えめに微笑んでいます。':'紫の服とまとめ髪のお母さんが、少し気取った表情で料理を頼んでいます。';
for(const mood of ['delighted','pleased'])$('sister-'+mood).hidden=true;
return;
}
if((state.chapter||0)>0||isCastle()){ $('story-scene-frame').hidden=true;return;}
$('story-scene-frame').hidden=false;
const isResult=['result','end'].includes(state.phase);
const frame=state.phase==='intro'?(state.introStep===0?state.introBeat:state.introStep===1?2:3):isResult?(state.dish==='カレー'?4:5):3;
$('art').dataset.scene=String(frame);
const expression=isResult?(state.dish==='カレー'?'delighted':'pleased'):null;
const showResult=expression&&helpReady&&resultReady[expression];
const showHelp=helpReady&&(frame===3||showResult);
$('story-scene').hidden=!atlasReady||showHelp;
$('help-scene').hidden=!showHelp;
$('help-scene').alt=sceneDescriptions[frame];
for(const mood of ['delighted','pleased'])$('sister-'+mood).hidden=!(showResult&&expression===mood);
$('story-scene').style.left=-(frame%2)*100+'%';
$('story-scene').style.top=-Math.floor(frame/2)*100+'%';
$('story-scene').alt=sceneDescriptions[frame];
}
function updateTable(){const table=$('table-ingredients');const items=['select','ready'].includes(state.phase)?state.items:[];const current=[...table.children].map(el=>el.dataset.food);if(current.some((name,i)=>items[i]!==name)||current.length>items.length)table.replaceChildren();items.slice(table.children.length).forEach(name=>{const item=document.createElement('figure');item.setAttribute('role','listitem');item.dataset.food=name;item.append(foodImage(name));const caption=document.createElement('figcaption');caption.textContent=name;item.append(caption);table.append(item);});table.hidden=!items.length;}
let cookingStep=0, cookingTimer;
function pauseCooking(){clearTimeout(cookingTimer);$('art').classList.add('effects-paused');}
// Only cookware stages advance on a timer. Revealing the dish is manual.
function scheduleCooking(){pauseCooking();if(state.phase!=='cooking'||document.hidden||document.querySelector('dialog[open]'))return;$('art').classList.remove('effects-paused');if(cookingStep>=3)return;cookingTimer=setTimeout(()=>{cookingStep++;updateCookingControls();saveProgress();scheduleCooking();},900);}
let state=initialState(),history=[],sound=false,voices=[],audioContext;
let savedProgress=null;
try{const saved=JSON.parse(localStorage.getItem('cinderella-first-journey-v1'));if(validSave(saved))savedProgress=saved;}catch{}
const reduced=matchMedia('(prefers-reduced-motion: reduce)');$('reduce').checked=reduced.matches;
const titles={pause:['またあとで',''],intro:['はじまり','01 / 06'],select:['材料をえらぶ','02 / 06'],ready:['さあ、お料理','03 / 06'],cooking:['シンデレラにおまかせ','04 / 06'],result:['できたてを、どうぞ','05 / 06'],end:['最初の一皿、おしまい','06 / 06']};
function stopAudio(){if('speechSynthesis'in window)speechSynthesis.cancel();if(audioContext){audioContext.close().catch(()=>{});audioContext=null;}}
function say(text){stopAudio();if(!sound||!('speechSynthesis'in window))return;try{const u=new SpeechSynthesisUtterance(text);u.lang='ja-JP';u.rate=.93;const v=speechSynthesis.getVoices().find(v=>v.lang.startsWith('ja'));if(v)u.voice=v;u.onerror=()=>{};speechSynthesis.speak(u);}catch{}}
function tone(){if(!sound)return;try{const A=window.AudioContext||window.webkitAudioContext;audioContext=new A();const o=audioContext.createOscillator(),g=audioContext.createGain();o.type='sine';o.frequency.setValueAtTime(550,audioContext.currentTime);o.frequency.exponentialRampToValueAtTime(825,audioContext.currentTime+.18);g.gain.setValueAtTime(.035,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+.3);o.connect(g).connect(audioContext.destination);o.start();o.stop(audioContext.currentTime+.3);}catch{}}
function line(who,text){return {who,text};}
function log(title,lines){history.push({title,lines});if(history.length>300)history.shift();saveProgress();}
function content(){const {phase,step,items,dish}=state;
if(phase==='resume')return {lines:[line('ものがたり','前のお話のつづきが残っています。')],buttons:[['つづきから遊ぶ',restoreProgress],['最初から遊ぶ',restartStory]]};
const story=journeyContent();if(story)return story;
if(phase==='intro'){
const pages=[
[line('ものがたり','料理が得意なシンデレラ。'),...(state.introBeat>=1?[line('ものがたり','しかし、おねえさんがいじわるをして、')]:[]),...(state.introBeat>=2?[line('ものがたり','大切な料理の本を隠してしまいました。')]:[])],
[line('ものがたり','それなのに、お姉さんは料理を頼んできます。'),line('お姉さん','シンデレラ、カレーを作っておいてね。')],
[line('シンデレラ','材料さえ分かれば、おいしいカレーが作れるのに！'),line('ものがたり','シンデレラのために、カレーの材料を選んであげますか？')]
];
return {lines:pages[state.introStep],prologue:state.introStep===0,buttons:state.introStep===pages.length-1?[['はい',start],['いいえ',deferHelp]]:[['つづきを読む　→',advanceIntro]]};
}
if(phase==='pause')return {lines:[line('シンデレラ','また会えるのを楽しみにしているね。')],buttons:[['お願いにもどる',resumeHelp]]};
if(phase==='select'){
const current=state.round[step];
return {lines:state.chapter===0&&current.pairIndex===0?[line('シンデレラ','カレーといえば、しらたき、かしら？')]:state.chapter===0&&current.pairIndex===2?[line('ものがたり','（シンデレラは、ちくわぶをじっと見つめています……）')]:[],question:step===0?`${target()}に入れるのは、どっち？`:step===1?'２つ目の材料は？':'最後の材料は？',choices:current.options};
}
if(phase==='ready')return {lines:[line('シンデレラ',`${items.join('、')}だね。どうもありがとう！`),line('シンデレラ','ようし、あとは私にまかせて！')],buttons:[['お料理をお願いする　→',cook],['材料を選びなおす',start]],hint:'選んだ材料で、シンデレラが料理します。'};
if(phase==='cooking')return {lines:currentCookingBeats().slice(0,3).map(beat=>line('ものがたり',beat.join(''))),montage:true,buttons:[['できた料理を見る',result],['できあがりまで進む',()=>{pauseCooking();cookingStep=3;updateCookingControls();saveProgress();}]]};
if(phase==='result')return cookingResult();
return {lines:[],buttons:[]};
}
function button(label,action,secondary=false){const b=document.createElement('button');b.type='button';b.className=secondary?'secondary':'primary';b.textContent=label.replace(/\s*[→↻]/g,'').trim();b.onclick=e=>{if(e.detail>1)return;stopAudio();action();};return b;}
// Page identity excludes hints and feedback so puzzle updates never reset the reader.
function pageKey(){return [state.phase,state.chapter,state.introStep,state.introBeat,state.step,state.storyStep,state.phase==='cooking'?'montage':cookingStep].join(':');}
// Keep complete utterances together; spend a page turn on a change of scene or a substantial passage.
function dialoguePages(lines){
const pages=[];let page=[],size=0;
for(const l of lines){const cost=l.text.length+(page.at(-1)?.who===l.who?0:10);
if(page.length&&size+cost>95){pages.push(page);page=[];size=0;}
if(page.at(-1)?.who===l.who)page.at(-1).text+=' '+l.text;else page.push({...l});
size+=cost;
}if(page.length)pages.push(page);return pages.length?pages:[[]];
}
let choiceReadyAt=0;
function render(focus=true,speechOverride=null){
updateSister();updateTable();const original=content(),key=pageKey();
if(state.readKey!==key||state.readLayout!==2){state.readKey=key;state.readPage=0;state.readLayout=2;}
const sourceLines=original.prologue?original.lines.slice(-1):original.lines;
const pages=dialoguePages(sourceLines);
const prelude=original.form==='door'?2:0;
const paged=!original.form&&!original.choices&&!original.montage;
const index=Math.min(state.readPage||0,original.form?prelude:Math.max(0,pages.length-1));state.readPage=index;
const more=original.form?index<prelude:paged&&index<pages.length-1;
const c={...original,lines:original.form?(more?sourceLines.slice(index,index+1):sourceLines.slice(prelude)):paged?pages[index]:sourceLines};
if(more&&original.form){c.form=null;c.buttons=[];}
$('request').hidden=isCastle()||state.phase==='resume'||state.phase==='intro'&&state.introStep===0;
$('cinderella-aside').hidden=true;
$('phase').textContent=state.phase==='select'?`材料えらび ${state.step+1} / 3`:(titles[state.phase]||[journeyTitle()])[0];
if(paged&&pages.length>1)$('phase').textContent+=`　${index+1} / ${pages.length}`;
renderDialogue(c);$('dialogue').dataset.more=String(more);$('page').classList.toggle('puzzle',!!c.form);
if(c.question){const q=document.createElement('h1');q.className='question';q.textContent=c.question;$('dialogue').prepend(q);}
$('actions').replaceChildren();$('advance').replaceChildren();
$('actions').className='actions';$('page').classList.toggle('montage',!!c.montage);
const next=(action,label='つづきへ')=>{$('advance').append(button(label,action));};
if(more)next(()=>{state.readPage++;render();});
else if(c.choices){
const choices=document.createElement('div');choices.className='choices';choiceReadyAt=performance.now()+300;
for(const name of c.choices){const b=button('',()=>{if(performance.now()<choiceReadyAt)return;choose(name);});b.className='ingredient';b.setAttribute('aria-label',name+'を選ぶ');const text=document.createElement('strong');text.textContent=name;b.append(foodImage(name),text);choices.append(b);}
$('actions').append(choices);
}else if(c.form){for(const [label,action] of c.buttons)$('actions').append(button(label,action,true));renderAnswerForm(c.form);}
else if(c.paper)renderPaperChoices();
else {
const decisions=c.buttons.length>1&&['intro','mother','prince','castle','final-result','resume','complete'].includes(state.phase);
if(decisions){const choices=document.createElement('div');choices.className='decisions';choiceReadyAt=performance.now()+300;c.buttons.forEach(([label,action],i)=>choices.append(button(label,()=>{if(performance.now()>=choiceReadyAt)action();},i>0)));$('advance').append(choices);}
else c.buttons.forEach(([label,action],i)=>{if(i>0)$('advance').prepend(button(label,action,true));else next(action,/つづきを読む/.test(label)?'つづきへ':label);});
}
$('advance').classList.toggle('inactive',!$('advance').childElementCount);
$('dialogue').classList.toggle('can-read',!![...$('advance').querySelectorAll('.primary')].find(b=>b.textContent==='つづきへ'));
if(c.montage)updateCookingControls();
$('guidance').hidden=true;
updateStageArt();$('art-caption').hidden=true;
saveProgress();
if(focus){$('dialogue').setAttribute('tabindex','-1');$('dialogue').focus({preventScroll:true});}
if(speechOverride!=='')say(speechOverride??((c.question?c.question+'。':'')+c.lines.map(l=>l.text).join('。')));
}
function updateCookingControls(){
$('advance').querySelector('.primary').disabled=cookingStep<3;$('advance').querySelector('.secondary').disabled=cookingStep>=3;$('art').dataset.beat=String(cookingStep);
updateStageArt();
}
function updateStageArt(){
const cooking=state.phase==='cooking',oven=state.phase==='final-cooking';
const stage=cooking?CookingArt.stageFor(state.dish,cookingStep):null;
const name=cooking?'お料理中':state.phase==='result'?state.dish:['final-result','ending'].includes(state.phase)?'パンプキンプリン':'';
const object=$('stage-object'),key=name+'|'+(stage?.vessel||'');
object.dataset.food=name;object.dataset.vessel=stage?.vessel||'';
if(object.dataset.artKey!==key){
object.dataset.artKey=key;object.replaceChildren();
if(stage){const vessel=CookingArt.vessels[stage.vessel],img=document.createElement('img');img.src='assets/'+vessel.file;img.alt=vessel.alt;img.width=600;img.height=400;img.className='dish-art cookware-art';img.draggable=false;
img.onerror=()=>{const note=document.createElement('span');note.className='food-fallback';note.textContent=vessel.alt;img.replaceWith(note);};object.append(img);
}else if(name)object.append(foodImage(name,true));
}
const warm=state.phase==='result'&&CookingArt.planFor(state.dish).servedSteam;
$('steam').classList.toggle('active',stage?.effect==='steam'||warm);
$('oil-bubbles').hidden=stage?.effect!=='oil';
$('art').classList.toggle('cooking',cooking);$('art').classList.toggle('oven-working',oven);
$('art').dataset.cookingMethod=cooking?CookingArt.planFor(state.dish).method:oven?'oven':'';
$('art').dataset.cookware=stage?.vessel||'';
$('art').dataset.beat=String(cookingStep);
}
function advanceDialogue(){
if(document.querySelector('dialog[open]')||window.getSelection()?.toString())return;
const next=$('advance').querySelector('.primary');if(next?.textContent==='つづきへ'&&!next.disabled)next.click();
}
$('dialogue').addEventListener('click',e=>{if(e.detail<=1)advanceDialogue();});
$('dialogue').addEventListener('keydown',e=>{if(!e.repeat&&(e.key==='Enter'||e.key===' ')&&$('dialogue').classList.contains('can-read')){e.preventDefault();advanceDialogue();}});
function renderDialogue(c){
const dialogue=$('dialogue');dialogue.replaceChildren();dialogue.scrollTop=0;
let previousWho=null;for(const l of c.lines){const box=document.createElement('div');box.className='speech '+(l.who==='ものがたり'?'narrator':l.who==='お姉さん'?'sister':'');const name=document.createElement('p');name.className='name';name.textContent=l.who;const words=document.createElement('p');words.className='words';words.textContent=l.text;if(previousWho!==l.who&&l.who!=='ものがたり')box.append(name);box.append(words);dialogue.append(box);previousWho=l.who;}
}
function advanceIntro(){
if(state.phase!=='intro'||state.introStep>=2)return;
if(state.introStep===0&&state.introBeat<2){
 state.introBeat++;
 render(false,state.introBeat===1?'しかし、おねえさんがいじわるをして、':'大切な料理の本を隠してしまいました。');
 return;
}
log('はじまり',content().lines);state.introStep++;render();
}
function deferHelp(){if(state.phase!=='intro'||state.introStep!==2)return;state.phase='pause';render();}
function resumeHelp(){if(state.phase!=='pause')return;state.phase='intro';state.introStep=2;render();}
function start(){pauseCooking();stopAudio();if(state.phase==='intro')log('台所のお願い',content().lines);state={...state,phase:'select',step:0,items:[],dish:null,round:createRound(state.chapter||0),message:''};render();}
function choose(name){if(state.phase!=='select'||!state.round[state.step].options.includes(name))return;stopAudio();state.items.push(name);if(state.step===2)state.phase='ready';else state.step++;render();}
function cook(){if(state.phase!=='ready')return;state.dish=dishFor(state.items,state.chapter||0);log('選んだ材料',[line('あなた',state.items.join('、'))]);state.phase='cooking';cookingStep=0;render();log('お料理',content().lines);scheduleCooking();}
function result(){if(state.phase!=='cooking'||cookingStep<3)return;pauseCooking();state.phase='result';render();log('できたての一皿',content().lines);}
function end(){move('mother');}
function openHistory(){pauseCooking();stopAudio();$('history-content').replaceChildren();if(!history.length){const p=document.createElement('p');p.textContent='お話は、これからはじまります。';$('history-content').append(p);}history.forEach(entry=>{const a=document.createElement('article'),h=document.createElement('h3');h.textContent=entry.title;a.append(h);entry.lines.forEach(l=>{const p=document.createElement('p');p.textContent=l.who+'：'+l.text;a.append(p);});$('history-content').append(a);});$('history-dialog').showModal();}
$('sound').onclick=()=>{sound=!sound;$('sound').setAttribute('aria-pressed',String(sound));$('sound').setAttribute('aria-label',sound?'読み上げをオフにする':'読み上げをオンにする');$('sound').innerHTML=sound?'♫ <span>読み上げ</span>':'♫ <span>音なし</span>';if(sound)say($('dialogue').innerText);else stopAudio();};
if(!('speechSynthesis'in window)){$('sound').hidden=true;}
$('settings').onclick=()=>{pauseCooking();stopAudio();$('settings-dialog').showModal();};$('reduce').onchange=()=>document.body.classList.toggle('reduced',$('reduce').checked);document.body.classList.toggle('reduced',$('reduce').checked);
$('restart').onclick=()=>{$('settings-dialog').close();restartStory();};$('history').onclick=openHistory;
document.querySelectorAll('dialog .close').forEach(b=>b.onclick=()=>{stopAudio();b.closest('dialog').close();});document.querySelectorAll('dialog').forEach(d=>{d.addEventListener('cancel',stopAudio);d.addEventListener('close',()=>{scheduleCooking();});});document.addEventListener('visibilitychange',()=>{if(document.hidden){stopAudio();pauseCooking();}else{scheduleCooking();}});window.addEventListener('pagehide',()=>{stopAudio();pauseCooking();});
function fitScene(){
const ratio=$('scene').naturalWidth?$('scene').naturalWidth/$('scene').naturalHeight:1.5;
// Let a narrow illustration shorten its frame; the dialogue absorbs the spare height.
const storyMinimum=matchMedia('(max-width: 760px)').matches?354:340;
const artHeight=Math.min($('art').clientWidth/ratio,Math.max(0,$('page').clientHeight-storyMinimum));
$('page').style.setProperty('--art-height',artHeight+'px');
const width=Math.min($('art').clientWidth,$('art').clientHeight*ratio);
$('art').style.setProperty('--scene-width',width+'px');
$('art').style.setProperty('--scene-height',width/ratio+'px');
$('scene-canvas').style.width=width+'px';$('scene-canvas').style.height=width/ratio+'px';
}
function atlasLoaded(){atlasReady=true;fitScene();updateSister();}
if('ResizeObserver'in window){const observer=new ResizeObserver(fitScene);observer.observe($('art'));observer.observe($('page'));}
else window.addEventListener('resize',fitScene);
$('scene').onload=fitScene;
$('scene').onerror=()=>{$('scene').hidden=true;};
$('story-scene').onload=atlasLoaded;
$('story-scene').onerror=()=>{atlasReady=false;updateSister();};
if($('scene').complete&&!$('scene').naturalWidth)$('scene').hidden=true;
if($('story-scene').complete&&$('story-scene').naturalWidth)atlasLoaded();
if(savedProgress)state.phase='resume';
fitScene();render(false);

function helpLoaded(){helpReady=true;updateSister();}
$('help-scene').onload=helpLoaded;
$('help-scene').onerror=()=>{helpReady=false;updateSister();};
if($('help-scene').complete&&$('help-scene').naturalWidth)helpLoaded();
for(const [actor,ready] of [['mother',motherReady],['prince',princeReady]])for(const mood of ['normal','delighted','pleased']){
const img=$(actor+'-'+mood);
const loaded=()=>{ready[mood]=true;updateSister();};
img.onload=loaded;
img.onerror=()=>{ready[mood]=false;updateSister();};
if(img.complete&&img.naturalWidth)loaded();
}
// Keep the adopted character artwork fixed; reveal only the sister's facial features.
for(const mood of ['delighted','pleased']){
const img=$('sister-'+mood);
const loaded=()=>{resultReady[mood]=true;updateSister();};
img.onload=loaded;
img.onerror=()=>{resultReady[mood]=false;updateSister();};
if(img.complete&&img.naturalWidth)loaded();
}

function isCastle(){return ['castle','door','door-open','room','orange','pink','paper-solved','final-ready','final-cooking','final-result','ending','complete'].includes(state.phase);}
function journeyTitle(){return ({resume:'つづきから',mother:'お母さんのお願い',prince:'香りに誘われて',castle:'お城へ',door:'魔法使いの部屋', 'door-open':'開いた扉',room:'二色の紙',orange:'オレンジ色の紙',pink:'ピンク色の紙','paper-solved':'消えた紙','final-ready':'魔法のオーブン','final-cooking':'プリンを焼きましょう','final-result':'王子様の願い',ending:'シンデレラの会社',complete:'おしまい',hold:'またあとで'})[state.phase]||'お料理';}
function move(phase){pauseCooking();stopAudio();state.phase=phase;state.message='';state.paperHint=false;if(phase==='mother')state.chapter=1;if(phase==='prince')state.chapter=2;render();log(journeyTitle(),content().lines);}
function hold(){state.returnPhase=state.phase;move('hold');}
function resumeStory(){move(state.returnPhase||'castle');}
function restartStory(){pauseCooking();stopAudio();savedProgress=null;state=initialState();history=[];cookingStep=0;$('dialogue').dataset.page='';$('actions').dataset.page='';render();}
function restoreProgress(){if(!savedProgress)return;state=savedProgress.state;history=savedProgress.history;cookingStep=savedProgress.cookingStep;savedProgress=null;render();scheduleCooking();}
function validSave(saved){
if(!saved||saved.version!==1||!saved.state||!Array.isArray(saved.history)||saved.history.length>1000)return false;
const s=saved.state,phases=['intro','pause','select','ready','cooking','result','mother','prince','castle','door','door-open','room','orange','pink','paper-solved','final-ready','final-cooking','final-result','ending','complete','hold'];
if(!phases.includes(s.phase)||![0,1,2].includes(s.chapter)||!Number.isInteger(s.step)||s.step<0||s.step>2||!Array.isArray(s.items)||s.items.length>3||!Array.isArray(s.round)||![0,1,2,3].includes(saved.cookingStep))return false;
if(s.answerDraft!==undefined&&(!s.answerDraft||typeof s.answerDraft!=='object'||Array.isArray(s.answerDraft)||Object.values(s.answerDraft).some(v=>!v||typeof v!=='object'||Object.values(v).some(x=>typeof x!=='string'||x.length>30))))return false;
if(s.readPage!==undefined&&(!Number.isInteger(s.readPage)||s.readPage<0||s.readPage>20))return false;
if(!Number.isInteger(s.storyStep)||s.storyStep<0||s.storyStep>2)return false;
if(![0,1,2].includes(s.introStep)||![0,1,2].includes(s.introBeat)||!Number.isInteger(s.doorHint)||s.doorHint<0||s.doorHint>3||typeof s.orange!=='boolean'||typeof s.pink!=='boolean')return false;
if(['select','ready','cooking','result'].includes(s.phase)){
if(s.round.length!==3||new Set(s.round.map(r=>r.pairIndex)).size!==3)return false;
for(const r of s.round){const p=Journey.recipes[s.chapter].pairs[r.pairIndex];if(!p||!Array.isArray(r.options)||r.options.length!==2||new Set(r.options).size!==2||!r.options.every(x=>p.includes(x)))return false;}
if(s.items.some((x,i)=>!s.round[i].options.includes(x)))return false;
if(s.phase==='select'&&s.items.length!==s.step)return false;
if(s.phase!=='select'&&s.items.length!==3)return false;
if(['cooking','result'].includes(s.phase)&&s.dish!==dishFor(s.items,s.chapter))return false;
}
if(s.phase==='hold'&&!['mother','prince','castle','final-result'].includes(s.returnPhase))return false;
return saved.history.every(e=>e&&typeof e.title==='string'&&Array.isArray(e.lines)&&e.lines.every(l=>typeof l.who==='string'&&typeof l.text==='string'));
}
function saveProgress(){if(state.phase==='resume')return;try{localStorage.setItem('cinderella-first-journey-v1',JSON.stringify({version:1,state,history,cookingStep}));}catch{}}
function cookingResult(){
const correct=state.dish===target(),who=recipe().who;
if(state.chapter===0)return correct?{lines:[line('ものがたり','カレーのできあがり！'),line(who,'ふうん、まあまあね。……おかわり、大盛りで！')],buttons:[['おかわりをよそう　→',()=>move('mother')]]}:{lines:[line('ものがたり',`${state.dish}ができました！`),line(who,'おいしいけれど、カレーとはちょっと違うわね。'),line('シンデレラ','もう一度、作ってみよう！')],buttons:[['材料を選びなおす　↻',start]]};
if(correct)return {lines:[line('ものがたり',`${state.dish}のできあがり！`),line(who,state.chapter===1?'ふうん、まあまあね。もっと食べるから、たくさんよこしなさい。':'これは、すごい！なんておいしいアマトリチャーナなんだ！')],buttons:[['つづきを読む　→',()=>move(state.chapter===1?'prince':'castle')]]};
const lines=[line('ものがたり',`${state.dish}ができました！`),line(who,state.chapter===1?`あら、これは${target()}とは言えないわね。`:`とてもおいしいけれど、${target()}とは違いますね。`)];
if(state.chapter===2)lines.push(line(who,'イタリアのアマトリーチェという町で食べた、パスタにからまったトマトとベーコンの味が忘れられないのです。'));
lines.push(line('シンデレラ','もう一度、作ってみよう！'));return {lines,buttons:[['材料を選びなおす　↻',start]]};
}
function journeyContent(){
const n=t=>line('ものがたり',t),p=t=>line('王子様',t);
switch(state.phase){
case 'mother':return {lines:[n('それを見ていたお母さん。'),line('お母さん','私にはハンバーグを作って。'),n('シンデレラのために、ハンバーグの材料を選んであげますか？')],buttons:[['はい',start],['いいえ',hold]]};
case 'prince':return {lines:[n('あれ？ 馬の足音が聞こえてきます。王子様が現れました。'),p('おいしそうな匂いに引き寄せられてしまいました。私のためにアマトリチャーナを作ってくれませんか？'),n('シンデレラのために、アマトリチャーナの材料を選んであげますか？')],buttons:[['はい',start],['いいえ',hold]]};
case 'hold':return {lines:[line('シンデレラ','また会えるのを楽しみにしているね。')],buttons:[['お話を再開する',resumeStory]]};
case 'castle':return {lines:[p('あなたたちなら、王国に伝わる魔法の道具を使いこなせるかもしれない。お城に来てくれますか？'),n('王子様と一緒に、お城へ行きますか？')],buttons:[['お城へ行く　→',()=>move('door')],['またあとで',hold]]};
case 'door':{
const lines=[n('お城の奥に、大きな扉があります。'),p('この部屋は、料理の上手な魔法使いが使っていました。別の国へ出かけてしまい、今は誰も入れないのです。'),n(`扉には「${doorInscription()}」と書いてあります。鍵を開けるには、四つの数字が必要です。`)];
if(state.doorHint>=1)lines.push(n('その横には「青は十五」と書いてあります。'));
if(state.doorHint>=2)lines.push(n('ひらがなを「あ・い・う・え・お・か・き・く・け・こ」の順に並べて考えてみましょう。'));
if(state.doorHint>=3)lines.push(n('「あ」は1、「い」は2。……「お」は5、「え」は4、「か」は6、「き」は7です。'));
if(state.message)lines.push(n(state.message));return {lines,form:'door',buttons:[['扉を詳しく調べる',()=>{state.doorHint=Math.min(3,state.doorHint+1);state.message='';render();}]]};}
case 'door-open':return {lines:[n('鍵の数字を合わせると、扉が開きました！'),p('さあ、中へ入りましょう。')],buttons:[['部屋に入る　→',()=>move('room')]]};
case 'room':return {lines:[n('部屋の中には、魔法のオーブンが置いてあります。'),n(state.orange?'ピンク色の紙が残っています。':state.pink?'オレンジ色の紙が残っています。':'オレンジ色とピンク色の、二枚の紙が貼りつけてあります。'),n('どちらの紙を読みますか？')],paper:true,buttons:[]};
case 'orange':{
const lines=[n('この道具は、ある材料を料理するために作られた。その材料の名前を呼ぶと、この紙がはがれ、料理ができるようになる。'),n('その材料とは、カンボジアから伝わった、カンボジアのような名前の野菜だ。')];
if(state.paperHint)lines.push(n('南の瓜とも呼ばれる、北海道でたくさん取れる、外は緑で、中はオレンジの野菜です。'));
if(state.message)lines.push(n(state.message));return {lines,form:'orange',buttons:[['紙をもっと調べる',()=>{state.paperHint=true;render();}],['紙を選びなおす',()=>move('room')]]};}
case 'pink':{
const lines=[n('二つの材料の名前を呼ぶと、この紙がはがれ、料理ができるようになる。'),n('材料は二つ。「たさまとごう」')];
if(state.paperHint)lines.push(n('どうやら、二つの材料の名前がバラバラに書いてあるみたいです。六つの文字を、三文字ずつに並べ替えてみましょう。'));
if(state.message)lines.push(n(state.message));return {lines,form:'pink',buttons:[['紙をもっと調べる',()=>{state.paperHint=true;render();}],['紙を選びなおす',()=>move('room')]]};}
case 'paper-solved':return {lines:[n(state.message),n(state.orange&&state.pink?'二枚の紙がなくなり、魔法のオーブンが使えるようになりました！':state.orange?'ピンク色の紙が残っています。':'オレンジ色の紙が残っています。')],buttons:[['つづきを読む　→',()=>move(state.orange&&state.pink?'final-ready':'room')]]};
case 'final-ready':return {lines:[line('シンデレラ','かぼちゃと、たまごと、砂糖！ そうだ、これでパンプキンプリンを作ったら、絶対においしいはず！')],buttons:[['魔法のオーブンで料理する　→',()=>move('final-cooking')]]};
case 'final-cooking':return {lines:[n('シンデレラは、かぼちゃ、たまご、砂糖を使ってプリンを作ります。'),n('魔法のオーブンの中で、プリンがゆっくり焼き上がりました。')],buttons:[['できた料理を見る　→',()=>move('final-result')]]};
case 'final-result':return {lines:[n('パンプキンプリンのできあがり！ 王子様がひとくち食べました。'),p('すごい！ すごい！ 素晴らしい！ なんておいしいパンプキンプリンなんだ！'),p('この素晴らしい味を、一人でも多くの国民に届けたいです。協力してくださいますか？')],buttons:[['はい',()=>{state.storyStep=0;move('ending');}],['またあとで',hold]]};
case 'ending':{
const pages=[[p('どうもありがとうございます！ それでは、私が出資しますので、パンプキンプリンの会社を作りましょう。')],[n('シンデレラの会社は大繁盛。シンデレラは王子様と一緒に、幸せに暮らしましたとさ。')],[n('え？ 意地悪なお姉さんとお母さんですか？'),n('今でもシンデレラの料理が忘れられず、こっそりシンデレラの会社から、お取り寄せしているようですよ。')]];
return {lines:pages[state.storyStep]||pages[0],buttons:[['つづきを読む　→',()=>{if(state.storyStep<2){state.storyStep++;render();log('おわりのお話',content().lines);}else move('complete');}]]};}
case 'complete':return {lines:[n('これで「シンデレラの料理」は、おしまいです。'),line('シンデレラ','最後まで手伝ってくれて、どうもありがとう！')],buttons:[['ここまでのお話を読む',openHistory],['最初から遊ぶ',restartStory]]};
default:return null;
}}
function doorDigits(){
const raw=state.answerDraft?.door?.['四桁の数字']??'0000';
const value=raw.replace(/[０-９]/g,c=>String(c.charCodeAt(0)-0xff10));
return Array.from({length:4},(_,i)=>/[0-9]/.test(value[i]||'')?value[i]:'—');
}
function syncDoorDials(){
const digits=doorDigits();
document.querySelectorAll('[data-door-digit]').forEach(el=>{const value=digits[Number(el.dataset.doorDigit)];if(el.textContent!==value)el.textContent=value;});
}
function turnDoorDial(index,delta){
const digits=doorDigits().map(d=>d==='—'?'0':d);
digits[index]=String((Number(digits[index])+delta+10)%10);
state.answerDraft??={};state.answerDraft.door??={};
state.answerDraft.door['四桁の数字']=digits.join('');
const input=$('door-answer');if(input)input.value=digits.join('');
syncDoorDials();saveProgress();
}
function renderDoorDials(){
const controls=document.createElement('div');controls.className='door-dials';controls.setAttribute('role','group');controls.setAttribute('aria-label','錠前の四つのダイアル');
for(let i=0;i<4;i++){
const wheel=document.createElement('div');wheel.className='door-dial';
const makeTurn=(delta,symbol)=>{const b=document.createElement('button');b.type='button';b.textContent=symbol;b.setAttribute('aria-label',`${i+1}桁目を${delta>0?'増やす':'減らす'}`);b.onclick=()=>{stopAudio();turnDoorDial(i,delta);};return b;};
const value=document.createElement('output');value.dataset.doorDigit=i;value.textContent=doorDigits()[i];value.setAttribute('aria-label',`${i+1}桁目`);value.setAttribute('aria-live','polite');
wheel.append(makeTurn(1,'▴'),value,makeTurn(-1,'▾'));controls.append(wheel);
}
return controls;
}
function renderAnswerForm(kind){
const form=document.createElement('form');form.className='answer-form';
const makeInput=(label,placeholder)=>{const wrap=document.createElement('label');wrap.textContent=label;const input=document.createElement('input');input.type='text';input.required=true;input.maxLength=kind==='door'?4:30;input.placeholder=placeholder;input.autocomplete='off';input.value=state.answerDraft?.[kind]?.[label]||'';input.oninput=()=>{state.answerDraft??={};state.answerDraft[kind]??={};state.answerDraft[kind][label]=input.value;saveProgress();};input.onkeydown=e=>{if(e.key==='Enter'&&e.isComposing)e.preventDefault();};if(kind==='door'){input.inputMode='numeric';input.pattern='[0-9０-９]{4}';}wrap.append(input);form.append(wrap);return input;};
const a=makeInput(kind==='door'?'四桁の数字':kind==='pink'?'一つ目の材料':'野菜の名前',kind==='door'?'0000':kind==='pink'?'材料の名前':'野菜の名前');const b=kind==='pink'?makeInput('二つ目の材料','材料の名前'):null;
if(kind==='door'){
a.id='door-answer';a.value=state.answerDraft?.door?.['四桁の数字']??'0000';
const saveInput=a.oninput;a.oninput=()=>{saveInput();syncDoorDials();};
form.prepend(renderDoorDials());
}
const submit=document.createElement('button');submit.type='submit';submit.className='primary';submit.textContent=kind==='door'?'数字を合わせる':'名前を唱える';form.append(submit);
form.onsubmit=e=>{e.preventDefault();stopAudio();const correct=kind==='door'?Journey.doorAnswer(a.value):kind==='orange'?Journey.orangeAnswer(a.value):Journey.pinkAnswer(a.value,b.value);
if(!correct){state.message=kind==='door'?'まだ鍵は開きません。もう一度、数字を合わせてみましょう。':'まだ紙ははがれません。もう一度、名前を考えてみましょう。';render();$('actions').querySelector('input')?.focus();return;}
if(kind==='door'){move('door-open');return;}
state[kind]=true;state.phase='paper-solved';state.message=kind==='orange'?'「かぼちゃ」と唱えると、オレンジ色の紙が消えてなくなりました！':'「たまご」と「砂糖」を唱えると、ピンク色の紙が消えてなくなりました！';render();log('紙のなぞ',content().lines);
};$('actions').prepend(form);
}
function renderPaperChoices(){for(const color of ['orange','pink']){if(state[color])continue;const b=button(color==='orange'?'オレンジ色の紙を読む':'ピンク色の紙を読む',()=>move(color));b.classList.add('paper-button',color);$('actions').append(b);}}
function foodSymbol(name){return ({'ひき肉':'🥩','パン粉':'🍞','玉ねぎ':'🧅','青のり':'🌿','キャベツ':'🥬','パスタ':'🍝','お米':'🍚','トマト':'🍅','ベーコン':'🥓','とり肉':'🍗','ハンバーグ':'🍽️','メンチカツ':'🍽️','ロールキャベツ':'🥬','野菜炒め':'🥬','コロッケ':'🥔','ポテトサラダ':'🥔','アマトリチャーナ':'🍝','トマトスパゲティ':'🍝','カルボナーラ':'🍝','ピラフ':'🍚','チキンライス':'🍚','オムライス':'🍳','親子丼':'🍚','パンプキンプリン':'🍮'})[name]||'🍽️';}
// Keep the inscription outside the artwork so later journeys can replace it.
function doorInscription(){return 'おえかき';}
// Reuse adopted pixels in the finale; expressions still cover only the face.
function addFinaleCast(picture,scene){
const cast=document.createElement('div');cast.className='finale-cast';cast.setAttribute('aria-hidden','true');
const actor=(name,file,expression)=>{
const group=document.createElement('div');group.className='finale-actor finale-'+name;
const base=document.createElement('img');base.src='assets/'+file;base.alt='';base.draggable=false;
base.onerror=()=>{group.hidden=true;};group.append(base);
if(expression){const face=document.createElement('img');face.src='assets/'+expression;face.alt='';face.className='finale-expression';face.draggable=false;face.onerror=()=>{face.hidden=true;};group.append(face);}
cast.append(group);
};
if(scene==='mail-order'){
actor('sister','help-characters.png','sister-pleased.png');
actor('mother','mother.png','mother-pleased.png');
}else{
actor('cinderella','help-characters.png');
if(scene!=='thanks')actor('prince','prince.png',scene==='investment'?'prince-pleased.png':'prince-delighted.png');
}
picture.append(cast);
if(scene==='tasting'||scene==='investment'){
const table=document.createElement('div');table.className='finale-table';
const img=document.createElement('img');img.src='assets/tasting-table.png';img.alt='';img.draggable=false;
img.onerror=()=>{img.hidden=true;table.classList.add('table-fallback');};table.append(img);picture.append(table);
}
}
function updateJourneyArt(){
const chapter=state.chapter||0,castle=isCastle(),art=$('journey-art');
$('chapter-name').textContent=castle?'第四章　魔法のオーブン':chapter===0?'第一章　お姉さんのお願い':chapter===1?'第二章　お母さんのお願い':'第三章　王子様のお願い';
$('request').replaceChildren(document.createTextNode('今日のお願い '));const request=document.createElement('span');request.textContent=castle?'パンプキンプリン':target();$('request').append(request);$('request').hidden=castle||state.phase==='resume'||state.phase==='intro'&&state.introStep===0;
art.hidden=chapter===0&&!castle||showMother()||showPrince();let scene=castle?(state.phase==='castle'?'castle':['door','door-open'].includes(state.phase)?'door':state.phase==='final-result'?'tasting':state.phase==='ending'?['investment','company','mail-order'][state.storyStep]||'investment':state.phase==='complete'?'thanks':'oven'):chapter===1?'mother':'prince';
$('art').dataset.journey=scene;
const visualKey=scene==='door'?state.phase:scene;
if(art.dataset.visual!==visualKey){art.dataset.scene=scene;art.dataset.visual=visualKey;art.replaceChildren();const picture=document.createElement('div');picture.className='journey-picture';picture.setAttribute('role','img');
if(scene==='door'){picture.classList.add('magic-door');picture.setAttribute('aria-label',state.phase==='door-open'?'開いた扉と明るい廊下':doorInscription()+'と書かれた大きな扉');const plaque=document.createElement('span');plaque.className='door-inscription';plaque.textContent=doorInscription();plaque.hidden=state.phase==='door-open';picture.append(plaque);
if(state.phase==='door'){const lock=document.createElement('div');lock.className='door-lock';lock.setAttribute('aria-hidden','true');for(let i=0;i<4;i++){const digit=document.createElement('span');digit.dataset.doorDigit=i;lock.append(digit);}picture.append(lock);}}
else if(scene==='oven'){picture.classList.add('magic-oven');picture.setAttribute('aria-label','二枚の紙が貼られた魔法のオーブン');const glass=document.createElement('span');glass.className='oven-glass';glass.textContent='✧';picture.append(glass);for(const color of ['orange','pink']){const paper=document.createElement('span');paper.className='oven-paper '+color;paper.dataset.paper=color;paper.textContent=color==='orange'?'？':'たさまとごう';picture.append(paper);}}
else{picture.classList.add('story-emblem');const symbol=document.createElement('span');symbol.textContent=scene==='castle'?'♜':scene==='ending'?'✧':scene==='mother'?'♛':'♔';picture.append(symbol);const name=document.createElement('p');name.textContent=scene==='castle'?'王子様のお城':scene==='ending'?'シンデレラの会社':scene==='mother'?'お母さん':'王子様';picture.append(name);picture.setAttribute('aria-label',name.textContent);}
const finale=['tasting','investment','company','mail-order','thanks'].includes(scene);
if(finale){
picture.className='journey-picture castle-scene finale-scene';picture.dataset.finale=scene;picture.replaceChildren();
picture.setAttribute('aria-label',({tasting:'魔法の部屋で、テーブルのパンプキンプリンに感動する王子様とシンデレラ。',investment:'王子様がシンデレラに会社への出資を申し出ています。',company:'発送用の箱が並ぶ繁盛した工房で、シンデレラと王子様が微笑んでいます。','mail-order':'お姉さんとお母さんが、こっそり取り寄せた箱を開け、パンプキンプリンを楽しんでいます。',thanks:'温かな工房から、シンデレラがこちらへ手を差し出してお礼を伝えています。'})[scene]);
}
if(['castle','door','oven'].includes(scene)||finale){
picture.classList.add('castle-scene');
const backdrop=document.createElement('img');backdrop.className='castle-backdrop';backdrop.alt='';backdrop.setAttribute('aria-hidden','true');
backdrop.onload=()=>{picture.dataset.loaded='true';};backdrop.onerror=()=>{backdrop.hidden=true;picture.dataset.loaded='false';};
backdrop.src='assets/'+(scene==='castle'?'castle-exterior.png':scene==='door'?(state.phase==='door-open'?'castle-door-open.png':'castle-door-closed.png'):scene==='company'||scene==='thanks'?'company-workshop.png':scene==='mail-order'?'mail-order-home.png':'magic-room.png');picture.prepend(backdrop);
}
if(finale)addFinaleCast(picture,scene);
art.append(picture);}
const picture=art.querySelector('.journey-picture');
if(scene==='door'){const plaque=art.querySelector('.door-inscription');if(plaque)plaque.textContent=doorInscription();syncDoorDials();}
if(scene==='oven'){
picture.classList.toggle('oven-baking',state.phase==='final-cooking');
picture.setAttribute('aria-label',(state.orange&&state.pink?'紙がなくなった':state.orange?'ピンク色の紙が残った':state.pink?'オレンジ色の紙が残った':'二枚の紙が貼られた')+'魔法のオーブン');
}
for(const color of ['orange','pink']){const paper=art.querySelector(`[data-paper="${color}"]`);if(paper)paper.hidden=state[color];}
}

function currentCookingBeats(){
return CookingArt.planFor(state.dish).beats;
}
