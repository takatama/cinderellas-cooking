'use strict';
const $=id=>document.getElementById(id);
const {dishFor,createRound}=CookingRules;
const foodAssets={
'豚肉':'pork.webp','しらたき':'shirataki.webp','じゃがいも':'potato.webp',
'たまご':'egg.webp','カレールー':'curry-roux.webp','ちくわぶ':'chikuwabu.webp',
'カレー':'curry.webp','おでん':'oden.webp','カレー風味のおでん':'curry-oden.webp','お料理中':'covered-pot.webp'
};
function foodImage(name,stage=false){const img=document.createElement('img');img.src='assets/'+foodAssets[name];img.alt=stage?name:'';img.width=stage?600:300;img.height=stage?400:200;img.className=stage?'dish-art':'ingredient-art';img.decoding='async';img.draggable=false;img.onerror=()=>{img.hidden=true;if(stage){const note=document.createElement('span');note.className='food-fallback';note.textContent=name==='お料理中'?'お料理中…':name;img.replaceWith(note);}};return img;}
// Preload independent art so later choices and the final reveal are ready in cache.
Object.values(foodAssets).forEach(file=>{const preload=new Image();preload.src='assets/'+file;});
const sisterScenes={stern:'assets/kitchen-stern.png',delighted:'assets/kitchen-delighted.png',pleased:'assets/kitchen-pleased.png'};
const sceneReady={};
Object.entries(sisterScenes).forEach(([mood,src])=>{const img=new Image();img.onload=()=>{sceneReady[mood]=true;updateSister();};img.src=src;});
let atlasReady=false,atlasFailed=false,openingReady=false,openingFailed=false;
const sceneDescriptions=[
'三角の頭巾とエプロン姿のシンデレラが、自分の側の書見台に開いた料理の本を見ながらボウルを混ぜています。',
'お姉さんが料理の本を閉じ、腰の方へ持ち去ります。シンデレラは手を止めています。',
'お姉さんは本を腰の後ろに隠しています。シンデレラは本がなくなった台を見ています。',
'三角の頭巾をかぶったシンデレラが、こちらへ手を差し出して材料選びをお願いします。',
'お姉さんは目を閉じて満面の笑顔。シンデレラもうれしそうです。',
'違う料理もおいしくて、お姉さんは目を開けたまま頬を染めています。'
];
function updateSister(){
const isResult=['result','end'].includes(state.phase);
const mood=isResult?(state.dish==='カレー'?'delighted':'pleased'):'stern';
const frame=state.phase==='intro'?(state.introStep===0?state.introBeat:state.introStep===1?2:3):isResult?(state.dish==='カレー'?4:5):3;
$('art').dataset.scene=String(frame);
const useOpening=frame===0&&openingReady;
const useAtlas=frame!==0&&atlasReady;
$('story-scene-frame').hidden=!(useOpening||useAtlas);
$('opening-scene').hidden=!useOpening;
$('atlas-window').hidden=!useAtlas;
if(useOpening||useAtlas){
 $('scene').hidden=true;$('expression').hidden=true;
 $('story-scene').style.left=-(frame%2)*100+'%';
 $('story-scene').style.top=-Math.floor(frame/2)*100+'%';
 $('story-scene').alt=sceneDescriptions[frame];
}else{
 if($('scene').complete&&$('scene').naturalWidth)$('scene').hidden=false;
 $('expression').hidden=!sceneReady[mood]||$('scene').hidden;
 if(sceneReady[mood])$('expression').src=sisterScenes[mood];
 $('scene').alt=sceneDescriptions[frame];
}
}
function updateTable(){const table=$('table-ingredients');const items=['select','ready'].includes(state.phase)?state.items:[];const current=[...table.children].map(el=>el.dataset.food);if(current.some((name,i)=>items[i]!==name)||current.length>items.length)table.replaceChildren();items.slice(table.children.length).forEach(name=>{const item=document.createElement('figure');item.setAttribute('role','listitem');item.dataset.food=name;item.append(foodImage(name));const caption=document.createElement('figcaption');caption.textContent=name;item.append(caption);table.append(item);});table.hidden=!items.length;}
let cookingStep=0, cookingTimer;
const cookingBeats=[['とん、とん、とん。','シンデレラは、選んだ材料を手ぎわよく切っていきます。'],['ことこと、ぐつぐつ。','お鍋の中で、材料たちがゆっくり煮えています。'],['……いいにおい！','ふわりと、おいしそうな香りが広がりました。'],['できたよ！','あたたかいうちに、召し上がれ。']];
function pauseCooking(){clearTimeout(cookingTimer);}
function scheduleCooking(){pauseCooking();if(state.phase!=='cooking'||cookingStep>=3||document.hidden||document.querySelector('dialog[open]'))return;cookingTimer=setTimeout(()=>{if(sound&&window.speechSynthesis?.speaking){scheduleCooking();return;}cookingStep++;render(false);scheduleCooking();},1800);}
let state={phase:'intro',introStep:0,introBeat:0,step:0,items:[],dish:null,round:[]},history=[],sound=false,voices=[],audioContext;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');$('reduce').checked=reduced.matches;if(reduced.matches)state.introBeat=2;
const titles={pause:['またあとで',''],intro:['はじまり','01 / 06'],select:['材料をえらぶ','02 / 06'],ready:['さあ、お料理','03 / 06'],cooking:['シンデレラにおまかせ','04 / 06'],result:['できたてを、どうぞ','05 / 06'],end:['最初の一皿、おしまい','06 / 06']};
function stopAudio(){if('speechSynthesis'in window)speechSynthesis.cancel();if(audioContext){audioContext.close().catch(()=>{});audioContext=null;}}
function say(text){stopAudio();if(!sound||!('speechSynthesis'in window))return;try{const u=new SpeechSynthesisUtterance(text);u.lang='ja-JP';u.rate=.93;const v=speechSynthesis.getVoices().find(v=>v.lang.startsWith('ja'));if(v)u.voice=v;u.onerror=()=>{};speechSynthesis.speak(u);}catch{}}
function tone(){if(!sound)return;try{const A=window.AudioContext||window.webkitAudioContext;audioContext=new A();const o=audioContext.createOscillator(),g=audioContext.createGain();o.type='sine';o.frequency.setValueAtTime(550,audioContext.currentTime);o.frequency.exponentialRampToValueAtTime(825,audioContext.currentTime+.18);g.gain.setValueAtTime(.035,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+.3);o.connect(g).connect(audioContext.destination);o.start();o.stop(audioContext.currentTime+.3);}catch{}}
function line(who,text){return {who,text};}
function log(title,lines){history.push({title,lines});}
function content(){const {phase,step,items,dish}=state;
if(phase==='intro'){
const pages=[
[line('ものがたり','料理が得意なシンデレラ。'),...(state.introBeat===2?[line('ものがたり','しかし、お姉さんがいじわるをして、大切な料理の本を隠してしまいました。')]:[])],
[line('ものがたり','それなのに、お姉さんは料理を頼んできます。'),line('お姉さん','シンデレラ、カレーを作っておいてね。')],
[line('シンデレラ','材料さえ分かれば、おいしいカレーが作れるのに！'),line('ものがたり','シンデレラのために、カレーの材料を選んであげますか？')]
];
return {lines:pages[state.introStep],prologue:state.introStep===0,buttons:state.introStep===pages.length-1?[['はい',start],['いいえ',deferHelp]]:[['つづきを読む　→',advanceIntro]]};
}
if(phase==='pause')return {lines:[line('シンデレラ','また会えるのを楽しみにしているね。')],buttons:[['お願いにもどる',resumeHelp]]};
if(phase==='select'){
const current=state.round[step];
return {lines:current.pairIndex===0?[line('シンデレラ','カレーといえば、しらたき、かしら？')]:current.pairIndex===2?[line('ものがたり','（シンデレラは、ちくわぶをじっと見つめています……）')]:[],question:step===0?'カレーに入れるのは、どっち？':step===1?'２つ目の材料は？':'最後の材料は？',choices:current.options};
}
if(phase==='ready')return {lines:[line('シンデレラ',`${items.join('、')}だね。どうもありがとう！`),line('シンデレラ','ようし、あとは私にまかせて！')],buttons:[['お料理をお願いする　→',cook],['材料を選びなおす',start]],hint:'選んだ材料で、シンデレラが料理します。'};
if(phase==='cooking')return {lines:[line(cookingStep===3?'シンデレラ':'ものがたり',cookingBeats[cookingStep][0]),line(cookingStep===3?'シンデレラ':'ものがたり',cookingBeats[cookingStep][1])],buttons:cookingStep===3?[['できた料理を見てみる　→',result]]:[['できあがりまで進む　→',()=>{pauseCooking();cookingStep=3;render();}]],hint:cookingStep===3?'どんな一皿ができたかな？':'シンデレラがお料理しています。少しだけ、待っていてね。'};
if(phase==='result')return dish==='カレー'?{lines:[line('ものがたり','カレーのできあがり！'),line('お姉さん','ふうん、まあまあね。……おかわり、大盛りで！')],buttons:[['おかわりをよそう　→',end]],hint:'お姉さんのお皿は、もう空っぽ。'}:{lines:[line('ものがたり',`${dish}ができました！`),line('お姉さん','おいしいけれど、カレーとはちょっと違うわね。'),line('シンデレラ','もう一度、作ってみよう！')],buttons:[['材料を選びなおす　↻',start]],hint:'作りなおしは、何度でも。おいしい料理ができたね。'};
return {lines:[line('シンデレラ','おいしくできたね。手伝ってくれて、ありがとう！'),line('ものがたり','お姉さんは、最後のひとくちまで大切そうに食べました。')],buttons:[['もう一度、作ってみる　↻',start],['ここまでのお話を読む',openHistory]],hint:'今回のデモはここまで。次は、お母さんのお願いです。'};
}
function button(label,action,secondary=false){const b=document.createElement('button');b.type='button';b.className=secondary?'secondary':'primary';b.textContent=label;b.onclick=()=>{stopAudio();action();};return b;}
function render(focus=true,speechOverride=null){updateSister();updateTable();const c=content();const aside=$('cinderella-aside');const asideLine=state.phase==='select'?c.lines[0]:null;$('request').hidden=state.phase==='intro'&&state.introStep===0;aside.hidden=!asideLine;aside.classList.toggle('observation',asideLine?.who==='ものがたり');$('cinderella-aside-text').textContent=asideLine?(asideLine.who==='ものがたり'?asideLine.text:'「'+asideLine.text+'」'):'';$('phase').textContent=state.phase==='select'?`材料えらび ${state.step+1} / 3`:titles[state.phase][0];renderDialogue(c,asideLine);
if(c.question){const q=document.createElement('h1');q.className='question';q.textContent=c.question;$('dialogue').append(q);}
if(!(c.prologue&&$('actions').dataset.page==='prologue')){$('actions').replaceChildren();if(c.choices){const choices=document.createElement('div');choices.className='choices';c.choices.forEach((name,i)=>{const b=document.createElement('button');b.className='ingredient';b.type='button';b.setAttribute('aria-label',name+'を選ぶ');b.innerHTML=`<strong>${name}</strong>`;b.prepend(foodImage(name));b.onclick=()=>choose(name);choices.append(b);});$('actions').append(choices);}else c.buttons.forEach(([label,action],i)=>$('actions').append(button(label,action,i>0)));}$('actions').dataset.page=c.prologue?'prologue':'';
$('guidance').textContent=state.phase==='end'?c.hint:'';$('guidance').hidden=state.phase!=='end';const stageName=['cooking','result','end'].includes(state.phase)?(state.phase==='cooking'?'お料理中':state.dish):'';if($('stage-object').dataset.food!==stageName){$('stage-object').dataset.food=stageName;$('stage-object').replaceChildren();if(stageName)$('stage-object').append(foodImage(stageName,true));}$('steam').classList.toggle('active',['cooking','result','end'].includes(state.phase));$('art').classList.toggle('cooking',state.phase==='cooking');$('art').dataset.beat=String(cookingStep);if(state.phase==='cooking'){$('phase').textContent='お料理中 '+['①','②','③','④'][cookingStep];$('actions').classList.toggle('waiting',cookingStep<3);}else $('actions').classList.remove('waiting');$('art-caption').textContent=state.phase==='result'?(state.dish==='カレー'?'おかわりの声は、おいしいのしるし。':'注文とは違っても、おいしい一皿。'):state.phase==='cooking'?cookingBeats[cookingStep][0]:'ちいさな台所から、はじまる物語。';
if(focus){$('dialogue').setAttribute('tabindex','-1');$('dialogue').focus({preventScroll:true});}if(speechOverride!=='')say(speechOverride??c.lines.map(l=>l.text).join('。')+(c.question||''));scheduleIntro();}
function renderDialogue(c,asideLine){
const dialogue=$('dialogue');
dialogue.setAttribute('aria-atomic',c.prologue?'false':'true');
if(c.prologue){
 if(dialogue.dataset.page!=='prologue'){
  dialogue.replaceChildren();
  const box=document.createElement('div');box.className='speech narrator';
  const name=document.createElement('p');name.className='name';name.textContent='ものがたり';box.append(name);dialogue.append(box);
 }
 dialogue.dataset.page='prologue';
 const box=dialogue.firstElementChild;
 while(box.querySelectorAll('.words').length<c.lines.length){
  const index=box.querySelectorAll('.words').length;
  const words=document.createElement('p');words.className='words'+(index?' prologue-reveal':'');words.textContent=c.lines[index].text;box.append(words);
 }
}else{
 dialogue.dataset.page='';dialogue.replaceChildren();
 for(const l of c.lines){
  const box=document.createElement('div');box.className='speech '+(l.who==='お姉さん'?'sister':l.who==='ものがたり'?'narrator':'');
  const name=document.createElement('p');name.className='name';name.textContent=l.who;
  if(l===asideLine)box.classList.add('sr-only');
  const words=document.createElement('p');words.className='words';words.textContent=l.text;box.append(name,words);dialogue.append(box);
 }
}
}
let introTimer;
function pauseIntro(){clearTimeout(introTimer);}
function scheduleIntro(){
pauseIntro();
if((!atlasReady&&!atlasFailed)||(!openingReady&&!openingFailed)||state.phase!=='intro'||state.introStep!==0||state.introBeat>=2||document.hidden||document.querySelector('dialog[open]'))return;
introTimer=setTimeout(()=>{
 if(sound&&window.speechSynthesis?.speaking){scheduleIntro();return;}
 state.introBeat++;
 render(false,state.introBeat===2?'しかし、お姉さんがいじわるをして、大切な料理の本を隠してしまいました。':'');
},state.introBeat===0?2400:1100);
}
function advanceIntro(){
if(state.phase!=='intro'||state.introStep>=2)return;
pauseIntro();
if(state.introStep===0&&state.introBeat<2){state.introBeat=2;render(false,'しかし、お姉さんがいじわるをして、大切な料理の本を隠してしまいました。');return;}
log('はじまり',content().lines);state.introStep++;render();
}
function deferHelp(){if(state.phase!=='intro'||state.introStep!==2)return;pauseIntro();state.phase='pause';render();}
function resumeHelp(){if(state.phase!=='pause')return;state.phase='intro';state.introStep=2;render();}
function start(){pauseIntro();pauseCooking();stopAudio();if(state.phase==='intro')log('台所のお願い',content().lines);state={phase:'select',introStep:0,step:0,items:[],dish:null,round:createRound()};render();}
function choose(name){if(state.phase!=='select'||!state.round[state.step].options.includes(name))return;stopAudio();state.items.push(name);if(state.step===2)state.phase='ready';else state.step++;render();}
function cook(){if(state.phase!=='ready')return;state.dish=dishFor(state.items);log('選んだ材料',[line('あなた',state.items.join('、'))]);state.phase='cooking';cookingStep=0;render();scheduleCooking();}
function result(){if(state.phase!=='cooking'||cookingStep<3)return;pauseCooking();state.phase='result';render();log('できたての一皿',content().lines);}
function end(){state.phase='end';render();log('最初の一皿',content().lines);}
function openHistory(){pauseIntro();pauseCooking();stopAudio();$('history-content').replaceChildren();if(!history.length){const p=document.createElement('p');p.textContent='お話は、これからはじまります。';$('history-content').append(p);}history.forEach(entry=>{const a=document.createElement('article'),h=document.createElement('h3');h.textContent=entry.title;a.append(h);entry.lines.forEach(l=>{const p=document.createElement('p');p.textContent=l.who+'：'+l.text;a.append(p);});$('history-content').append(a);});$('history-dialog').showModal();}
$('sound').onclick=()=>{sound=!sound;$('sound').setAttribute('aria-pressed',String(sound));$('sound').setAttribute('aria-label',sound?'読み上げをオフにする':'読み上げをオンにする');$('sound').innerHTML=sound?'♫ <span>読み上げ</span>':'♫ <span>音なし</span>';if(sound){const c=content();say(c.lines.map(l=>l.text).join('。'));}else stopAudio();};
if(!('speechSynthesis'in window)){$('sound').hidden=true;}
$('settings').onclick=()=>{pauseIntro();pauseCooking();stopAudio();$('settings-dialog').showModal();};$('reduce').onchange=()=>{document.body.classList.toggle('reduced',$('reduce').checked);if($('reduce').checked&&state.phase==='intro'&&state.introStep===0&&state.introBeat<2){pauseIntro();state.introBeat=2;render(false,'');}};document.body.classList.toggle('reduced',$('reduce').checked);
$('restart').onclick=()=>{pauseIntro();pauseCooking();stopAudio();history=[];state={phase:'intro',introStep:0,introBeat:$('reduce').checked?2:0,step:0,items:[],dish:null,round:[]};$('dialogue').dataset.page='';$('settings-dialog').close();render();};$('history').onclick=openHistory;
document.querySelectorAll('dialog .close').forEach(b=>b.onclick=()=>{stopAudio();b.closest('dialog').close();});document.querySelectorAll('dialog').forEach(d=>{d.addEventListener('cancel',stopAudio);d.addEventListener('close',()=>{scheduleCooking();scheduleIntro();});});document.addEventListener('visibilitychange',()=>{if(document.hidden){stopAudio();pauseCooking();pauseIntro();}else{scheduleCooking();scheduleIntro();}});window.addEventListener('pagehide',()=>{stopAudio();pauseCooking();pauseIntro();});
$('scene').onload=updateSister;$('scene').onerror=()=>{$('scene').hidden=true;$('expression').hidden=true;};if($('scene').complete&&!$('scene').naturalWidth)$('scene').hidden=true;render(false);

function fitScene(){
if(!atlasReady)return;
const ratio=($('story-scene').naturalWidth/2)/($('story-scene').naturalHeight/3);
const width=Math.max($('art').clientWidth,$('art').clientHeight*ratio);
$('atlas-window').style.width=width+'px';$('atlas-window').style.height=width/ratio+'px';
}
function atlasLoaded(){atlasReady=true;fitScene();updateSister();scheduleIntro();}
if('ResizeObserver'in window)new ResizeObserver(fitScene).observe($('art'));
else window.addEventListener('resize',fitScene);
$('story-scene').onload=atlasLoaded;
$('story-scene').onerror=()=>{atlasReady=false;atlasFailed=true;updateSister();scheduleIntro();};
if($('story-scene').complete&&$('story-scene').naturalWidth)atlasLoaded();

function openingLoaded(){openingReady=true;updateSister();scheduleIntro();}
$('opening-scene').onload=openingLoaded;
$('opening-scene').onerror=()=>{openingReady=false;openingFailed=true;updateSister();scheduleIntro();};
if($('opening-scene').complete&&$('opening-scene').naturalWidth)openingLoaded();
