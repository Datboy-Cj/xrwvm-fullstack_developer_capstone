const express = require('express');
const mongoose = require('mongoose');
const path = require('node:path');
const fs = require('node:fs');
const Reviews = require('./review');
const Dealers = require('./dealership');
const app = express();
app.use(express.json({limit:'64kb'}));
const wrap = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);
app.get('/', (req,res)=>res.json({status:'ok'}));
app.get('/fetchReviews',wrap(async(req,res)=>res.json(await Reviews.find().lean())));
app.get('/fetchReviews/dealer/:id',wrap(async(req,res)=>res.json(await Reviews.find({dealership:Number(req.params.id)}).lean())));
app.get('/fetchDealers',wrap(async(req,res)=>res.json(await Dealers.find().lean())));
app.get('/fetchDealers/:state',wrap(async(req,res)=>res.json(await Dealers.find(req.params.state==='All'?{}:{state:req.params.state}).lean())));
app.get('/fetchDealer/:id',wrap(async(req,res)=>res.json(await Dealers.find({id:Number(req.params.id)}).lean())));
const Counter=mongoose.model('counter',new mongoose.Schema({_id:String,value:Number}));
app.post('/insert_review',wrap(async(req,res)=>{
 const d=req.body;
 if(!d.review || !Number.isInteger(Number(d.dealership)) || !d.name) return res.status(400).json({error:'Invalid review'});
 if(!await Dealers.exists({id:Number(d.dealership)})) return res.status(404).json({error:'Dealer not found'});
 const sequence=await Counter.findByIdAndUpdate('reviews',{$inc:{value:1}},{new:true});
 const saved=await Reviews.create({...d,id:sequence.value});
 res.status(201).json(saved);
}));
app.use((error,req,res,next)=>{
 console.error(error.message);
 res.status(error.name==='ValidationError'?400:500).json({error:'Request could not be completed'});
});
async function start(){
 await mongoose.connect(process.env.MONGO_URL || 'mongodb://mongo_db:27017/dealershipsDB');
 for(const [model,file,key] of [[Dealers,'dealerships.json','dealerships'],[Reviews,'reviews.json','reviews']]){
  if(await model.countDocuments()===0) await model.insertMany(JSON.parse(fs.readFileSync(path.join(__dirname,'data',file)))[key]);
 }
 const last=await Reviews.findOne().sort({id:-1});
 await Counter.updateOne({_id:'reviews'},{$max:{value:last?last.id:0}},{upsert:true});
 app.listen(process.env.PORT || 3030,'0.0.0.0',()=>console.log('Dealership API listening on port '+(process.env.PORT || 3030)));
}
if(require.main===module) start().catch(e=>{console.error(e.message);process.exit(1);});
module.exports=app;
