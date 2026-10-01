export const SDJ_AMOUNT = 39800;
export const SDJ_PRODUCT = 'self-discovery-journey';
export const SDJ_NAME = 'SELF DISCOVERY JOURNEY';
export function isPaidSDJ(pi) {
  return pi?.status === 'succeeded' && pi.amount === SDJ_AMOUNT && pi.amount_received === SDJ_AMOUNT && pi.currency === 'jpy' && pi.metadata?.product === SDJ_PRODUCT;
}
