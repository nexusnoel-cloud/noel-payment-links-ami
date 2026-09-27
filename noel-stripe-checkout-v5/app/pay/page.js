import crypto from 'crypto';
import CheckoutClient from './CheckoutClient';

function valid(name,amount,sig){
  if(!process.env.STRIPE_SECRET_KEY) return false;
  const expected=crypto.createHmac('sha256',process.env.STRIPE_SECRET_KEY).update(`${name}|${amount}`).digest('hex');
  try{return crypto.timingSafeEqual(Buffer.from(expected),Buffer.from(String(sig||'')));}catch{return false;}
}

export default async function PayPage({searchParams}){
  const p=await searchParams;
  const name=String(p?.name||'').trim().slice(0,120);
  const amount=Number(p?.amount);
  const sig=String(p?.sig||'');
  const ok=name && Number.isInteger(amount) && amount>=1000 && amount<=2000000 && valid(name,amount,sig);
  if(!ok){
    return <main style={{maxWidth:680,margin:'0 auto',padding:'72px 20px'}}><div style={{background:'#fff',borderRadius:24,padding:36,boxShadow:'0 10px 40px rgba(0,0,0,.06)'}}><div style={{fontSize:12,letterSpacing:2,color:'#6c766f'}}>NOÉL</div><h1 style={{fontSize:28,margin:'18px 0 10px'}}>INVALID LINK</h1><p style={{lineHeight:1.8,color:'#5b635e'}}>このお支払いリンクは無効です。新しいリンクをご確認ください。</p></div></main>;
  }
  return <CheckoutClient name={name} amount={amount} sig={sig}/>;
}
