# Pass purchase and activation conversion review

Base: main `7336ae997cd6d76bb9e1ca8b3128a4007ee951e1`.
This change is for a Draft PR. No production settings, Gumroad products, real orders or customer data were read or changed.

## Small website change

- Free, Trip and Group visitors can open either paid checkout. The active tier alone gets a Current Pass badge; buying that tier again stays possible.
- Homepage, toolkit and `/pricing/` show the same independent-Pass notice before checkout. This is not a new refund restriction: it says an old purchase is not **automatically** refunded; the existing refund policy is unchanged.
- Each verified new sale still creates its own Pass. A new activation switches this browser's signed Cookie. The old Pass, expiry, quota, device list and recovery code are not merged, transferred, reset or deleted. Save the old Order ID or recovery code to restore it. There is no new account or Pass switcher.
- Customer-facing labels say **Gumroad Order ID**, matching the receipt. The existing internal `saleId` request field and server verification stay unchanged. Email alone cannot activate access; no OTP system is added in this PR.
- `https://chinaeasebuddy.com/?activate=1` opens the activation form only. It neither imports a sale/tier from URL parameters nor sends an activation request. The customer must submit the receipt reference, and the server must verify it.
- All website paid links preserve the configured product destination/query parameters and set only `wanted=true`. No price, quantity, discount, subscription or entitlement URL parameters are added.

## Evidence and limits for the receipt reference

The current official receipt template labels the reference **Order ID** and obtains it through `ChargeInfo#order_id` → `external_id_for_invoice`. For a normal Purchase this is its opaque `external_id`, also used as Sales API `id`. The numeric Sales API `order_id` is a different representation. A cart receipt can identify the first successful purchase; do not assume it identifies every cart item.

- [Receipt header](https://github.com/antiwork/gumroad/blob/a4f2a2a05333eb3daf39692bcadd9a7a88ffc83e/app/views/customer_mailer/receipt/sections/_header.html.erb#L4-L5)
- [Receipt reference](https://github.com/antiwork/gumroad/blob/a4f2a2a05333eb3daf39692bcadd9a7a88ffc83e/app/presenters/receipt_presenter/charge_info.rb#L35-L36)
- [Purchase invoice reference](https://github.com/antiwork/gumroad/blob/a4f2a2a05333eb3daf39692bcadd9a7a88ffc83e/app/models/concerns/charge/chargeable.rb#L171-L176)
- [Sales detail lookup](https://github.com/antiwork/gumroad/blob/a4f2a2a05333eb3daf39692bcadd9a7a88ffc83e/app/controllers/api/v2/sales_controller.rb#L125-L127)
- [Current URL-safe ID encoding](https://github.com/antiwork/gumroad/blob/46e67259bceafb360eebb38e466a11f6c2e0ffca/app/modules/obfuscate_ids.rb#L11-L14)

The owner described the receipt reference as containing letters/symbols. We did **not** inspect the actual receipt/reference, production Token, Sales response or successful activation evidence. The source contract and synthetic tests support this wording; they are not a claim that a real production Order ID activated successfully. Numeric references and ambiguous cart purchases are not newly supported by this copy-only activation change; contact Lin for manual verification rather than guess or grant by email.

The existing bearer-reference activation model is retained. Relabeling it does not prove control of a purchase email and does not solve theft/sharing of a complete receipt reference. An email-ownership flow would be separate work, not silently added here.

[Creator Test Purchase](https://gumroad.com/help/article/62-testing-a-purchase) does not represent an actual charge; normal emails and checkout success do not establish live payment/API acceptance. Do not treat a missing creator test purchase in the normal Sales list as proof of a production fault.

## Checkout and delivery: current official evidence

`wanted=true` is currently documented for sending fixed-price product links to checkout: [URL parameters](https://gumroad.com/help/article/270-url-parameters), [payment form](https://gumroad.com/help/article/144-send-customers-directly-to-your-payment-form). Both Passes are fixed-price products. This PR tests the generated destination with mocked checkout only; no real checkout or order was created.

Do **not** rely on the 2020 Custom Delivery announcement as proof of current automatic return support. Current official code marks `custom_delivery_url` deprecated/always null. Current receipt customization exposes a message and button text; changing that text does not change its Gumroad content-page destination.

- [Current delivery field](https://github.com/antiwork/gumroad/blob/46e67259bceafb360eebb38e466a11f6c2e0ffca/app/javascript/components/ApiDocumentation/responseFieldDefinitions.ts#L200-L204)
- [Current receipt controls](https://github.com/antiwork/gumroad/blob/46e67259bceafb360eebb38e466a11f6c2e0ffca/app/javascript/components/ProductEdit/ReceiptTab/index.tsx#L24-L32)
- [Receipt button destination](https://github.com/antiwork/gumroad/blob/46e67259bceafb360eebb38e466a11f6c2e0ffca/app/views/shared/_download_button.html.erb#L23-L26)
- [2026 receipt announcement](https://gumroad.com/blog/p/customizable-receipts)

Whether this merchant has a usable legacy/new automatic redirect control is **UNKNOWN**. Automatic return and automatic activation are separate: this PR guarantees neither. The reliable fallback is an explicit link in product content. No invented `$ORDER`, `sale_id`, email or paid-status URL substitution is used.

## Owner's manual Gumroad checklist — not executed

Apply only after the website change is separately approved and deployed:

1. For **both Trip Pass and Group Pass**, put the content below at the top of Content. Make the activation URL an explicit hyperlink in the content editor.
2. In Receipt → Custom message, put the same activation URL and Order ID instructions. Preview the receipt to check whether the URL is clickable; the content link remains the fallback.
3. If renaming the receipt's View content button, use **View activation instructions**. It still opens Gumroad content; do not label it as a guaranteed direct/automatic website redirect.
4. If the current dashboard actually exposes Custom Delivery, decide separately whether to use it after confirming its behavior. This PR does not require or enable it.
5. Keep product IDs, prices, billing mode and existing deliverables unchanged. Do not promise email-only activation, automatic activation, merged quota/expiry, automatic refunds, or human itinerary services in either Pass.

Suggested content for both products:

> **Activate your ChinaEase Pass**
>
> 1. Return to https://chinaeasebuddy.com/?activate=1
> 2. In your Gumroad receipt email, find **Order ID** near the top. Copy the full reference, including its letters and symbols, into ChinaEase and select **Activate Pass**.
> 3. After verification, save the recovery code before travelling.
>
> Gumroad may ask for your purchase email to open this content. That is separate from ChinaEase Pass activation; an email address alone does not activate a Pass.
>
> Each purchase creates a separate Pass. Messages and validity do not combine or transfer, and previous purchases are not automatically refunded. Activating a new Pass switches this browser; keep your previous Order ID or recovery code to restore that Pass. Existing refund terms remain unchanged.

## Release boundaries

- No server activation, device, refund/revocation, entitlement or Buddy quota code changes.
- Historical duplicate Pass risk remains documented and not excluded by a strict production audit. Nothing here migrates customer data or accepts that risk for the owner.
- Review the Draft PR and its CI before a separate merge/release approval. Main is configured to auto-deploy to Production, so merging is a release action.
- Real payment, actual receipt navigation and merchant-specific delivery/redirect behavior remain unverified and need separate controlled acceptance. No production permission is implied by these synthetic tests.
