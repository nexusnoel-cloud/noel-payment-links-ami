import {getSDJPlan,getPaidSDJPlan,SDJ_PRODUCT,SDJ_NAME,SDJ_PREMIUM_LIMIT} from './sdj.js';

export const SDJ_ACCOUNT = 'acct_1HQOMtEJt4Fws7qP';
export const SDJ_GUIDE_URL = 'https://mosh.jp/products/a1bacce0-f878-4e59-8268-dc01cad14198?openExternalBrowser=1';
export const SDJ_SUCCESS_URL = 'https://noel-payment-links-ami.vercel.app/sdj/success';
// Configure only the single, verified live Payment Link with the 10-session cap.
// An absent or misconfigured link fails closed; BASIC stays available.
export const SDJ_PREMIUM_LINK_ID = process.env.SDJ_PREMIUM_PAYMENT_LINK_ID || '';
export class SDJError extends Error {
  constructor(message,status=503,code='unavailable') { super(message); this.status=status; this.code=code; }
}
export async function assertSDJAccount(stripe) {
  const account=await stripe.accounts.retrieve();
  if(account.id!==SDJ_ACCOUNT) throw new SDJError('決済設定を確認中です。しばらくしてからお試しください。');
}
export function inspectPremiumLink(link) {
  const limit=link?.restrictions?.completed_sessions?.limit;
  const count=link?.restrictions?.completed_sessions?.count;
  const items=link?.line_items?.data;
  const item=items?.[0];
  const piMetadata=link?.payment_intent_data?.metadata;
  const expectedReturn=SDJ_SUCCESS_URL+'?session_id={CHECKOUT_SESSION_ID}';
  let safeURL=false;
  try{const url=new URL(link.url);safeURL=url.protocol==='https:'&&url.hostname==='buy.stripe.com'&&!url.username&&!url.password;}catch{}
  if (!link?.livemode || link.metadata?.product!==SDJ_PRODUCT || link.metadata?.plan!=='premium' ||
      piMetadata?.product!==SDJ_PRODUCT || piMetadata?.plan!=='premium' ||
      limit!==SDJ_PREMIUM_LIMIT || !Number.isInteger(count) || count<0 || !safeURL ||
      items?.length!==1 || link.line_items.has_more || item.quantity!==1 || item.adjustable_quantity?.enabled ||
      item.price?.unit_amount!==39800 || item.price?.currency!=='jpy' || item.price?.tax_behavior!=='inclusive' || item.price?.recurring ||
      link.allow_promotion_codes || link.optional_items?.length || link.shipping_options?.length || link.automatic_tax?.enabled ||
      (link.payment_intent_data?.capture_method && !['automatic','automatic_async'].includes(link.payment_intent_data.capture_method)) ||
      link.after_completion?.type!=='redirect' || link.after_completion.redirect?.url!==expectedReturn) {
    throw new SDJError('受付状況を確認できません。時間をおいて、もう一度ご確認ください。');
  }
  return {status:count>=limit?'sold_out':link.active?'available':'unavailable',url:link.url};
}
export async function premiumAvailability(stripe,linkId=SDJ_PREMIUM_LINK_ID) {
  if(!/^plink_[A-Za-z0-9]+$/.test(linkId)) throw new SDJError('受付状況を確認中です。時間をおいて、もう一度ご確認ください。');
  return inspectPremiumLink(await stripe.paymentLinks.retrieve(linkId,{expand:['line_items.data.price']}));
}
export async function prepareSDJPayment(stripe,input,previousId,linkId=SDJ_PREMIUM_LINK_ID) {
  // No default: old clients must not create uncapped PREMIUM PaymentIntents.
  const plan=getSDJPlan(input?.plan);
  if(!plan) throw new SDJError('プランを選び直してからお進みください。',400,'invalid_plan');
  await assertSDJAccount(stripe);
  if(previousId){const previous=await stripe.paymentIntents.retrieve(previousId);if(getPaidSDJPlan(previous))return {paid:true};}
  if(plan.hasSession){
    const available=await premiumAvailability(stripe,linkId);
    if(available.status==='sold_out') throw new SDJError('PREMIUMはSOLD OUTのため受付を終了しました。',409,'sold_out');
    if(available.status!=='available') throw new SDJError('受付状況を確認中です。時間をおいて、もう一度ご確認ください。');
    // The server never mints a direct PREMIUM PaymentIntent. All purchases go
    // through the same Stripe-enforced completed-session cap.
    return {url:available.url,plan:plan.id};
  }
  const {customerName,email,requestId}=input;
  if(typeof customerName!=='string'||!customerName.trim()||customerName.length>120||typeof email!=='string'||email.length>254||!/^\S+@\S+\.\S+$/.test(email)||!/^[a-f0-9-]{36}$/.test(requestId||'')) throw new SDJError('お名前とメールアドレスをご確認ください。',400,'invalid_customer');
  const pi=await stripe.paymentIntents.create({amount:plan.amount,currency:'jpy',allowed_payment_method_types:['card'],payment_method_options:{card:{installments:{enabled:true}}},description:`${SDJ_NAME} | ${plan.name}`,receipt_email:email.trim(),metadata:{product:SDJ_PRODUCT,productName:SDJ_NAME,plan:plan.id,customerName:customerName.trim()}},{idempotencyKey:`sdj-v2-${plan.id}-${requestId}`});
  return {clientSecret:pi.client_secret,paymentIntentId:pi.id,plan:plan.id};
}
export async function paidSessionIntent(stripe,sessionId,linkId=SDJ_PREMIUM_LINK_ID) {
  if(typeof sessionId!=='string'||!/^cs_live_[A-Za-z0-9]+$/.test(sessionId)) throw new SDJError('お支払い情報を確認できません。',400,'invalid_session');
  const session=await stripe.checkout.sessions.retrieve(sessionId,{expand:['payment_intent']});
  if(!linkId||session.payment_link!==linkId||session.livemode!==true||session.mode!=='payment'||session.currency!=='jpy'||session.amount_total!==39800||session.metadata?.product!==SDJ_PRODUCT||session.metadata?.plan!=='premium') throw new SDJError('お支払い情報を確認できません。',403,'invalid_session');
  if(session.status!=='complete'||session.payment_status!=='paid')return {status:session.status==='complete'?'processing':'requires_payment_method'};
  const pi=typeof session.payment_intent==='string'?await stripe.paymentIntents.retrieve(session.payment_intent):session.payment_intent;
  if(getPaidSDJPlan(pi)?.id!=='premium'||pi.livemode!==true)throw new SDJError('お支払い情報を確認できません。',403,'invalid_session');
  return pi;
}
