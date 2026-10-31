(function(root){
const pairs=[['豚肉','しらたき'],['じゃがいも','たまご'],['カレールー','ちくわぶ']];
function shuffled(items,random=Math.random){const result=items.slice();for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
function createRound(random=Math.random){return shuffled(pairs.map((options,pairIndex)=>({pairIndex,options:shuffled(options,random)})),random);}
function dishFor(items){if(items.length!==3||pairs.some(pair=>items.filter(item=>pair.includes(item)).length!==1))throw new Error('Invalid ingredients');return ['豚肉','じゃがいも','カレールー'].every(item=>items.includes(item))?'カレー':items.includes('カレールー')?'カレー風味のおでん':'おでん';}
root.CookingRules={pairs,dishFor,createRound};if(typeof module!=='undefined')module.exports=root.CookingRules;
})(typeof window!=='undefined'?window:globalThis);
