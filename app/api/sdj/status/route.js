import Stripe from 'stripe';
import {isPaidSDJ} from '../../../../lib/sdj';
const headers = {'Cache-Control':'no-store'};
export async function POST(request) {
  try {
    const {clientSecret} = await request.json();
    if (typeof clientSecret !== 'string' || !/^pi_[A-Za-z0-9]+_secret_[A-Za-z0-9]+$/.test(clientSecret)) return Response.json({error:'お支払い情報を確認できません。'}, {status:400,headers});
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const pi = await stripe.paymentIntents.retrieve(clientSecret.split('_secret_')[0]);
    if (pi.client_secret !== clientSecret) return Response.json({error:'お支払い情報を確認できません。'}, {status:403,headers});
    if (!isPaidSDJ(pi)) return Response.json({paid:false,status:pi.status}, {headers});
    return Response.json({paid:true,url:'https://mosh.jp/products/a1bacce0-f878-4e59-8268-dc01cad14198?openExternalBrowser=1'}, {headers});
  } catch { return Response.json({error:'お支払い状況の確認に失敗しました。再読み込みしてお試しください。'}, {status:500,headers}); }
}
