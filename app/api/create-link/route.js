import crypto from 'crypto';

function sign(name, amount){
  const key = process.env.STRIPE_SECRET_KEY;
  if(!key) throw new Error('STRIPE_SECRET_KEY is not configured');
  return crypto.createHmac('sha256', key).update(`${name}|${amount}`).digest('hex');
}

export async function POST(request){
  try{
    const {name, amount, pin} = await request.json();
    if(!process.env.LINK_ADMIN_PIN){
      return Response.json({error:'LINK_ADMIN_PIN が未設定です。'}, {status:500});
    }
    if(pin !== process.env.LINK_ADMIN_PIN){
      return Response.json({error:'PINが違います。'}, {status:401});
    }
    const cleanName = String(name || '').trim().slice(0,120);
    const cleanAmount = Number(amount);
    if(!cleanName) return Response.json({error:'商品名を入力してください。'}, {status:400});
    if(!Number.isInteger(cleanAmount) || cleanAmount < 1000 || cleanAmount > 2000000){
      return Response.json({error:'金額は1,000〜2,000,000円の整数で入力してください。'}, {status:400});
    }
    const sig = sign(cleanName, cleanAmount);
    const origin = (process.env.PAYMENT_BASE_URL || 'https://noel-payment-links-ami.vercel.app').replace(/\/$/, '');
    const url = `${origin}/pay?name=${encodeURIComponent(cleanName)}&amount=${cleanAmount}&sig=${sig}`;
    return Response.json({url});
  }catch(err){
    return Response.json({error:err?.message || 'リンク生成に失敗しました。'}, {status:500});
  }
}
