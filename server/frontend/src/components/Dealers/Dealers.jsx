import React,{useState,useEffect} from 'react';
import Header from '../Header/Header';
import {api} from '../../api';
export default function Dealers(){
 const [dealers,setDealers]=useState([]),[states,setStates]=useState([]),[user,setUser]=useState(null),[error,setError]=useState('');
 const selected=new URLSearchParams(window.location.search).get('state')||'All';
 useEffect(()=>{Promise.all([api('get_dealers'),api('session')]).then(([d,u])=>{setStates([...new Set(d.dealers.map(x=>x.state))].sort());setUser(u.userName);return selected==='All'?d:api('get_dealers/'+encodeURIComponent(selected));}).then(d=>setDealers(d.dealers)).catch(e=>setError(e.message));},[selected]);
 return <><Header/><main><section className="hero"><p className="eyebrow">FIND YOUR NEXT STOP</p><h1>Good cars. Trusted dealerships.</h1><p>Explore our national directory, read customer reviews, and share your experience.</p></section><div className="sectionbar"><h2>Our dealerships <small>{dealers.length} locations</small></h2><label>Filter by state <select value={selected} onChange={e=>{window.location.href='/?state='+encodeURIComponent(e.target.value);}}><option>All</option>{states.map(s=><option key={s}>{s}</option>)}</select></label></div><p role="alert">{error}</p><div className="tablewrap"><table><thead><tr><th>ID</th><th>Dealer name</th><th>City</th><th>Address</th><th>ZIP</th><th>State</th>{user&&<th>Review Dealer</th>}</tr></thead><tbody>{dealers.map(d=><tr key={d.id}><td>{d.id}</td><td><a href={'/dealer/'+d.id}>{d.full_name}</a></td><td>{d.city}</td><td>{d.address}</td><td>{d.zip}</td><td>{d.state}</td>{user&&<td><a href={'/postreview/'+d.id}>Review Dealer</a></td>}</tr>)}</tbody></table></div></main></>;
}
