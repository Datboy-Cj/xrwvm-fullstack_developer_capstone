import React,{useEffect,useState} from 'react';
import {api} from '../../api';
export default function Header(){
 const [user,setUser]=useState(null);
 useEffect(()=>{api('session').then(d=>setUser(d.userName)).catch(()=>{});},[]);
 const logout=async()=>{await api('logout',{});window.location.href='/';};
 return <header><a className="brand" href="/">Best Cars</a><nav aria-label="Main"><a href="/">Dealerships</a><a href="/about">About Us</a><a href="/contact">Contact Us</a></nav><div className="account">{user?<><strong>{user}</strong><button onClick={logout}>Log out</button></>:<><a href="/login">Log in</a><a className="button" href="/register">Sign up</a></>}</div></header>;
}
