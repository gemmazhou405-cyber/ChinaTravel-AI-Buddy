# 滴滴支付页改版方案 · 定稿（官方来源版，不需要实测）

> **页面**：https://chinaeasebuddy.com/didi-payment-for-foreigners/（网址不改）
> **日期**：2026-10-24
>
> **你要做的（1 分钟）**
> 1. 下载这个文件，用访达拖进 `ChinaTravel-AI-Buddy/docs/seo/`
> 2. 把第 9 节的指令粘给 Claude Code
> 3. 上线后：GSC「网址检查 → 请求编入索引」，Bing「URL Inspection → Request indexing」
>
> 以后有空可以补截图（第 4 节，在家 5 分钟，不用打车也不用绑卡）。不补也能上线。

---

## 1. 为什么是这一页、这次的角度

- **数据**：5 周 25 次展示，平均排名 9.9；"didi pay" 有 19 次展示，排第 7.9。还没升级的页面里，它离前 5 最近。11-20 判定第 3 条要求 3 个升级页的主词进前 5，前两个是 Amap 页和支付宝地铁页，这页是第三个。
- **现在这页的问题**：
  - 读者最想知道的三件事都没答：外国卡能不能付、走哪条路、要不要手续费。全页没写收哪些卡，也没写费率
  - 有一节 "Evidence and what still needs a real-device test"，等于告诉读者这页没验证过
  - 来源是 Visa 客服页、国务院通用指南这类泛泛的链接，没有一条直接讲滴滴怎么付款
  - 10-23 被 397ad8b、0265851 两次提交改过，作者还不知道。指令第 0 步先查
- **这次的角度：三条路，加上 ¥200 规则**
  - 三条路都能用外国卡：滴滴 App 里直接绑卡、支付宝里的滴滴小程序、微信里的滴滴小程序
  - 走支付宝或微信付款：单笔 ¥200 及以下一般免手续费，超过 ¥200 可能按全额收 3%（上海市政府 2026-09-21）。机场长途单可能超过 ¥200，这时在滴滴 App 里直接刷卡，就不会被钱包收这笔费
  - 建议设两条路：滴滴 App 绑卡，支付宝当备用。卡被拒了马上换另一条
- **署名行**写"按滴滴官方应用介绍和政府支付指南核对"，不写"实测"。
- **H1 不改**。现在的 H1 已经同时包含 "DiDi Pay" 和 "How to Pay for DiDi in China" 两种搜法，不改的话全站 Related guides 的标签也不用动。
- **精准客户**：要打车的人通常也在弄支付宝和微信支付，正好对应 gig 3（App 和支付设置）。

---

## 2. 目标（11-20 判定时看）

| 搜索词 | 现在排名 | 目标 |
|---|---|---|
| didi pay | 7.9 | 前 5 |
| 本页平均排名 | 9.9 | 前 5 |
| didi payment / how to pay for didi | 52 / 无数据 | 前 10 |
| didi foreign card、didi credit card、didi alipay 这类 | 无数据 | 出现展示 |

---

## 3. 已核实的事实

| 事实 | 来源 |
|---|---|
| 滴滴 App（DiDi China: Ride Hailing）有英文界面，支持境外手机号登录；可以用"包括国际银行卡在内的多种支付方式"；和司机的聊天能中英互译；24 小时在线英文客服。没写具体收哪几种卡 | App Store 官方介绍（10 月核对，版本 8.0.17） |
| 英文界面、境外手机号注册、国际卡支付；已经在用支付宝或微信的，可以直接用里面的滴滴小程序 | 广州市外办，经 GDToday 2025-04-08 发布 |
| 境外卡在支付宝和微信支付里：单笔 ¥200 及以下一般免平台服务费，超过 ¥200 可能按全额收 3%；银联、Visa、Mastercard、American Express、JCB、Diners Club、Discover 的卡可以绑 | 上海市政府英文网 2026-09-21 |
| 中国和境外手机号都能注册；付款方式有银行卡、微信支付、支付宝；下单时在屏幕上选付款方式；原话 "DiDi is not a cash-friendly transportation system" | 北京市政府英文网 2024-08-30 |

**没核实到的，页面上一律不写**：滴滴 App 具体收哪几种卡；在滴滴 App 里刷外卡有没有额外手续费；小程序有没有英文界面。

---

## 4. 以后可选：在家 5 分钟补截图

不用打车，也不用绑卡。把滴滴切成英文（我的 → 设置 → 通用 → Language → English），截下面 3-4 张，截完切回中文：
1. 语言设置页
2. 钱包或支付方式页（要能看到添加银行卡的入口）
3. 添加国际银行卡那一页。上面如果有 Visa、Mastercard 这类卡的标志，页面就能写清楚滴滴 App 收哪些卡
4. 填一个目的地以后的下单确认页，只看底部的付款方式，不要点叫车

