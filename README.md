# NOÉL Payment Links v7

トップページ自体が管理者向けの決済リンク生成画面です。

## 使い方

1. トップURLを開く
2. 商品名・金額・管理PINを入力
3. 生成された `/pay?...` の専用リンクを購入者へ送る
4. 購入者は名前・メール・カード情報を入力し、利用可能な場合は分割払いを選択

## Vercel Environment Variables

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `LINK_ADMIN_PIN`

`/make-link` も引き続き同じ生成画面として利用できます。


## Fixed public payment URL
Set `PAYMENT_BASE_URL=https://noel-payment-links-ami.vercel.app` in Vercel. Generated customer links will always use this public Production domain instead of protected Preview deployment URLs.


## SDJ two-plan checkout (release checklist)

- `/sdj?plan=basic`: 14,900 JPY including tax. All materials, SELF GUIDE / MY MANUAL sheets, and LINE question support.
- `/sdj?plan=premium`: 39,800 JPY including tax. BASIC content plus one 60-minute individual session. Ten places.
- Links without a `plan` continue selecting PREMIUM, but the payment API requires an explicit valid plan. It never creates a direct PREMIUM PaymentIntent.
- The original signed-link `/pay` flow retains its previous Stripe API version. SDJ uses Stripe SDK 22.6.0 and its current API version.

### Required before production publication

1. Create one PREMIUM Stripe Product / one-time JPY Price for 39,800, `tax_behavior=inclusive`. Do not enable recurring billing, promotions, adjustable quantities, shipping, optional items, or automatic tax.
2. Create exactly one Payment Link with quantity 1, `restrictions.completed_sessions.limit=10`, and product/plan metadata on both the link and `payment_intent_data`: `product=self-discovery-journey`, `plan=premium`.
3. Configure `after_completion.type=redirect` and `after_completion.redirect.url=https://noel-payment-links-ami.vercel.app/sdj/success?session_id={CHECKOUT_SESSION_ID}`. Configure required name collection, ordinary payment-method collection, and a clear SOLD OUT inactive message. No setup_future_usage, invoice creation, or additional paid services are required.
4. Keep the new link inactive and unpublished while preparing the cutover. Set `SDJ_PREMIUM_PAYMENT_LINK_ID` to its verified live ID. Missing/misconfigured links fail closed with PREMIUM unavailable, not a false SOLD OUT.
5. Reconcile existing live paid purchases and outstanding standalone SDJ PaymentIntents before cutover. Existing paid 39,800 orders without plan metadata retain PREMIUM entitlement. Only cancel specifically authorized, still-unpaid intents after re-reading their status and amount_received. A standalone legacy PaymentIntent is outside the Payment Link's cap.
6. Publish code disabling the old direct-PREMIUM creation route before activating or sharing the new Payment Link. Confirm the exact deployment commit completed successfully. Keep PREMIUM unavailable until the old outstanding-intent cutover is resolved. Then activate the verified link and publish the LP plan links together. If any step fails, leave the new link inactive and do not run both uncapped old and capped new acceptance paths.
7. Verify live read-only configuration, price/metadata/cap, availability API, both checkout screens, and the no-purchase recovery page. Do not claim a completed payment test without one.

### Availability API

`GET /api/sdj/availability` returns only availability, never customer data or sales counts:

```json
{"basic":{"status":"available"},"premium":{"status":"available"}}
```

PREMIUM status is `available`, `sold_out` (the configured 10 completed sessions were reached), or `unavailable` (including manual deactivation and configuration/provider errors). The response uses `Cache-Control: no-store` and grants read-only CORS to `https://self-discovery-journey.amichandayo.chatgpt.site`. Consumers must treat transport/schema errors as unavailable, not sold out. BASIC remains independent of PREMIUM capacity.

### Capacity guarantee boundary

Stripe documents `restrictions.completed_sessions.limit` as a maximum completed-session count and a native limited-inventory feature. All new PREMIUM purchases use that one provider-side cap. Application mocks verify that there is no alternative direct PREMIUM intent path and that closed links reject requests; they do **not** exercise Stripe's real simultaneous-payment behavior. Existing open Checkout Session concurrency is not independently proven by these tests. The counter represents completed sessions and may include asynchronous payments that are not yet settled. An unpaid/processing session never grants course access.

References:
- https://docs.stripe.com/payment-links/customize#limit-payments
- https://docs.stripe.com/api/payment-link/object
- https://docs.stripe.com/payments/jp-installments/accept-a-payment?payment-ui=payment-links

### Fulfillment and recovery

The success API verifies the live Checkout Session belongs to the configured link, is paid, and has the exact product, plan, JPY total, and successful underlying PaymentIntent before returning the MOSH registration URL. BASIC and legacy PaymentIntent recovery remain supported. A signed 90-day HttpOnly cookie supports returning on the same browser. MOSH registration remains a separate purchaser action; this repository does not provision accounts or automatically email the guide.

The existing integration has no payment webhook. Production-grade server-side fulfillment and durable recovery independent of browser returns require a separately configured and verified webhook/fulfillment workflow; do not imply they are implemented here or create new credentials without authorization.

### Verification

- `npm test` runs credential-free Node tests with mocked Stripe resources. Fixtures are not sales.
- `STRIPE_SECRET_KEY=sk_test_build_placeholder NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_build_placeholder npm run build` verifies build/prerender with nonworking placeholders. These values cannot make a payment.
- Live Stripe payment tests are not part of this verification.
