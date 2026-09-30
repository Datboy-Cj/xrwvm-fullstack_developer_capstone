import React,{useEffect,useState} from 'react';
import Header from '../Header/Header';
import {api} from '../../api';
export default function Login(){
 const [error,setError]=useState('');
 useEffect(()=>{api('session');},[]);
 async function submit(e){e.preventDefault();const d=new FormData(e.target);try{await api('login',{userName:d.get('username'),password:d.get('password')});window.location.href='/';}catch(err){setError(err.message);}}
 return <><Header/><main className="narrow"><p className="eyebrow">YOUR ACCOUNT</p><h1>Welcome back</h1><p>Log in to share a dealership review.</p><form onSubmit={submit}><label>Username<input name="username" autoComplete="username" required/></label><label>Password<input name="password" type="password" autoComplete="current-password" required/></label><p role="alert">{error}</p><button type="submit">Log in</button><a href="/register">Create an account</a></form></main></>;
}
