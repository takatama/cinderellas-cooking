(function(root){
'use strict';
const recipes=[
{target:'カレー',who:'お姉さん',pairs:[['豚肉','しらたき'],['じゃがいも','たまご'],['カレールー','ちくわぶ']],dishes:['カレー','おでん','カレー風味のおでん']},
{target:'ハンバーグ',who:'お母さん',pairs:[['ひき肉','じゃがいも'],['パン粉','キャベツ'],['玉ねぎ','青のり']],dishes:['ハンバーグ','メンチカツ','ロールキャベツ','野菜炒め','コロッケ','ポテトサラダ']},
{target:'アマトリチャーナ',who:'王子様',pairs:[['パスタ','お米'],['トマト','たまご'],['ベーコン','とり肉']],dishes:['アマトリチャーナ','トマトスパゲティ','カルボナーラ','ピラフ','チキンライス','オムライス','親子丼']}
];
const dishMaps=[null,['ハンバーグ','メンチカツ','ロールキャベツ','野菜炒め','コロッケ','コロッケ','ポテトサラダ','ポテトサラダ'],['アマトリチャーナ','トマトスパゲティ','カルボナーラ','カルボナーラ','ピラフ','チキンライス','オムライス','親子丼']];
function dishFor(items,chapter=0){const r=recipes[chapter];if(!r||items.length!==3||r.pairs.some(p=>items.filter(x=>p.includes(x)).length!==1))throw new Error('Invalid ingredients');if(chapter===0)return root.CookingRules.dishFor(items);return dishMaps[chapter][r.pairs.reduce((n,p)=>n*2+Number(items.includes(p[1])),0)];}
function createRound(chapter=0,random=Math.random){const shuffle=arr=>{const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};return shuffle(recipes[chapter].pairs.map((p,pairIndex)=>({pairIndex,options:shuffle(p)})));}
function normalize(s){return String(s).normalize('NFKC').trim().replace(/[\s、,・。]/g,'').replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-96));}
function doorAnswer(value){return normalize(value)==='5467';}
function orangeAnswer(value){return ['かぼちゃ','南瓜','ぱんぷきん'].includes(normalize(value));}
function pinkAnswer(a,b){const n=[normalize(a),normalize(b)].map(x=>x==='卵'||x==='玉子'?'たまご':x==='さとう'?'砂糖':x);return n.includes('たまご')&&n.includes('砂糖');}
root.Journey={recipes,dishFor,createRound,normalize,doorAnswer,orangeAnswer,pinkAnswer};
if(typeof module!=='undefined')module.exports=root.Journey;
})(typeof window!=='undefined'?window:globalThis);
