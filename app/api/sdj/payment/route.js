import Stripe from 'stripe';
import {recoveryCookie,recoveryId} from '../../../../lib/sdj-recovery';
import {prepareSDJPayment,SDJError} from '../../../../lib/sdj-server';
export async function POST(request) {
  const headers={'Cache-Control':'no-store'};
  try {
    const input=await request.json();
    const result=await prepareSDJPayment(new Stripe(process.env.STRIPE_SECRET_KEY),input,recoveryId(request));
    if(result.paymentIntentId)headers['Set-Cookie']=recoveryCookie(result.paymentIntentId);
    const {paymentIntentId,...body}=result;
    return Response.json(body,{headers});
  } catch(error) {
    return Response.json({error:error instanceof SDJError?error.message:'決済の準備ができませんでした。時間をおいて、もう一度お試しください。',code:error instanceof SDJError?error.code:'unavailable'},{status:error instanceof SDJError?error.status:503,headers});
  }
}