页面上要是有银行卡尾号，打不打码你自己决定。发给我，我补进页面，署名行再加上截图用的机型。

---

## 5. 新页面（英文定稿）

### Title（60 字符）

```
DiDi Pay in China (2026): Foreign Card, Alipay or WeChat Pay
```

### Meta description（150 字符）

```
Three ways to pay for DiDi in China with a foreign card: the DiDi app, Alipay or WeChat Pay. Plus the ¥200 fee rule and what to do if your card fails.
```

### H1（不改）

```
DiDi Pay for Foreigners: How to Pay for DiDi in China
```

### 署名行（日期用部署当天，和 "Last reviewed" 一致）

```
Maintained by Lin · Rules checked against DiDi's official app listing and Chinese government payment guides, October 24, 2026
```

### Quick answer（框）

> Yes, you can pay for DiDi with a foreign card. There are three ways:
>
> 1. **In the DiDi China app.** Add your card in the app. DiDi's official listing says the app works in English, accepts foreign phone numbers and takes international bank cards.
> 2. **Through Alipay.** Open the DiDi mini program inside Alipay. The fare is charged to the card you linked in Alipay.
> 3. **Through WeChat.** The same, paid with WeChat Pay.
>
> If you pay through Alipay or WeChat Pay with a foreign card, rides of ¥200 or less are generally fee-free. Above ¥200, a 3% fee may apply to the whole fare. And don't plan on cash: DiDi rides are paid in the app.
>
> Jump to: [Which to choose](#compare) · [DiDi app](#card) · [Alipay or WeChat](#alipay-wechat) · [Fees](#fees) · [Declined card](#declined) · [Wrong or double charge](#charges)

### CTA 卡片（紧跟在 Quick answer 下面）

> **Flying soon?** I'll get DiDi, Alipay and WeChat Pay working on your phone before you fly, so your first ride from the airport isn't a payment puzzle.
> [See the app setup service on Fiverr →](https://www.fiverr.com/s/p3dZbQR)

### H2：Which way should you pay?（id="compare"）

All three work with a foreign bank card. They differ in what you set up and what you may pay in fees.

| | DiDi China app | DiDi inside Alipay | DiDi inside WeChat |
|---|---|---|---|
| You need | The app, plus a phone number that can receive an SMS code (foreign numbers work) | Alipay with your card linked | WeChat Pay with your card linked |
| Cards | International bank cards. DiDi's listing doesn't name the card networks | Cards with UnionPay, Visa, Mastercard, American Express, JCB, Diners Club or Discover logos may be accepted | Same as Alipay |
| Fees | Paying with your card: no wallet fee. Your bank may charge a foreign transaction fee | ¥200 or less: generally none. Above ¥200: may be 3% of the whole fare | Same as Alipay |
| Extras | English app, translated chat with drivers, 24/7 English customer service | No extra app to install | No extra app to install |

**My advice: set up two.** Add your card in the DiDi app, and link a card in Alipay as well. If DiDi declines your card, open DiDi inside Alipay and you're still on your way.

### H2：Pay in the DiDi China app with your card（id="card"）

1. Install **DiDi China: Ride Hailing**, the app for mainland China. Sign in with your phone number (you'll need to receive one SMS code) and switch the app to English. Full setup: [how to use DiDi in China](/didi-in-china-for-foreigners/).
2. Add your international bank card in the app's payment settings. Your bank may ask you to confirm with a code or in its app.
3. When you book, check the payment method on the booking screen before you confirm. If it shows Alipay or WeChat Pay instead of your card, the wallet fee rule below applies.
4. The fare is charged when the ride ends. Open the trip afterwards to check it's marked as paid.

Before you fly, turn on overseas and online payments in your banking app, or tell your bank you'll be in China, so your first DiDi charge isn't blocked as suspicious.

### H2：Pay through Alipay or WeChat instead（id="alipay-wechat"）

If your card is already linked in Alipay or WeChat Pay, you don't need the DiDi app.

- **Alipay:** search for 滴滴出行 (DiDi's Chinese name) in Alipay and open the DiDi mini program. Book as usual. The fare is paid from Alipay, which charges your linked card.
- **WeChat:** search for 滴滴出行 in WeChat and open the DiDi mini program. The fare is paid with WeChat Pay.

Haven't linked a card yet? Do it before you fly: [Alipay for foreigners](/alipay-for-foreigners/) · [WeChat Pay for foreigners](/wechat-pay-for-foreigners/).

### H2：Fees: the ¥200 rule（id="fees"）

When a ride is paid through Alipay or WeChat Pay with a foreign card:

- **¥200 or less:** generally no platform fee.
- **Over ¥200:** a 3% fee may apply to the whole amount. On a ¥250 airport ride, that's ¥7.50.

Most rides within a city cost less than ¥200, but long airport transfers can cost more. For those, pay with your card in the DiDi app: the wallet fee doesn't apply, though your bank's foreign transaction fee still can.

The price you see before booking can change with the route, tolls or waiting time. What you actually paid is in the trip record.

### H2：If your card is declined or a payment fails（id="declined"）

| What happened | What to do |
|---|---|
| The card won't add | Look for a blocked attempt in your banking app and approve it, or call your bank. Or try a different card, in DiDi or in Alipay. |
| Payment failed after the ride | Open the trip and pay the fare with another method before your next ride. |
| Your bank shows a charge, but DiDi says unpaid | Don't pay again straight away. It may be a pending authorization. Check again later, and contact DiDi support if you end up charged twice. |

Don't hand the driver cash to fix a failed payment: the app can still show the trip as unpaid. Settle it in the app.

### H2：Wrong amount or charged twice?（id="charges"）

1. Open the trip in DiDi and compare the fare with what your bank shows.
2. Two amounts for one ride in your bank app? One is often a pending authorization that drops off on its own. Give it a few days.
3. If DiDi itself shows two payments, or the fare looks wrong, contact DiDi's in-app customer service. DiDi says English support is available 24/7.

Take screenshots of the trip and your bank's entry before you contact support.

### H2：FAQ（6 个）

- **Can I pay for DiDi with a foreign credit card?** Yes. DiDi's official listing says the DiDi China app accepts international bank cards. You can also link your card in Alipay or WeChat Pay and book through the DiDi mini program there.
- **Which cards does DiDi accept?** DiDi's listing doesn't name the card networks for its app. Through Alipay or WeChat Pay, cards with UnionPay, Visa, Mastercard, American Express, JCB, Diners Club or Discover logos may be accepted.
- **Do I need Alipay or WeChat Pay to use DiDi?** No. The DiDi China app works on its own with a foreign phone number and a foreign bank card. Alipay is a good backup if your card is declined.
- **Is there a fee for paying DiDi with a foreign card?** Through Alipay or WeChat Pay, rides of ¥200 or less are generally fee-free; above ¥200, a 3% fee may apply to the whole fare. Your bank may also charge its own foreign transaction fee.
- **Can I pay the DiDi driver in cash?** Plan on paying in the app. Beijing's government guide for new arrivals says DiDi "is not a cash-friendly transportation system". If you want to pay cash, take a street taxi.
- **What if DiDi charged me twice?** Check the trip in DiDi first. A second amount in your bank app is often a pending authorization that drops off. If DiDi itself shows two payments, contact its in-app English support.

### LinBox 和 Related guides

LinBox 保持现状（里面原有的按钮都不动）。

Related guides（8 个，标签用各页当前的 H1）：
1. /didi-in-china-for-foreigners/（新增）
2. /amap-english-mode-guide-2026/#taxi（新增）
3. /alipay-for-foreigners/
4. /wechat-pay-for-foreigners/
5. /china-payment-guide/
6. /tenpaygo-for-tourists/
7. /alipay-metro-qr-transport-code-guide/
8. /first-trip-to-china/

删掉 /china-travel-budget/，保持 8 个以内。

### Official or primary sources（整体替换）

1. DiDi China: Ride Hailing, official App Store listing (English interface, global mobile-number login, international bank cards, 24/7 English customer service): https://apps.apple.com/us/app/didi-china-ride-hailing/id554499054
2. Guangzhou Foreign Affairs Office via GDToday: DiDi's English version, with overseas numbers, international card payments, and Alipay and WeChat mini programs (April 2025): https://www.newsgd.com/node_5c070fdd03/95a7622cf1.shtml
3. Shanghai government: Pay with overseas bank cards, with the ¥200 / 3% rule and accepted card networks (September 2026): https://english.shanghai.gov.cn/en-Individuals-BankingandPayments-Payments/20260921/c2c94d06a0454c8fa05386b80d0ae865.html
4. Beijing government: Transportation for new arrivals, covering DiDi in English, foreign numbers, payment methods and "not a cash-friendly transportation system" (August 2024): https://english.beijing.gov.cn/latest/specials/essentialtipsfornewarrivals/transportation/202408/t20240830_3785706.html

删掉：Visa 客服页、国务院通用指南这两条。

---

## 6. 转化

- **Quick answer 下方**：gig 3 卡片
- **文末**：LinBox 不变
- 整页只留这两处 CTA

---

## 7. 内链

| 页面 | 加在哪一段 | 锚文本 | 链到 |
|---|---|---|---|
| /didi-in-china-for-foreigners/ | "How to pay for a DiDi ride in China" 那一节 | how to pay for DiDi with a foreign card | 本页 |
| /amap-english-mode-guide-2026/ | #taxi 那一节末尾 | paying for DiDi with a foreign card | 本页 |
| /alipay-for-foreigners/ | 出行或打车那段 | book DiDi inside Alipay | 本页 #alipay-wechat |
| /wechat-pay-for-foreigners/ | 出行或打车那段 | book DiDi inside WeChat | 本页 #alipay-wechat |
| /china-payment-guide/ | 交通那段 | pay for DiDi with a foreign card | 本页 |
| /china-airport-arrival-guide/ | 打车那段 | the ¥200 fee rule for airport rides | 本页 #fees |
| /beijing-airport-to-city-guide/ | 打车或 DiDi 那段 | the ¥200 fee rule for airport rides | 本页 #fees |

---

## 8. 站外：Facebook 群

"能不能用外国卡打滴滴"是群里的常见问题。回答模板：

> Yes. The easiest is the DiDi China app: it's in English and takes foreign phone numbers and international bank cards. Link a card in Alipay too as a backup; if DiDi declines your card, open DiDi inside Alipay instead. One thing people miss: if you pay through Alipay or WeChat Pay with a foreign card, a ride over ¥200 may carry a 3% fee, so for a long airport ride, pay with your card in the DiDi app. Sources here: [link]

---

## 9. 给 Claude Code 的指令

```
先运行 pwd，确认当前目录是 ~/ChinaTravel-AI-Buddy。不是的话立刻停下，什么都不要改，告诉我。

是的话：git pull origin main，确认 docs/seo/didi-payment-spec.md 在。

0. 先只读检查，不改任何东西：
   - 397ad8b、0265851 这两个提交：作者、时间、提交信息（含 Co-Authored-By 这类署名行）、改了哪些文件
   - git branch -a、git worktree list、git stash list：有没有 10-23 以后还在改 didi 两页、又没合进 main 的分支、worktree 或 stash
   - 有的话立刻停下，什么都不要改，告诉我是哪个、谁做的。没有就继续

1. 按 docs/seo/didi-payment-spec.md 改版 /didi-payment-for-foreigners/：
   - title、meta description、署名行、Quick answer、CTA 卡片按第 5 节替换。H1 不改。署名行日期用今天，和 "Last reviewed" 一致
   - 正文按第 5 节的结构、顺序和英文文案重写。文案已经定稿，直接用，不要改写、不要扩写。锚点 id：compare、card、alipay-wechat、fees、declined、charges。两个表格做成正常的 HTML 表格。第 5 节没有的段落全部删掉，包括 "Payment problem now?" 表格、"First-trip checklist"、"Evidence and what still needs a real-device test"
   - FAQ 换成第 5 节的 6 个，FAQ 结构化数据同步更新
   - 页面上不要出现 "tested" 这类说法，文案里不要出现 AI
2. 文末 LinBox 不动。Related guides 按第 5 节换成 8 个。官方来源按第 5 节整体替换
3. 按第 7 节，在那几个页面的正文里加指向本页的链接
4. 本页 lastmod 和 "Last reviewed" 改成今天；其他页面只加了链接、内容没变的，日期不动
5. 跑项目自带的 SEO 检查。这页之前因为缺 "foreign bank card" 报过错，新文案里有这个词，确认这次通过

验收：合回 main 并部署，然后用带 ?cb=随机数 的网址检查正式站：
- 本页返回 200，title、meta description、H1 和第 5 节一致
- 6 个锚点 id 都在；4 条官方来源链接都在；FAQ 是 6 个，结构化数据和页面一致
- Fiverr 链接 https://www.fiverr.com/s/p3dZbQR 在；LinBox 和 lin@chinaeasebuddy.com 还在
- 页面不再出现 "real-device test" 和 "Payment problem now"
- 第 7 节每个页面都能找到指向本页的链接
- 全站没有内部链接指向被 301 的网址

顺手做一件只读的事，不改任何东西：6 个副本文件夹（~/ChinaTravel-AI-Buddy-ce004、~/chinaease-240h、~/chinaease-fixes、~/chinaease-freequota、~/chinaease-leads、~/chinaease-tripplan）和 claude/trip-plan-cta 分支，每个写一行：有没有 main 上没有的提交，或者没提交的改动。

最后把第 0 步的结果、验收结果和副本那几行一起贴给我。
```
