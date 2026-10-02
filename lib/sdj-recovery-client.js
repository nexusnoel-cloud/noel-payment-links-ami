// A fresh Stripe return always takes precedence over browser recovery state.
// BASIC can succeed without a redirect query, so its newly saved secret must
// take precedence over an abandoned PREMIUM session retained in older tabs.
export function selectSDJRecovery({freshSecret, freshSession, storedSecret, storedSession} = {}) {
  if (freshSecret) return {clientSecret: freshSecret};
  if (freshSession) return {sessionId: freshSession};
  if (storedSecret) return {clientSecret: storedSecret};
  if (storedSession) return {sessionId: storedSession};
  return null;
}
