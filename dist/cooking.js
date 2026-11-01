(function(root){
'use strict';
// Art, narration and effects share the same plan, selected after the ingredients.
const vessels={
pot:{file:'covered-pot.png',alt:'ふた付きの鍋で煮込んでいます。'},
pan:{file:'frying-pan.png',alt:'フライパンで材料に火を通しています。'},
'covered-pan':{file:'covered-frying-pan.png',alt:'ふたをしたフライパンで火を通しています。'},
fryer:{file:'frying-pot.png',alt:'ふたのない揚げ鍋で衣をからりと揚げています。'},
bowl:{file:'mixing-bowl.png',alt:'ボウルで材料を合わせています。'}
};
const frame=(vessel,effect='none')=>({vessel,effect});
const pot=()=>frame('pot','steam'),pan=()=>frame('pan','steam'),covered=()=>frame('covered-pan','steam'),bowl=()=>frame('bowl'),fryer=()=>frame('fryer','oil');
const prep=['とん、とん、とん。','シンデレラは、選んだ材料を手ぎわよく切っていきます。'];
const aroma=['……いいにおい！','ふわりと、おいしそうな香りが広がりました。'];
const done=['できたよ！','あたたかいうちに、召し上がれ。'];
function plan(method,beats,stages,servedSteam=true){return {method,beats:[...beats,done],stages,servedSteam};}
const simmer=plan('simmer',[prep,['ことこと、ぐつぐつ。','お鍋の中で、材料たちがゆっくり煮えています。'],aroma],[pot(),pot(),pot(),pot()]);
const pasta=plan('pasta',[
['ぐつぐつ。','鍋にたっぷりのお湯を沸かし、パスタをゆでます。'],
['じゅう、じゅう。','フライパンで具材とソースを用意します。'],
['くるり、さっと。','ゆでたパスタに、ソースをからめて仕上げます。']
],[pot(),pan(),pan(),pan()]);
const plans={
'カレー':simmer,'おでん':simmer,'カレー風味のおでん':simmer,'ロールキャベツ':simmer,
'ハンバーグ':plan('sear',[
['こね、こね。','ボウルで材料を合わせ、形を整えます。'],
['じゅう、じゅう。','フライパンで両面に焼き色をつけます。'],
['じっくり、ふっくら。','ふたをして、中まで火を通します。']
],[bowl(),pan(),covered(),covered()]),
'野菜炒め':plan('stir-fry',[prep,['じゅう、じゅう。','フライパンで、材料を手ぎわよく炒めます。'],aroma],[frame('pan'),pan(),pan(),pan()]),
'メンチカツ':plan('deep-fry',[
['こね、こね。','ボウルで材料を合わせ、形を整えて衣をつけます。'],
['からり、じゅわっ。','揚げ鍋の油で、衣をきつね色に揚げます。'],aroma
],[bowl(),fryer(),fryer(),fryer()]),
'コロッケ':plan('deep-fry',[
['ほくほく。','じゃがいもを鍋でゆでます。'],
['つぶして、ころん。','ボウルで材料を合わせ、形を整えて衣をつけます。'],
['からり、じゅわっ。','揚げ鍋の油で、衣をきつね色に揚げます。']
],[pot(),bowl(),fryer(),fryer()]),
'ポテトサラダ':plan('mix',[
['ほくほく。','じゃがいもを鍋でゆでます。'],
['さっくり、さっくり。','ボウルでじゃがいもをつぶし、粗熱を取ります。'],
['くるり、さっと。','用意した具材を合わせて仕上げます。']
],[pot(),bowl(),bowl(),bowl()],false),
'アマトリチャーナ':pasta,'トマトスパゲティ':pasta,
'カルボナーラ':plan('pasta-egg',[
pasta.beats[0],pasta.beats[1],
['くるり、さっと。','フライパンの火を止め、パスタに卵のソースをからめます。']
],[pot(),pan(),frame('pan'),frame('pan')]),
'ピラフ':plan('pilaf',[
['じゅう、じゅう。','深めのフライパンで、お米と具材を炒めます。'],
['ことこと。','スープを加え、ふたをして炊きます。'],
['ふっくら。','火を止めて蒸らし、仕上げます。']
],[pan(),covered(),covered(),covered()]),
'チキンライス':plan('rice-fry',[
['ふっくら。','鍋でお米を炊き、具材を用意します。'],
['じゅう、じゅう。','フライパンで具材を炒めます。'],
['くるり、さっと。','炊いたご飯を加え、味をなじませながら炒めます。']
],[pot(),pan(),pan(),pan()]),
'オムライス':plan('omelet-rice',[
['ふっくら。','鍋でお米を炊き、具材を用意します。'],
['じゅう、じゅう。','フライパンで、ご飯と具材を炒めます。'],
['くるり。','卵を焼いて、ご飯をやさしく包みます。']
],[pot(),pan(),pan(),pan()]),
'親子丼':plan('egg-simmer',[
['ふっくら。','鍋でお米を炊き、具材を用意します。'],
['ことこと。','小さめのフライパンで、具材を煮ます。'],
['とろり。','溶いた卵を流し入れ、ふたをして火を通します。']
],[pot(),pan(),covered(),covered()]),
'パンプキンプリン':{method:'oven',servedSteam:false,beats:[],stages:[]}
};
// A cold mixed dish must not inherit the hot-dish finish line.
plans['ポテトサラダ'].beats[3]=['できたよ！','やさしく混ぜて、できあがり。'];
function planFor(dish){if(!Object.hasOwn(plans,dish))throw new Error('Unknown cooking plan: '+dish);return plans[dish];}
function stageFor(dish,step){const p=planFor(dish);return p.stages[Math.max(0,Math.min(3,step))]||null;}
root.CookingArt={vessels,planFor,stageFor};
if(typeof module!=='undefined')module.exports=root.CookingArt;
})(typeof window!=='undefined'?window:globalThis);
