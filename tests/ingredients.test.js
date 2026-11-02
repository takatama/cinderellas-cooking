const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const data=require('../content/cooking.json');
const registry=require('../artwork/assets.json');
const root={};
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../dist/pan-food.js'),'utf8'),{window:root});
test('every exposed vessel has preparation art and covered vessels keep food hidden',()=>{
 for(const [id,plan] of Object.entries(data.plans))for(const [step,stage] of plan.stages.entries()){
  const file=root.PanFood.fileFor(plan.method,step,stage.vessel,id);
  if(['pan','bowl','fryer'].includes(stage.vessel)){
   assert.ok(file,id+' stage '+step+' has no food');
   assert.ok(registry[file],file+' is not registered');
   assert.notEqual(file,id+'.png','completed dish must stay hidden');
  }else assert.equal(file,null,'covered vessel must hide food');
 }
});
test('egg addition is visible before the lid; ingredients change with the actual recipe',()=>{
 const egg=data.plans.oyakodon;
 assert.equal(egg.stages[2].vessel,'pan');
 assert.equal(egg.stages[3].vessel,'covered-pan');
 assert.equal(root.PanFood.fileFor(egg.method,2,'pan'),'egg-simmer-in-pan.png');
 assert.equal(root.PanFood.fileFor('deep-fry',1,'bowl','potato-croquettes'),'mashed-potato-in-bowl.png');
 assert.equal(root.PanFood.fileFor('deep-fry',0,'bowl','menchi-katsu'),'meat-mixture-in-bowl.png');
});
