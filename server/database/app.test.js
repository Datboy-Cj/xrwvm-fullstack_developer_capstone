const test=require('node:test');
const assert=require('node:assert/strict');
const Dealers=require('./dealership');
const Reviews=require('./review');
const app=require('./app');
let server,base;
test.before(async()=>{server=app.listen(0);await new Promise(r=>server.once('listening',r));base='http://127.0.0.1:'+server.address().port;});
test.after(()=>server.close());
test('Kansas filter uses the state field',async()=>{
 Dealers.find=(query)=>({lean:async()=>{assert.deepEqual(query,{state:'Kansas'});return [{id:1,state:'Kansas'}];}});
 const res=await fetch(base+'/fetchDealers/Kansas');assert.equal(res.status,200);assert.equal((await res.json())[0].state,'Kansas');
});
test('dealer ID is converted to a number',async()=>{
 Dealers.find=query=>({lean:async()=>{assert.deepEqual(query,{id:1});return [{id:1}];}});
 assert.equal((await (await fetch(base+'/fetchDealer/1')).json())[0].id,1);
});
test('invalid review is rejected',async()=>{const r=await fetch(base+'/insert_review',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});assert.equal(r.status,400);});
