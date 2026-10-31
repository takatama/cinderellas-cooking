(function(root){
const pairs=[['豚肉','しらたき'],['じゃがいも','たまご'],['カレールー','ちくわぶ']];
function dishFor(items){if(items.length!==3||items.some((x,i)=>!pairs[i].includes(x)))throw new Error('Invalid ingredients');return items[0]==='豚肉'&&items[1]==='じゃがいも'&&items[2]==='カレールー'?'カレー':items[2]==='カレールー'?'カレー風味のおでん':'おでん';}
root.CookingRules={pairs,dishFor};if(typeof module!=='undefined')module.exports=root.CookingRules;
})(typeof window!=='undefined'?window:globalThis);
