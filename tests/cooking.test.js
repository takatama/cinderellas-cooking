const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
require('../dist/rules.js');
const journey=require('../dist/journey.js');
const art=require('../dist/cooking.js');
test('every first-journey outcome has complete, loadable cooking art and narration',()=>{
const dishes=[...new Set(journey.recipes.flatMap(r=>r.dishes)),'パンプキンプリン'];
assert.equal(dishes.length,17);
for(const dish of dishes){
const plan=art.planFor(dish);
if(dish==='パンプキンプリン'){assert.equal(plan.method,'oven');assert.equal(art.stageFor(dish,0),null);continue;}
assert.equal(plan.beats.length,4);assert.equal(plan.stages.length,4);
for(const stage of plan.stages){assert.ok(art.vessels[stage.vessel]);assert.ok(fs.existsSync(require('node:path').join(__dirname,'../dist/assets',art.vessels[stage.vessel].file)));assert.ok(['steam','oil','none'].includes(stage.effect));}
for(const other of dishes)assert.ok(!plan.beats.flat().join('').includes(other),'do not name the completed dish before revealing it');
}
assert.throws(()=>art.planFor('未登録料理'));
});
test('wrong choices use their actual cooking method, independently of request and choice order',()=>{
const cases=[
{chapter:1,items:['ひき肉','パン粉','玉ねぎ'],method:'sear'},
{chapter:1,items:['ひき肉','パン粉','青のり'],method:'deep-fry'},
{chapter:1,items:['ひき肉','キャベツ','玉ねぎ'],method:'simmer'},
{chapter:1,items:['じゃがいも','キャベツ','青のり'],method:'mix'},
{chapter:2,items:['お米','たまご','とり肉'],method:'egg-simmer'}
];
for(const c of cases)for(const items of [c.items,c.items.slice().reverse()])assert.equal(art.planFor(journey.dishFor(items,c.chapter)).method,c.method);
});
test('multi-vessel dishes retain their distinct preparation and finishing methods',()=>{
assert.deepEqual(art.planFor('ハンバーグ').stages.map(s=>s.vessel),['bowl','pan','covered-pan','covered-pan']);
assert.deepEqual(art.planFor('コロッケ').stages.map(s=>s.vessel),['pot','bowl','fryer','fryer']);
const salad=art.planFor('ポテトサラダ');assert.equal(salad.servedSteam,false);assert.ok(salad.stages.slice(1).every(s=>s.effect==='none'&&s.vessel==='bowl'));assert.ok(!salad.beats.flat().join('').includes('あたたかい'));
for(const name of ['アマトリチャーナ','トマトスパゲティ','カルボナーラ']){assert.equal(art.stageFor(name,0).vessel,'pot');assert.equal(art.stageFor(name,2).vessel,'pan');}
assert.equal(art.stageFor('カルボナーラ',2).effect,'none');
assert.match(art.planFor('ピラフ').beats.flat().join(''),/ふたをして炊き/);
assert.equal(art.stageFor('ピラフ',1).vessel,'covered-pan');
assert.match(art.planFor('親子丼').beats.flat().join(''),/具材を煮/);
});
