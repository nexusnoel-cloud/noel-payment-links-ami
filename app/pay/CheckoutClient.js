'use client';
import {useState} from 'react';
import {loadStripe} from '@stripe/stripe-js';
import {Elements, PaymentElement, useStripe, useElements} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
const yen=n=>new Intl.NumberFormat('ja-JP').format(n)+'円';

function Form({name,amount,sig}){
  const stripe=useStripe();
  const elements=useElements();
  const [customerName,setCustomerName]=useState('');
  const [email,setEmail]=useState('');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');

  async function submit(e){
    e.preventDefault();
    if(!stripe||!elements||busy)return;
    if(!customerName.trim()){setMessage('お名前を入力してください。');return;}
    if(!/^\S+@\S+\.\S+$/.test(email.trim())){setMessage('メールアドレスをご確認ください。');return;}
    setBusy(true);setMessage('');

    const {error:submitError}=await elements.submit();
    if(submitError){setMessage(submitError.message||'入力内容をご確認ください。');setBusy(false);return;}

    try{
      const r=await fetch('/api/create-payment-intent',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({name,amount,sig,customerName:customerName.trim(),email:email.trim()})
      });
      const d=await r.json();
      if(!r.ok||!d.clientSecret){setMessage(d.error||'決済の準備に失敗しました。');setBusy(false);return;}

      const {error}=await stripe.confirmPayment({
        elements,
        clientSecret:d.clientSecret,
        confirmParams:{
          return_url:window.location.origin+'/pay/success',
          payment_method_data:{billing_details:{name:customerName.trim(),email:email.trim()}}
        },
        redirect:'if_required'
      });
      if(error){setMessage(error.message||'決済に失敗しました。');setBusy(false);return;}
      setMessage('お支払いが完了しました。');
    }catch{
      setMessage('通信エラーが発生しました。');
    }finally{
      setBusy(false);
    }
  }

  return <form onSubmit={submit}>
    <label style={label}>お名前</label>
    <input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="山田 花子" autoComplete="name" style={input}/>
    <label style={label}>メールアドレス</label>
    <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="example@email.com" type="email" autoComplete="email" style={input}/>
    <div style={{marginTop:22}}><PaymentElement options={{layout:'tabs'}}/></div>
    <button disabled={!stripe||busy} style={button}>{busy?'処理中…':`${yen(amount)}を支払う`}</button>
    {message&&<p style={{marginTop:16,color:message.includes('完了')?'#1f5a45':'#a33',lineHeight:1.6}}>{message}</p>}
  </form>;
}

export default function CheckoutClient({name,amount,sig}){
  const options={
    mode:'payment',
    amount,
    currency:'jpy',
    paymentMethodTypes:['card'],
    paymentMethodOptions:{card:{installments:{enabled:true}}},
    locale:'ja',
    appearance:{theme:'stripe',variables:{borderRadius:'12px',colorPrimary:'#1f5a45'}}
  };
  return <main style={{maxWidth:720,margin:'0 auto',padding:'56px 20px'}}>
    <div style={{background:'#fff',borderRadius:24,padding:32,boxShadow:'0 10px 40px rgba(0,0,0,.06)'}}>
      <div style={{fontSize:12,letterSpacing:2,color:'#6c766f'}}>NOÉL</div>
      <h1 style={{fontSize:30,margin:'20px 0 8px'}}>{name}</h1>
      <div style={{fontSize:20,fontWeight:700,marginBottom:24}}>{yen(amount)} <span style={{fontSize:14,fontWeight:500}}>（税込）</span></div>
      <p style={{lineHeight:1.8,color:'#5b635e',marginBottom:28}}>クレジットカードで一括払い、またはご利用のカードで選択可能な分割払いをご利用いただけます。分割回数はカード会社・カードブランド・ご利用状況により異なります。</p>
      <Elements stripe={stripePromise} options={options}><Form name={name} amount={amount} sig={sig}/></Elements>
      <p style={{fontSize:11,color:'#8a918d',lineHeight:1.7,marginTop:22}}>決済はStripeにより安全に処理されます。</p>
    </div>
  </main>;
}

const input={width:'100%',boxSizing:'border-box',padding:'14px 15px',border:'1px solid #d8ddd9',borderRadius:12,fontSize:16,outline:'none',marginBottom:16,background:'#fff'};
const label={display:'block',fontSize:13,fontWeight:700,color:'#344039',marginBottom:8};
const button={width:'100%',marginTop:24,padding:'16px 20px',background:'#1f5a45',color:'#fff',border:0,borderRadius:999,fontSize:16,fontWeight:700,cursor:'pointer'};
