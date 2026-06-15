# ChinaEase Buddy Manual Launch QA

Use this checklist on real devices before live launch. Record actual results, screenshots, and notes for every failed or uncertain item.

## A. 注册和登录

| Test | Steps | Expected result | Actual result | PASS / FAIL | Screenshot / notes |
| --- | --- | --- | --- | --- | --- |
| Email signup | Open the site, choose Sign Up, create a new email/password account. | Account is created, verification email is sent, static tools remain available. |  |  |  |
| Verification email | Open the verification email and complete Firebase verification, then refresh the site. | Account shows verified state and Buddy AI can be used within free quota. |  |  |  |
| Email login | Log out, then log in with the same email/password. | Account menu shows the same email, plan, and quota state. |  |  |  |
| Google login | Log out, choose Continue with Google in Safari/Chrome. | Google sign-in succeeds and account menu updates without refresh. |  |  |  |
| Log out and log back in | Use Account Menu, confirm Log out, then sign in again. | Logout requires confirmation; re-login restores user state. |  |  |  |
| TikTok / Instagram in-app browser | Open the production URL inside TikTok or Instagram browser and tap Google sign-in. | App browser warning appears and email login remains available. |  |  |  |

## B. Buddy AI

| Test | Steps | Expected result | Actual result | PASS / FAIL | Screenshot / notes |
| --- | --- | --- | --- | --- | --- |
| Normal question | Ask Buddy a simple China travel question. | Buddy returns an answer and one Buddy AI use is counted after success. |  |  |  |
| Network disconnected | Disable network, ask Buddy. | User sees a connection error; no permanent quota loss should occur. |  |  |  |
| Continuous click | Enter a question and rapidly tap send several times. | Only one request is sent from the UI while Buddy is typing. |  |  |  |
| Free 5th use | Use the 5th free Buddy AI message. | Request succeeds if quota remains. |  |  |  |
| Free 6th use | Try a 6th free Buddy AI message. | Request is blocked with quota message; Coze is not called from normal UI. |  |  |  |
| Refresh page | Use Buddy, refresh, then open Account Menu. | Quota state persists from Firestore. |  |  |  |
| Log out / log in | Use Buddy, log out, log back in. | Quota state is the same account state. |  |  |  |
| Failed request quota | Force upstream/network failure and compare quota before/after. | Failed request should not increase Buddy AI use. |  |  |  |

## C. 菜单/菜品参考

| Test | Steps | Expected result | Actual result | PASS / FAIL | Screenshot / notes |
| --- | --- | --- | --- | --- | --- |
| Private testing notice | Open Food → Menu Help. | Upload is not available to public users; page clearly says menu photo help is in private testing. |  |  |  |
| Dish search | Search for a common dish in English, pinyin, and Chinese. | Local dish reference cards appear without API calls or quota changes. |  |  |  |
| Allergen warning | Open dish cards with listed allergens. | Conservative warning is visible: always confirm directly with restaurant staff. |  |  |  |
| No scan quota display | Check Pricing and Account Menu. | No menu/photo scan quota or scan allowance is advertised publicly. |  |  |  |
| Future scan regression | If real OCR/AI scan is later enabled, retest file format, size, timeout, retry, and quota rollback before launch. | Real scan must not use mock output or unsupported allergen claims. |  |  |  |

## D. Newsletter

| Test | Steps | Expected result | Actual result | PASS / FAIL | Screenshot / notes |
| --- | --- | --- | --- | --- | --- |
| Normal subscribe | Enter a valid email in the footer and submit. | Success message appears; newsletterLeads stores one active lead. |  |  |  |
| Duplicate subscribe | Submit the same email again. | Duplicate/already subscribed message appears; no public data is exposed. |  |  |  |
| Invalid email | Submit an invalid email. | Inline invalid email message appears; no lead is stored. |  |  |  |
| Unsubscribe | Open `/unsubscribe`, enter subscribed email, and submit. | Unsubscribe succeeds and lead status changes from active. |  |  |  |
| Six languages | Repeat invalid/success/duplicate states in EN, FR, DE, ES, JA, KO. | No major English fallback in visible newsletter UI. |  |  |  |

## E. 中国大陆网络

| Test | Steps | Expected result | Actual result | PASS / FAIL | Screenshot / notes |
| --- | --- | --- | --- | --- | --- |
| Homepage | Open `https://chinaeasebuddy.com/` on China mobile data and Wi-Fi. | Page loads without horizontal overflow and core tools are visible. |  |  |  |
| Login | Test email login and Google login where available. | Email login works; Google may depend on local browser/network conditions. |  |  |  |
| Buddy AI | Ask a normal Buddy question on China mobile data and Wi-Fi. | If reachable, Buddy answers; errors are friendly and tracked. |  |  |  |
| Food reference | Open Food → Menu Help and search a dish. | Local food reference loads; photo scanning remains private testing. |  |  |  |
| Cloudflare API | Test newsletter and sandbox-safe API routes. | Routes return expected responses, not Cloudflare challenge pages. |  |  |  |
| Guide pages | Open `/guides`, `/china-travel-apps`, `/china-payment-guide`, `/faq`. | Pages return content and are readable. |  |  |  |
| Mobile network and Wi-Fi | Repeat homepage, tools, newsletter, and guide checks on both networks. | No critical timeout or blocked asset issue. |  |  |  |
