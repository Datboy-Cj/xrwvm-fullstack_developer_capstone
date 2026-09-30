import React,{useEffect,useState} from 'react';
import Header from '../Header/Header';
import {api} from '../../api';
export default function Register(){
 const [error,setError]=useState('');
 useEffect(()=>{api('session');},[]);
 async function submit(e){e.preventDefault();try{await api('register',Object.fromEntries(new FormData(e.target)));window.location.href='/';}catch(err){setError(err.message);}}
 return <><Header/><main className="narrow"><p className="eyebrow">JOIN BEST CARS</p><h1>Create your account</h1><form onSubmit={submit}>
 <label>Username<input name="userName" required autoComplete="username"/></label>
 <label>First Name<input name="firstName" required autoComplete="given-name"/></label>
 <label>Last Name<input name="lastName" required autoComplete="family-name"/></label>
 <label>Email<input name="email" required type="email" autoComplete="email"/></label>
 <label>Password<input name="password" required type="password" minLength="8" autoComplete="new-password"/></label>
 <p role="alert">{error}</p><button type="submit">Register</button></form></main></>;
}
