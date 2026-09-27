# NOÉL Stripe Checkout v5

商品名・金額を毎回変えられる、署名付き決済リンク方式です。

## 使い方
1. VercelのEnvironment Variablesに既存のStripeキー2つに加え、`LINK_ADMIN_PIN` を追加します。
2. `/make-link` を開きます。
3. 商品名・金額・管理PINを入力してリンク生成。
4. 生成された `/pay?name=...&amount=...&sig=...` をお客様へ送ります。

名前や金額をURL上で書き換えると署名が一致しなくなるため決済できません。

## 必須Environment Variables
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `LINK_ADMIN_PIN`  ← Amiだけが知る任意のPIN
