import Stripe from 'stripe';
import {SDJ_AMOUNT, SDJ_PRODUCT, SDJ_NAME} from '../../../../lib/sdj';
export async function POST(request) {
  try {
    const {customerName, email, requestId} = await request.json();
    if (typeof customerName !== 'string' || !customerName.trim() || customerName.length > 120 || typeof email !== 'string' || email.length > 254 || !/^\S+@\S+\.\S+$/.test(email) || !/^[a-f0-9-]{36}$/.test(requestId || '')) return Response.json({error:'お名前とメールアドレスをご確認ください。'}, {status:400});
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const account = await stripe.accounts.retrieve();
    if (account.id !== 'acct_1HQOMtEJt4Fws7qP') return Response.json({error:'決済設定を確認中です。しばらくしてからお試しください。'}, {status:503});
    const pi = await stripe.paymentIntents.create({amount:SDJ_AMOUNT,currency:'jpy',payment_method_types:['card'],payment_method_options:{card:{installments:{enabled:true}}},description:SDJ_NAME,receipt_email:email.trim(),metadata:{product:SDJ_PRODUCT,productName:SDJ_NAME,customerName:customerName.trim()}}, {idempotencyKey:`sdj-${requestId}`});
    return Response.json({clientSecret:pi.client_secret}, {headers:{'Cache-Control':'no-store'}});
  } catch { return Response.json({error:'決済の準備ができませんでした。時間をおいて、もう一度お試しください。'}, {status:500}); }
}
