import Stripe from 'stripe';
import {isPaidSDJ} from '../../../../lib/sdj';
import {recoveryId,recoveryCookie} from '../../../../lib/sdj-recovery';
const headers={'Cache-Control':'no-store'};
const url='https://mosh.jp/products/a1bacce0-f878-4e59-8268-dc01cad14198?openExternalBrowser=1';
function result(pi){
 if(!isPaidSDJ(pi))return Response.json({paid:false,status:pi.status},{headers});
 return Response.json({paid:true,url},{headers:{...headers,'Set-Cookie':recoveryCookie(pi.id)}});
}
export async function GET(request){try{
 const id=recoveryId(request);if(!id)return Response.json({paid:false,status:'not_found'},{headers});
 const pi=await new Stripe(process.env.STRIPE_SECRET_KEY).paymentIntents.retrieve(id);return result(pi);
}catch{return Response.json({error:'お支払い状況を確認できませんでした。再度お試しください。'},{status:500,headers});}}
export async function POST(request){try{
 const {clientSecret}=await request.json();
 if(typeof clientSecret!=='string'||!/^pi_[A-Za-z0-9]+_secret_[A-Za-z0-9]+$/.test(clientSecret))return Response.json({error:'お支払い情報を確認できません。'},{status:400,headers});
 const pi=await new Stripe(process.env.STRIPE_SECRET_KEY).paymentIntents.retrieve(clientSecret.split('_secret_')[0]);
 if(pi.client_secret!==clientSecret)return Response.json({error:'お支払い情報を確認できません。'},{status:403,headers});
 return result(pi);
}catch{return Response.json({error:'お支払い状況の確認に失敗しました。再度お試しください。'},{status:500,headers});}}
