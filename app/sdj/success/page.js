'use client';
import {useEffect,useState} from 'react';
import '../sdj.css';
const help='https://mosh.jp/products/a1bacce0-f878-4e59-8268-dc01cad14198?openExternalBrowser=1';
export default function Success(){
 const [state,setState]=useState({loading:true}),[retry,setRetry]=useState(0);
 useEffect(()=>{let live=true,timer;let secret;
 try{secret=new URLSearchParams(location.search).get('payment_intent_client_secret')||sessionStorage.getItem('sdj-payment');if(secret)sessionStorage.setItem('sdj-payment',secret);}catch{}
 history.replaceState(null,'','/sdj/success');setState({loading:true});
 async function check(attempt=0){try{
 const response=await fetch('/api/sdj/status',secret?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({clientSecret:secret})}:{cache:'no-store'});
 const data=await response.json();if(!live)return;if(!response.ok)throw new Error(data.error);
 if(data.paid){setState({url:data.url});return;}
 if(data.status==='processing'&&attempt<5){setState({loading:true,processing:true});timer=setTimeout(()=>check(attempt+1),3000);return;}
 setState({error:data.status==='processing'?'お支払いの確認に時間がかかっています。追加でお支払いせず、時間をおいて「もう一度確認する」を押してください。':data.status==='not_found'?'このブラウザではお支払い情報が見つかりません。購入時と同じブラウザで開くか、保存した受講案内をご確認ください。':'お支払いの完了をまだ確認できません。カード会社から引き落としの通知がある場合は、再決済せずお問い合わせください。'});
 }catch(e){if(live)setState({error:e.message||'確認できませんでした。再決済せず、もう一度確認してください。'});}}
 check();return()=>{live=false;clearTimeout(timer);};
 },[retry]);
 function saveGuide(){const text=`SELF DISCOVERY JOURNEY｜受講案内\n\nお支払いは完了しています。\n\n1. 専用ページを開きます\n${state.url}\n\n2.「申し込みへ進む」を選び、MOSHに会員登録・ログインします。初めての方は氏名・電話番号・メール・パスワードの入力が必要です。\n\n3. 受講登録を完了してください。0円の表示は受講登録用です。追加のお支払いはありません。登録後はMOSHのマイページから受講できます。\n\n30日を過ぎても、ご自身のペースで進められます。\nこの案内はご購入者ご本人用です。\n\n販売事業者：株式会社NEXUS\nお問い合わせ：上記専用ページ内「クリエイターに問い合わせる」\n`;const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='SELF-DISCOVERY-JOURNEY-guide.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 return <main className="sdj"><header><span>NEXUS</span><p>SELF DISCOVERY JOURNEY</p></header><section className="card">{state.loading?<><h1>お支払いを確認しています…</h1><p role="status">{state.processing?'確認できるまで、追加のお支払いはせずにお待ちください。':'少しお待ちください。'}</p></>:state.url?<><p className="eyebrow">WELCOME TO YOUR JOURNEY</p><h1>お支払いが完了しました。</h1><p>お申込みありがとうございます。<br/>続いて受講登録をして、プログラムを始めましょう。</p><p className="notice"><strong>この先で、追加のお支払いはありません。</strong><br/>MOSHの「0円」は、受講登録のための表示です。</p><ol><li>下のボタンから専用の受講ページを開き、「申し込みへ進む」を選びます。</li><li>配信プラットフォーム「MOSH」に会員登録、またはログインします。初めての方は氏名・電話番号・メールアドレス・パスワードを入力します。</li><li>入力内容を確認し、受講登録を完了してください。</li></ol><a className="button" href={state.url} rel="noreferrer">専用ページで受講登録する</a><button className="secondary" onClick={saveGuide}>受講案内を保存する</button><p className="small">登録後はMOSHのマイページから受講できます。<br/>案内を保存しておくと、別の端末でも受講登録の手順を確認できます。</p></>:<><h1>受講案内・お支払い状況の確認</h1><p role="alert">{state.error}</p><button onClick={()=>setRetry(x=>x+1)}>もう一度確認する</button><p className="small">すでに受講登録がお済みの方は、MOSHのマイページをご確認ください。登録できない場合は、下のお問い合わせ先に購入時のお名前・メールアドレス・お支払い日時をお知らせください。カード番号は送らないでください。</p><a className="back" href="/sdj">お申込みページへ戻る</a></>}</section><footer>販売事業者：株式会社NEXUS<nav><a href={help} target="_blank" rel="noreferrer">お問い合わせ（専用ページ内）</a><a href="https://mosh.jp/540764/law" target="_blank" rel="noreferrer">特定商取引法に基づく表示</a></nav></footer></main>;
}
