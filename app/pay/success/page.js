import {redirect} from 'next/navigation';

const bookingUrls={
  '繰り返す悩みのパターン解析':'https://timerex.net/s/amibeautyjp/1ec4664c'
};

export default async function Success({searchParams}){
  const params=await searchParams;
  const bookingUrl=bookingUrls[params?.product];
  if(bookingUrl)redirect(bookingUrl);

  return <main style={{maxWidth:680,margin:'0 auto',padding:'72px 20px'}}><div style={{background:'#fff',borderRadius:24,padding:36,boxShadow:'0 10px 40px rgba(0,0,0,.06)'}}><div style={{fontSize:12,letterSpacing:2,color:'#6c766f'}}>NOÉL</div><h1 style={{fontSize:28,margin:'18px 0 10px'}}>THANK YOU</h1><p style={{lineHeight:1.8,color:'#5b635e'}}>お支払いありがとうございました。</p></div></main>
}
