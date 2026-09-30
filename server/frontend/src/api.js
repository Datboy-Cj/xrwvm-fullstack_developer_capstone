export async function api(path, data) {
  const csrf = document.cookie.split('; ').find(x=>x.startsWith('csrftoken='))?.split('=')[1];
  const response=await fetch('/djangoapp/'+path,{credentials:'same-origin',...(data!==undefined?{method:'POST',headers:{'Content-Type':'application/json','X-CSRFToken':csrf||''},body:JSON.stringify(data)}:{})});
  const result=await response.json();
  if(!response.ok) throw new Error(result.message||'Request failed. Please try again.');
  return result;
}
