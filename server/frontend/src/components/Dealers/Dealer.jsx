import React,{useEffect,useState} from 'react';
import {useParams} from 'react-router-dom';
import Header from '../Header/Header';
import {api} from '../../api';
export default function Dealer(){
 const {id}=useParams();const [dealer,setDealer]=useState(null),[reviews,setReviews]=useState([]),[user,setUser]=useState(null),[error,setError]=useState('');
 useEffect(()=>{Promise.all([api('dealer/'+id),api('reviews/dealer/'+id),api('session')]).then(([d,r,u])=>{setDealer(d.dealer[0]);setReviews(r.reviews);setUser(u.userName);}).catch(e=>setError(e.message));},[id]);
 return <><Header/><main><a href="/">← All dealerships</a><section className="hero"><p className="eyebrow">DEALERSHIP DETAILS</p><h1>{dealer?.full_name||'Loading dealership…'}</h1><p>{dealer&&`${dealer.address}, ${dealer.city}, ${dealer.state} ${dealer.zip}`}</p>{user&&<a className="button" href={'/postreview/'+id}>Review Dealer</a>}</section><h2>Customer reviews</h2><p role="alert">{error}</p><div className="cards">{reviews.map(r=><article className="card" key={r.id}><span className={'sentiment '+r.sentiment}>{r.sentiment}</span><h3>{r.name}</h3><p>{r.review}</p><small>{r.car_make} {r.car_model} · {r.car_year} · Purchased {r.purchase_date}</small></article>)}</div>{dealer&&!reviews.length&&<p>No reviews yet. Be the first to share your experience.</p>}</main></>;
}
