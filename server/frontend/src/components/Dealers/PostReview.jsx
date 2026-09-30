import React,{useEffect,useState} from 'react';
import {useParams} from 'react-router-dom';
import Header from '../Header/Header';
import {api} from '../../api';
export default function PostReview(){
 const {id}=useParams();const [dealer,setDealer]=useState({}),[cars,setCars]=useState([]),[error,setError]=useState('');
 useEffect(()=>{Promise.all([api('dealer/'+id),api('get_cars'),api('session')]).then(([d,c,u])=>{if(!u.userName){window.location.href='/login';return;}setDealer(d.dealer[0]);setCars(c.CarModels);}).catch(e=>setError(e.message));},[id]);
 async function submit(e){e.preventDefault();const d=Object.fromEntries(new FormData(e.target));const car=cars.find(c=>String(c.id)===d.car);try{await api('add_review',{...d,dealership:Number(id),car_make:car.CarMake,car_model:car.CarModel,purchase:true});window.location.href='/dealer/'+id;}catch(err){setError(err.message);}}
 return <><Header/><main className="narrow"><p className="eyebrow">SHARE YOUR EXPERIENCE</p><h1>Review {dealer.full_name}</h1><form onSubmit={submit}><label>Your review<textarea name="review" rows="5" maxLength="5000" required/></label><label>Purchase date<input type="date" name="purchase_date" required/></label><label>Car make and model<select name="car" required defaultValue=""><option value="" disabled>Choose a car</option>{cars.map(c=><option key={c.id} value={c.id}>{c.CarMake} {c.CarModel}</option>)}</select></label><label>Car year<input type="number" name="car_year" min="2015" max="2035" required/></label><p role="alert">{error}</p><button type="submit">Post Review</button></form></main></>;
}
