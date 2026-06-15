# PayPal Sandbox Checkout Setup

ChinaEase Buddy uses Cloudflare Pages Functions for the PayPal Orders API. Live checkout must stay disabled until the full Sandbox flow has passed owner QA.

## Required Cloudflare variables

Add these as Cloudflare Pages environment variables or secrets:

- `PAYMENT_MODE`: `manual`, `sandbox`, or `live`. Use `manual` in production until Sandbox QA is approved.
- `PAYPAL_ENV`: `sandbox` or `live`.
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_WEBHOOK_ID`
- `PAYPAL_MERCHANT_ID` (optional but recommended for capture merchant verification)
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `ALLOWED_ORIGINS`
- `COZE_WORKER_URL`
- `COZE_BOT_ID`
- `COZE_INTERNAL_SECRET`

Use Cloudflare secrets for `PAYPAL_CLIENT_SECRET`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, and `COZE_INTERNAL_SECRET`. The Coze Worker should reject direct anonymous calls and require the same internal token header used by `/api/buddy/chat`.

## Sandbox webhook

After deployment, configure the PayPal Sandbox app webhook URL:

`https://chinaeasebuddy.com/api/paypal/webhook`

Subscribe to:

- `PAYMENT.CAPTURE.COMPLETED`
- `PAYMENT.CAPTURE.PENDING`
- `PAYMENT.CAPTURE.DECLINED`
- `PAYMENT.CAPTURE.REFUNDED`
- `PAYMENT.CAPTURE.REVERSED`

## Safety notes

- `PAYMENT_MODE=live` is blocked in the current Functions code until owner approval.
- The browser sends only a plan ID. Price, quota, currency, and duration come from the server-side catalogue.
- Entitlements are granted only after verified capture or verified completed webhook processing.
- The current manual PayPal links remain in source as fallback configuration, but automatic checkout is controlled by `PAYMENT_MODE`.
