export const SDJ_PRODUCT = 'self-discovery-journey';
export const SDJ_NAME = 'SELF DISCOVERY JOURNEY';
export const SDJ_PREMIUM_LIMIT = 10;
export const SDJ_PLANS = Object.freeze({
  basic: Object.freeze({id:'basic', name:'BASIC', amount:14900, hasSession:false}),
  premium: Object.freeze({id:'premium', name:'PREMIUM', amount:39800, hasSession:true}),
});
// Preserve the amount used by orders placed before the two-plan launch.
export const SDJ_AMOUNT = SDJ_PLANS.premium.amount;
export function getSDJPlan(id) {
  return typeof id === 'string' && Object.hasOwn(SDJ_PLANS,id) ? SDJ_PLANS[id] : null;
}
export function getPaidSDJPlan(pi) {
  if (pi?.livemode !== true || pi?.status !== 'succeeded' || pi.currency !== 'jpy' || pi.metadata?.product !== SDJ_PRODUCT) return null;
  // Orders placed before launch had no plan metadata. They retain PREMIUM access.
  const plan = getSDJPlan(pi.metadata.plan || 'premium');
  return plan && pi.amount === plan.amount && pi.amount_received === plan.amount ? plan : null;
}
export function isPaidSDJ(pi) { return Boolean(getPaidSDJPlan(pi)); }
export function sdjOrderKey(plan,email,name) {
  return 'sdj-order-v2-'+JSON.stringify([plan,email.trim().toLowerCase(),name.trim()]);
}
