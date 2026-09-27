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
