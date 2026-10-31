'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {pairs,dishFor,createRound}=require('../dist/rules.js');
function permutations(items){return items.length?items.flatMap((item,i)=>permutations(items.filter((_,j)=>j!==i)).map(tail=>[item,...tail])):[[]];}
test('all eight recipes give the same result in all six selection orders',()=>{
const expected=['カレー','おでん','カレー風味のおでん','おでん','カレー風味のおでん','おでん','カレー風味のおでん','おでん'];
for(let mask=0;mask<8;mask++){
 const items=pairs.map((pair,i)=>pair[(mask>>(2-i))&1]);
 for(const order of permutations(items))assert.equal(dishFor(order),expected[mask]);
}
});
test('invalid and repeated ingredient groups are rejected',()=>{
for(const items of [[],['豚肉','じゃがいも'],['豚肉','しらたき','カレールー'],['豚肉','じゃがいも','豚肉'],['豚肉','じゃがいも','塩']])assert.throws(()=>dishFor(items));
});
test('all 48 arrangements keep each ingredient pair and its identity together',()=>{
const snapshot=JSON.stringify(pairs),arrangements=new Set();
for(let bits=0;bits<8;bits++)for(let a=0;a<3;a++)for(let b=0;b<2;b++){
 const draws=[0,1,2].map(i=>(bits>>i)&1?.75:.25).concat((a+.5)/3,(b+.5)/2);
 const round=createRound(()=>draws.shift());
 assert.equal(draws.length,0);
 assert.deepEqual(round.map(q=>q.pairIndex).sort(),[0,1,2]);
 for(const q of round)assert.deepEqual(q.options.slice().sort(),pairs[q.pairIndex].slice().sort());
 arrangements.add(JSON.stringify(round));
}
assert.equal(arrangements.size,48);
assert.equal(JSON.stringify(pairs),snapshot);
});
