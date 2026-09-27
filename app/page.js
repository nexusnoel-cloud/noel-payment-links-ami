'use client';
import {useState} from 'react';

export default function MakeLink(){
  const [name,setName]=useState('');
  const [amount,setAmount]=useState('298000');
  const [pin,setPin]=useState('');
  const [url,setUrl]=useState('');
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);

  async function create(e){
    e.preventDefault(); setBusy(true); setMessage(''); setUrl('');
    try{
      const r=await fetch('/api/create-link',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,amount:Number(amount),pin})});
      const d=await r.json();
      if(!r.ok){setMessage(d.error||'生成できませんでした。');return;}
      setUrl(d.url);
    }catch{setMessage('通信エラーが発生しました。');}
    finally{setBusy(false);}
  }

  async function copy(){
    await navigator.clipboard.writeText(url); setMessage('リンクをコピーしました。');
  }

  return <main style={{maxWidth:680,margin:'0 auto',padding:'56px 20px'}}>
    <div style={{background:'#fff',borderRadius:24,padding:32,boxShadow:'0 10px 40px rgba(0,0,0,.06)'}}>
      <div style={{fontSize:12,letterSpacing:2,color:'#6c766f'}}>NOÉL ADMIN</div>
      <h1 style={{fontSize:28,margin:'18px 0 8px'}}>PAYMENT LINK MAKER</h1>
      <p style={{color:'#5b635e',lineHeight:1.8}}>商品名と金額を入れると、改ざん防止済みのお支払いリンクを生成します。</p>
      <form onSubmit={create} style={{display:'grid',gap:16,marginTop:24}}>
        <label>商品名<input value={name} onChange={e=>setName(e.target.value)} placeholder="例：3 MONTH PROGRAM" style={input}/></label>
        <label>金額（円）<input value={amount} onChange={e=>setAmount(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" style={input}/></label>
        <label>管理PIN<input type="password" value={pin} onChange={e=>setPin(e.target.value)} style={input}/></label>
        <button disabled={busy} style={button}>{busy?'生成中…':'リンクを生成'}</button>
      </form>
      {url && <div style={{marginTop:24,padding:16,border:'1px solid #d8ddd9',borderRadius:14,wordBreak:'break-all'}}>
        <div style={{fontSize:12,color:'#778079',marginBottom:8}}>生成されたリンク</div>
        <div style={{lineHeight:1.6}}>{url}</div>
        <button onClick={copy} style={{...button,marginTop:14}}>コピー</button>
      </div>}
      {message && <p style={{marginTop:16,color:message.includes('コピー')?'#1f5a45':'#a33'}}>{message}</p>}
    </div>
  </main>;
}
const input={display:'block',width:'100%',boxSizing:'border-box',marginTop:8,padding:'14px 15px',border:'1px solid #cfd6d1',borderRadius:12,fontSize:16};
const button={width:'100%',padding:'15px 18px',background:'#1f5a45',color:'#fff',border:0,borderRadius:999,fontSize:16,fontWeight:700,cursor:'pointer'};
