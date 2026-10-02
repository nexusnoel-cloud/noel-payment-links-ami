import Stripe from 'stripe';
import {getPaidSDJPlan} from '../../../../lib/sdj';
import {recoveryId,recoveryCookie} from '../../../../lib/sdj-recovery';
import {SDJ_GUIDE_URL,paidSessionIntent,SDJError} from '../../../../lib/sdj-server';
const headers={'Cache-Control':'no-store'};
function result(pi){
 const plan=getPaidSDJPlan(pi);
 if(!plan)return Response.json({paid:false,status:pi?.status||'not_found'},{headers});
 return Response.json({paid:true,url:SDJ_GUIDE_URL,plan:plan.id,hasSession:plan.hasSession},{headers:{...headers,'Set-Cookie':recoveryCookie(pi.id)}});
}
export async function GET(request){try{
 const id=recoveryId(request);if(!id)return Response.json({paid:false,status:'not_found'},{headers});
 const pi=await new Stripe(process.env.STRIPE_SECRET_KEY).paymentIntents.retrieve(id);return result(pi);
}catch{return Response.json({error:'お支払い状況を確認できませんでした。再度お試しください。'},{status:500,headers});}}
export async function POST(request){try{
 const {clientSecret,sessionId}=await request.json();
 const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);
 if(sessionId!==undefined)return result(await paidSessionIntent(stripe,sessionId));
 if(typeof clientSecret!=='string'||!/^pi_[A-Za-z0-9]+_secret_[A-Za-z0-9]+$/.test(clientSecret))return Response.json({error:'お支払い情報を確認できません。'},{status:400,headers});
 const pi=await stripe.paymentIntents.retrieve(clientSecret.split('_secret_')[0]);
 if(pi.client_secret!==clientSecret)return Response.json({error:'お支払い情報を確認できません。'},{status:403,headers});
 return result(pi);
}catch(error){return Response.json({error:error instanceof SDJError?error.message:'お支払い状況の確認に失敗しました。再度お試しください。'},{status:error instanceof SDJError?error.status:500,headers});}}
