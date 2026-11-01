const {test}=require('node:test');
const assert=require('node:assert/strict');
require('../dist/rules.js');
const J=require('../dist/journey.js');
const permutations=xs=>xs.length?xs.flatMap((x,i)=>permutations(xs.filter((_,j)=>j!==i)).map(t=>[x,...t])):[[]];
const expected=[['カレー','おでん','カレー風味のおでん','おでん','カレー風味のおでん','おでん','カレー風味のおでん','おでん'],['ハンバーグ','メンチカツ','ロールキャベツ','野菜炒め','コロッケ','コロッケ','ポテトサラダ','ポテトサラダ'],['アマトリチャーナ','トマトスパゲティ','カルボナーラ','カルボナーラ','ピラフ','チキンライス','オムライス','親子丼']];
test('original first-journey dishes: all 24 combinations in every selection order',()=>{
J.recipes.forEach((r,ch)=>{for(let bits=0;bits<8;bits++){const items=r.pairs.map((p,i)=>p[(bits>>(2-i))&1]);for(const order of permutations(items))assert.equal(J.dishFor(order,ch),expected[ch][bits],`${ch}: ${order}`);}});
});
test('rounds preserve pairs, randomize order and reject invalid ingredients',()=>{
for(let ch=0;ch<3;ch++){for(let n=0;n<50;n++){const round=J.createRound(ch);assert.equal(new Set(round.map(x=>x.pairIndex)).size,3);for(const q of round)assert.deepEqual(q.options.slice().sort(),J.recipes[ch].pairs[q.pairIndex].slice().sort());}assert.throws(()=>J.dishFor(['ひき肉','ひき肉','玉ねぎ'],ch));assert.throws(()=>J.dishFor([],ch));}
});
test('Japanese first-journey puzzles accept equivalent forms, reject partial answers',()=>{
for(const v of ['5467','５４６７',' 5467 '])assert.equal(J.doorAnswer(v),true);
for(const v of ['５４６','1234','54678'])assert.equal(J.doorAnswer(v),false);
for(const v of ['かぼちゃ','カボチャ','南瓜','パンプキン'])assert.equal(J.orangeAnswer(v),true);
assert.equal(J.orangeAnswer('トマト'),false);
for(const [a,b] of [['たまご','砂糖'],['さとう','卵'],['玉子','サトウ']])assert.equal(J.pinkAnswer(a,b),true);
for(const [a,b] of [['たまご','卵'],['砂糖','砂糖'],['たまご','塩'],['','砂糖']])assert.equal(J.pinkAnswer(a,b),false);
});
