import Stripe from 'stripe';
import {assertSDJAccount,premiumAvailability} from '../../../../lib/sdj-server';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store','Access-Control-Allow-Origin':'https://self-discovery-journey.amichandayo.chatgpt.site','Vary':'Origin'};
export async function GET() {
  try{
    const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);
    await assertSDJAccount(stripe);
    const premium=await premiumAvailability(stripe);
    return Response.json({basic:{status:'available'},premium:{status:premium.status}},{headers});
  }catch{return Response.json({basic:{status:'available'},premium:{status:'unavailable'}},{status:503,headers});}
}
