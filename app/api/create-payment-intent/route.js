import Stripe from 'stripe';
import crypto from 'crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function validSignature(name, amount, sig){
  const expected = crypto.createHmac('sha256', process.env.STRIPE_SECRET_KEY).update(`${name}|${amount}`).digest('hex');
  try{
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(sig || '')));
  }catch{
    return false;
  }
}

export async function POST(request){
  try{
    const {name, amount, sig, customerName, email} = await request.json();
    const cleanName = String(name || '').trim().slice(0,120);
    const cleanAmount = Number(amount);
    const cleanCustomerName = String(customerName || '').trim().slice(0,120);
    const cleanEmail = String(email || '').trim().slice(0,254);

    if(!cleanName || !Number.isInteger(cleanAmount) || cleanAmount < 1000 || cleanAmount > 2000000){
      return Response.json({error:'無効な商品情報です。'}, {status:400});
    }
    if(!validSignature(cleanName, cleanAmount, sig)){
      return Response.json({error:'このお支払いリンクは無効です。'}, {status:400});
    }
    if(!cleanCustomerName){
      return Response.json({error:'お名前を入力してください。'}, {status:400});
    }
    if(!/^\S+@\S+\.\S+$/.test(cleanEmail)){
      return Response.json({error:'メールアドレスをご確認ください。'}, {status:400});
    }

    const pi = await stripe.paymentIntents.create({
      amount: cleanAmount,
      currency:'jpy',
      payment_method_types:['card'],
      payment_method_options:{card:{installments:{enabled:true}}},
      description:cleanName,
      receipt_email:cleanEmail,
      metadata:{
        productName:cleanName,
        customerName:cleanCustomerName,
        customerEmail:cleanEmail,
        signedLink:'true'
      },
    });

    return Response.json({clientSecret:pi.client_secret});
  }catch(err){
    console.error('Stripe PaymentIntent error:', err);
    return Response.json({error:err?.message || 'Stripe error'}, {status:500});
  }
}
