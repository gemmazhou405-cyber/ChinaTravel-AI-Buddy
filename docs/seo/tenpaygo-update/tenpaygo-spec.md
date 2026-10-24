# TenPayGo 页改版方案 · 定稿（实测版，付款那一步之后补）

> **页面**：https://chinaeasebuddy.com/tenpaygo-for-tourists/（网址不改）
> **日期**：2026-10-24
>
> **你要做的（2 分钟）**
> 1. 下载 tenpaygo-update.zip，用访达拖进 `ChinaTravel-AI-Buddy/docs/seo/`（里面是这份方案和 14 张已经打好码的截图）
> 2. 把第 9 节的指令粘给 Claude Code
> 3. 等它报告上线以后：GSC「网址检查 → 请求编入索引」，Bing「URL Inspection → Request indexing」
>
> 出门在店里付过一笔以后，把截图发给 Claude，再补一条小指令（见第 10 节）。

---

## 1. 为什么是这一页、这次的角度

- **数据**：5 周 30 次展示，平均排名 14.1；"tenpaygo app" 排第 6。TenPayGo 是 9 月 24 日才上线的新 App，搜的人会越来越多（11 月 APEC 在深圳开，来深圳的外国人会更多）。
- **现在这页的问题**：通篇是"早期用户反馈""尚未确认"，读者看完还是不知道能不能用、怎么用。"Payment limits explained" 一节引用的是 2024 年的通用规定，不是 TenPayGo 自己的规则。
- **这次的角度：我在中国实测过。** 这些都是我们自己测出来的：
  - 只要邮箱加验证码就能注册，没有要手机号、护照和人脸
  - 用英国 Monzo 的 Mastercard 绑卡：银行验证金额是 ¥0.00，商户名显示 "Weixin Firefly"，Monzo App 里显示 "Tencent"，没有扣钱；绑完还要设 6 位支付密码，和注册时的手势密码是两回事
  - Apple Pay 点一下就绑上
  - 深圳通乘车码已经能看到充值页：¥50 / ¥100 / ¥200 三档，卡里至少留 ¥35
  - 钱包列表在 10-24 只有 12 个，官方说的是年底前约 60 个
  - "关于"页写着客服电话 +86 95017，版本 1.1.2
- **署名行**写 "Tested on iPhone 14 (iOS 18.5), TenPayGo 1.1.2, Dongguan, October 24, 2026"。没测的（在店里付款、充值、坐车、用钱包付款）页面上不写成测过。
- **精准客户**：想去深圳、或者微信注册不了的人，正好对应 gig 3（App 和支付设置）。

---

## 2. 目标（11-20 判定时看）

| 搜索词 | 现在排名 | 目标 |
|---|---|---|
| tenpaygo app | 6 | 前 5 |
| 本页平均排名 | 14.1 | 前 10 |
| tenpaygo | 63 | 前 20 |
| tenpaygo review、how to use tenpaygo、tenpaygo apple pay、tenpaygo shenzhen metro 这类 | 无数据 | 出现展示 |

---

## 3. 实测记录

- **时间**：2026-10-24 上午（北京时间 10:56 注册，11:45-11:56 绑卡和 Apple Pay，12:03-12:04 深圳通、钱包、版本号）
- **设备**：iPhone 14，iOS 18.5，TenPayGo 1.1.2，东莞
- **卡**：英国 Monzo 发行的 Mastercard；Apple Pay（手机里本来就绑好了）
- **结果**：注册成功；绑卡成功（Mastercard ID Check，在 Monzo App 里批准 ¥0.00）；Apple Pay 成功；深圳通看到充值页（没充值）；钱包列表 12 个（只要打开开关，没有提示绑定任何东西）
- **还没测**：在店里付款、¥200 以上的手续费页面、银行账单上的显示、深圳通充值和乘车、用钱包付款、"Translate with Driver"、退税

**官方来源核实过的**：9 月 24 日发布；开发者 Tencent Technology (Shenzhen) Company Limited；在微信支付商户付款；中国大陆银行卡不能用；30 多个国家的应用商店能下载；深圳通乘车码 10 月全量上线、不需要中国手机号或实体卡；钱包年底前约 60 个；手续费在确认付款前显示；支付宝和微信支付外卡单笔 ¥200 及以下一般免手续费，超过 ¥200 可能按全额收 3%。

---

## 4. 截图（在 tenpaygo-shots/ 里，已打码，不要再改图）

| 编号 | 内容 | 放在哪 | alt |
|---|---|---|---|
| 1 | 邮箱注册页 | #sign-up，和 2 并排 | TenPayGo sign-up screen asking only for an email address |
| 2 | 手势密码 | #sign-up，和 1 并排 | TenPayGo asking you to draw a gesture password on nine dots |
| 3 | 添加付款方式（7 个卡组织 + Apple Pay） | #link-card 开头，单张 | TenPayGo setup screen showing Visa, Mastercard, UnionPay, American Express, JCB, Diners Club, Discover and Apple Pay |
| 4 | Monzo 的 Mastercard ID Check：¥0.00、Weixin Firefly（卡号已打码） | #link-card，4-5-6 一行 | Mastercard ID Check from Monzo showing a ¥0.00 check from Weixin Firefly |
| 5 | Monzo App 批准 Tencent CN¥0 | #link-card，4-5-6 一行 | Monzo app asking to approve a CN¥0 payment to Tencent |
| 6 | 设 6 位支付密码 | #link-card，4-5-6 一行 | TenPayGo asking you to set a 6-digit payment PIN |
| 7 | 绑好以后的 Pay 页：Apple Pay 和 Mastercard 各有 Pay code（卡号已打码） | #link-card 末尾，单张 | TenPayGo Pay tab with Apple Pay and a Mastercard linked, each with a Pay code button |
| 8 | App 自带说明：Scan to pay | #pay，和 9 并排 | TenPayGo explaining Scan to pay with a WeChat Pay merchant QR code |
| 9 | 付款码页（码已打码） | #pay，和 8 并排 | TenPayGo payment code screen, with the code blurred |
| 10 | 深圳通 Transit Card | #transit，和 11 并排 | Shenzhen Transit Card (Shenzhen Tong) in TenPayGo with a Top up button |
| 11 | 充值页：¥50 / ¥100 / ¥200，最低余额 ¥35 | #transit，和 10 并排 | Top-up options of ¥50, ¥100 and ¥200 with a note that ¥35 must stay on the card |
| 12 | 钱包列表（上半） | #wallets，和 13 并排 | TenPayGo list of supported overseas e-wallets, part 1 |
| 13 | 钱包列表（下半） | #wallets，和 12 并排 | TenPayGo list of supported overseas e-wallets, part 2 |
| 14 | Go 页：Taxi & Ride、Bus & Metro、Tax Refund | #go，单张 | TenPayGo Go tab with Taxi & Ride, Bus & Metro and Tax Refund |

样式和 Amap 页一样：生成 640 宽的 WebP；单张最宽 300px；同一行的几张并排，每张最宽 220px。

---

## 5. 新页面（英文定稿）

### Title（59 字符）

```
TenPayGo Review (2026): I Tested Sign-Up, Cards & Apple Pay
```

### Meta description（152 字符）

```
TenPayGo, tested in China: email-only sign-up, a ¥0 card check with my UK Mastercard, Apple Pay in one tap, and the Shenzhen transit card's ¥35 minimum.
```

### H1

```
How to Use TenPayGo in China: Sign Up, Link a Card, Pay
```

### 署名行

```
Maintained by Lin · Tested on iPhone 14 (iOS 18.5), TenPayGo 1.1.2, Dongguan, October 24, 2026
```

### Quick answer（框）

> TenPayGo is Tencent's payment app for visitors to China. It pays at shops that take WeChat Pay (called Weixin Pay in the app), and you don't need a WeChat account or a Chinese phone number. I set it up on October 24, 2026:
>
> - **Sign-up:** an email address and the code it sends you. It didn't ask for a phone number, passport or face scan.
> - **Cards:** I linked a UK Mastercard. My bank asked me to approve a ¥0.00 check, so nothing was charged. Apple Pay took one tap.
> - **Shenzhen metro and buses:** the Shenzhen Transit Card is in the app. Top up ¥50, ¥100 or ¥200; at least ¥35 has to stay on the card.
> - **Outside Shenzhen** it has no metro code yet, so keep Alipay as well.
>
> Jump to: [Sign up](#sign-up) · [Link a card](#link-card) · [Pay](#pay) · [Fees](#fees) · [Shenzhen metro](#transit) · [E-wallets](#wallets) · [vs Alipay and WeChat Pay](#compare)

### CTA 卡片（紧跟在 Quick answer 下面）

> **Flying soon?** I'll get TenPayGo, Alipay and your card working on your phone before you fly, so your first payment in China isn't a test.
> [See the app setup service on Fiverr →](https://www.fiverr.com/s/p3dZbQR)

### H2：What TenPayGo is（id="what"）

Tencent launched TenPayGo on September 24, 2026 for people visiting China. It isn't WeChat. It's a separate app that pays at shops that accept WeChat Pay. You pay with a foreign card, Apple Pay or a supported overseas e-wallet; Chinese bank cards can't be used.

The app is in English and has two tabs: **Pay**, for your cards and payment codes, and **Go**, for the Shenzhen transit card, a driver translation tool and tax refunds (Shenzhen only).

Get it from the App Store or Google Play. The developer is Tencent Technology (Shenzhen) Company Limited. It's in app stores in more than 30 countries, so you can set it up before you fly.

### H2：Sign up with just an email（id="sign-up"）

1. Open the app and enter your email. Tick the box to agree to the terms and tap **Next**. There's also a **Skip** button if you want to look around first.
2. Enter the code TenPayGo emails you.
3. Draw a gesture password (a pattern on nine dots), then draw it again to confirm.

[截图 1、2 并排]

> **LOCAL NOTE:** The email needs a verification code, and that's it. No other details were required.

It didn't ask for a phone number, passport, name, nationality or a face scan.

### H2：Link a card or Apple Pay（id="link-card"）

The setup screen shows the seven card networks TenPayGo accepts: Visa, Mastercard, UnionPay, American Express, JCB, Diners Club and Discover. The card has to be issued outside mainland China.

[截图 3]

How it went with my card, a Mastercard from Monzo, a UK bank:

1. On the **Pay** tab, I opened **Bank Card** and entered the card details.
2. My bank's security check (Mastercard ID Check) opened and asked me to approve in the Monzo app. The amount was **¥0.00**. The merchant showed as "Weixin Firefly" on the check and as "Tencent" in my banking app. Nothing was charged.
3. TenPayGo then asked me to set a **6-digit payment PIN**. This is separate from the gesture password.

[截图 4、5、6 一行]

**Apple Pay:** tap the **+** under Apple Pay.

> **LOCAL NOTE:** Apple Pay is a single tap, as long as Apple Pay is already set up on your phone.

Once linked, each payment method gets its own **Pay code** button.

[截图 7]

### H2：Pay at a shop: scan or show your code（id="pay"）

The app shows two ways to pay, the same as WeChat Pay:

- **Scan to pay:** tap the scan button (bottom right), scan the shop's WeChat Pay QR code, check the amount and confirm.
- **Show your code:** tap **Pay code** under the card or Apple Pay you want to use and let the cashier scan it. You can switch the payment method on the code screen. Then confirm on your phone.

[截图 8、9 并排]

Never send a photo of your payment code to anyone: whoever scans it can take a payment.

### H2：Fees（id="fees"）

- **Linking a card:** my bank's check was for ¥0.00.
- **Paying:** the app store listing doesn't mention fees. TenPayGo runs on Weixin Pay, and for foreign cards Weixin Pay and Alipay generally charge no fee on payments of ¥200 or less. Above ¥200, a 3% fee may apply to the whole amount (Shanghai government, September 2026). GDToday's launch report says any fee is shown before you confirm, so check the confirmation screen.
- **Your bank** may add its own foreign transaction fee.

### H2：Shenzhen metro and buses: the Transit Card（id="transit"）

In the **Go** tab, open **Bus & Metro → Transit Card**. You'll see a Shenzhen Transit Card (深圳通, Shenzhen Tong). To start using it, top up ¥50, ¥100 or ¥200. The app says at least ¥35 (about US$5) has to stay on the card, enough for the highest single-trip fare in Shenzhen.

[截图 10、11 并排]

Shenzhen's government said the service would be fully available in October 2026, and that you don't need a Chinese phone number or a physical card. After topping up, you scan the code to ride Shenzhen's metro and buses.

I didn't top up, so I can't tell you yet how leftover balance is refunded.

**Other cities:** TenPayGo has no transit code there yet. In Beijing, Shanghai, Guangzhou and Shenzhen you can [tap a contactless Visa or Mastercard at the metro gate](/alipay-metro-qr-transport-code-guide/#card); elsewhere, use Alipay's ride code.

### H2：Overseas e-wallets（id="wallets"）

If you use one of these wallets at home, you can pay Weixin Pay QR codes with it. On October 24, 2026, the list in the app had 12: Starryblu, BCEL One, Hipay, MoMo, ShopeePay Singapore, ShopeePay Thailand, Travel Wallet, Zalopay, KB Star Banking, LiquidPay, Octopus and Shinhan SOL Pay. GDToday's launch report said about 60 are expected by the end of 2026.

[截图 12、13 并排]

> **LOCAL NOTE:** For an e-wallet, you just switch it on. It didn't ask me to link anything.

I don't use any of these wallets, so I couldn't test a payment with one.

### H2：What else is in the Go tab（id="go"）

- **Taxi & Ride:** the only button is **Translate with Driver**. To book a ride, use DiDi or Amap: [paying for DiDi with a foreign card](/didi-payment-for-foreigners/) · [booking a taxi in Amap](/amap-english-mode-guide-2026/#taxi).
- **Bus & Metro:** the Shenzhen Transit Card above.
- **Tax Refund:** "Available in Shenzhen only", according to the app.

[截图 14]

### H2：TenPayGo, Alipay or WeChat Pay?（id="compare"）

| | TenPayGo | Alipay | WeChat Pay |
|---|---|---|---|
| Sign-up | Email and a code | Phone number, then link a card | A WeChat account; new accounts may need an existing user to verify you |
| Pays at | Shops that take WeChat Pay | Shops that take Alipay | Shops that take WeChat Pay |
| Metro codes | Shenzhen only | Ride codes in many cities | Ride codes in many cities |
| DiDi rides | Not in the app | DiDi mini program inside Alipay | DiDi mini program inside WeChat |

**My advice:** make Alipay your main app and add TenPayGo as the backup for shops that only take WeChat Pay. It's most useful if WeChat won't let you sign up: [WeChat verification without a friend's QR code](/wechat-verification-without-friend-qr-2026/).

### H2：FAQ（8 个）

- **Is TenPayGo really from Tencent?** Yes. The developer in the App Store is Tencent Technology (Shenzhen) Company Limited, and Tencent launched the app on September 24, 2026. The app's About page lists customer service at +86 95017.
- **Do I need a Chinese phone number or a WeChat account?** No. I signed up with an email address and a code; it didn't ask for a phone number, passport or face scan.
- **Which cards can I link?** Cards from Visa, Mastercard, UnionPay, American Express, JCB, Diners Club and Discover, issued outside mainland China. I linked a UK Mastercard. You can also add Apple Pay.
- **Will linking my card charge me?** Not in my test. My bank's security check was for ¥0.00, shown as "Weixin Firefly" and "Tencent".
- **Does TenPayGo charge fees?** Its app store listing doesn't mention fees. It runs on Weixin Pay, which for foreign cards generally charges nothing on payments of ¥200 or less and may charge 3% of the whole amount above that. Check the confirmation screen before you pay.
- **Can I use TenPayGo on the metro?** In Shenzhen, yes: top up the Shenzhen Transit Card in the Go tab (¥50, ¥100 or ¥200; at least ¥35 has to stay on the card). In Beijing, Shanghai and Guangzhou, tap your card at the gate; elsewhere, use Alipay's ride code.
- **Can I pay with my home e-wallet?** Only if it's on the in-app list. On October 24, 2026 it had 12 wallets, including MoMo, Zalopay, ShopeePay, Octopus and KB Star Banking.
- **Should I use TenPayGo instead of Alipay?** Use both. Alipay covers DiDi and metro codes in many cities; TenPayGo adds WeChat Pay shops without a WeChat account.

### LinBox 和 Related guides

LinBox 保持现状（里面原有的按钮都不动）。

Related guides（8 个，标签用各页当前的 H1）：
1. /china-payment-guide/
2. /alipay-for-foreigners/
3. /wechat-pay-for-foreigners/
4. /wechat-verification-without-friend-qr-2026/（新增）
5. /alipay-metro-qr-transport-code-guide/
6. /didi-payment-for-foreigners/
7. /3-day-shenzhen-itinerary/（新增）
8. /first-trip-to-china/

删掉 /china-travel-budget/，保持 8 个以内。

### Official or primary sources（整体替换）

1. TenPayGo, official App Store listing (developer: Tencent Technology (Shenzhen) Company Limited): https://apps.apple.com/us/app/tenpaygo/id6778755338
2. TenPayGo on Google Play: https://play.google.com/store/apps/details?id=com.tencent.wxpai
3. Shenzhen Release, the Shenzhen government's information office, via The Paper: email-only sign-up, the Shenzhen Tong transit code from October 2026, tax refunds (September 2026, in Chinese): https://m.thepaper.cn/newsDetail_forward_34149855
4. GDToday: TenPayGo launch details, card networks, e-wallets and fees shown before payment (September 2026): https://www.newsgd.com/node_99363c4f3b/4a9d25e095.shtml
5. Shanghai government: Pay with overseas bank cards, with the ¥200 / 3% rule (September 2026): https://english.shanghai.gov.cn/en-Individuals-BankingandPayments-Payments/20260921/c2c94d06a0454c8fa05386b80d0ae865.html

删掉：深圳政府视频页、2024 年国务院支付指南这两条。

---

## 6. 转化

- **Quick answer 下方**：gig 3 卡片
- **文末**：LinBox 不变
- 整页只留这两处 CTA

---

## 7. 内链

| 页面 | 加在哪一段 | 锚文本 | 链到 |
|---|---|---|---|
| /wechat-pay-for-foreigners/ | 注册或验证那一段 | No WeChat account? TenPayGo pays WeChat Pay shops with just an email | 本页 |
| /wechat-verification-without-friend-qr-2026/ | 验证一直失败那一段 | pay WeChat Pay shops without a WeChat account | 本页 |
| /china-payment-guide/ | 选哪个支付 App 那一段 | TenPayGo, tested | 本页 |
| /alipay-for-foreigners/ | 备用支付方式那一段 | TenPayGo as a backup | 本页 #compare |
| /alipay-metro-qr-transport-code-guide/ | Other options 那一节 | In Shenzhen, TenPayGo also has a transit card | 本页 #transit |
| /3-day-shenzhen-itinerary/ | 交通那一段 | TenPayGo's Shenzhen Transit Card | 本页 #transit |

---

## 8. 站外：Facebook 群

"微信注册不了怎么付钱""TenPayGo 好不好用"会是群里的常见问题。回答模板：

> If WeChat won't let you sign up, try TenPayGo. It's Tencent's own app for visitors. I signed up with just an email, linked a UK Mastercard (my bank's check was ¥0, nothing charged) and added Apple Pay in one tap. It pays at shops that take WeChat Pay. In Shenzhen it also has a metro and bus card: top up from ¥50, and at least ¥35 has to stay on it. Keep Alipay too, for DiDi and metro codes in other cities. Screenshots here: [link]

---

## 9. 给 Claude Code 的指令

```
先运行 pwd，确认当前目录是 ~/ChinaTravel-AI-Buddy。不是的话立刻停下，什么都不要改，告诉我。

是的话：git pull origin main。确认 docs/seo/tenpaygo-update.zip 在，解压到 docs/seo/tenpaygo-update/，里面应该有 tenpaygo-spec.md 和 tenpaygo-shots/1.png 到 14.png。

0. 先只读检查，不改任何东西：/tenpaygo-for-tourists/ 用到的文件最近 7 天是谁提交的；有没有 10-23 以后还在改这一页、又没合进 main 的分支、worktree 或 stash。有的话立刻停下，告诉我是哪个、谁做的。没有就继续

1. 按 tenpaygo-spec.md 第 5 节改版 /tenpaygo-for-tourists/（网址不改）：
   - title、meta description、H1、署名行、Quick answer、CTA 卡片按第 5 节替换
   - 正文按第 5 节的结构、顺序和英文文案重写。文案已经定稿，直接用，不要改写、不要扩写。锚点 id：what、sign-up、link-card、pay、fees、transit、wallets、go、compare。表格做成正常的 HTML 表格。LOCAL NOTE 用和 Amap 页一样的样式。第 5 节没有的段落全部删掉，包括 "What Early TenPayGo Users Are Reporting"、"Known limitations and unconfirmed details"、"Payment limits explained"、"Setup checklist"、"Troubleshooting"
   - FAQ 换成第 5 节的 8 个，FAQ 结构化数据同步更新
2. 截图按第 4 节的位置和 alt 放。和 Amap 页一样生成 640 宽的 WebP；单张最宽 300px；同一行的几张并排，每张最宽 220px。截图已经打好码，不要再改图
3. 文末 LinBox 不动。Related guides 按第 5 节换成 8 个。官方来源按第 5 节整体替换
4. 按第 7 节，在那几个页面的正文里加指向本页的链接；全站 Related guides 里指向本页的标签换成新 H1
5. 本页 lastmod 和 "Last reviewed" 改成今天；其他页面只加了链接、内容没变的，日期不动
6. 跑项目自带的 SEO 检查和测试。检查脚本里如果有这一页按旧文案定的规则，按新文案更新，并加一条：被删掉的那几个旧段落标题如果又出现，就报错

验收：合回 main 并部署，然后用带 ?cb=随机数 的网址检查正式站：
- 本页返回 200，title、meta description、H1、署名行和第 5 节一致
- 9 个锚点 id 都在；14 张截图都返回 200、都有 alt；5 条官方来源链接都在；FAQ 是 8 个，结构化数据和页面一致
- Fiverr 链接 https://www.fiverr.com/s/p3dZbQR 在；LinBox 和 lin@chinaeasebuddy.com 还在
- 页面不再出现 "Early TenPayGo Users"、"Known limitations"、"Payment limits explained"
- 第 7 节每个页面都能找到指向本页的链接
- 全站没有内部链接指向被 301 的网址

最后把第 0 步的结果和验收结果一起贴给我。
```

---

## 10. 之后补：在店里付一笔

出门买东西时，用 TenPayGo 绑的 Monzo 卡付一笔，截这几张发给 Claude：
1. 付款前的确认页：金额、扣哪张卡、有没有手续费那一行
2. 付款成功页
3. 可选：扫同一个码输入 201，截确认页上的手续费，然后取消，不要付
4. Monzo 里这笔扣款：商户名、英镑金额、汇率，账号部分挡住
5. 再写 2-3 条 LOCAL NOTE，用你自己的话

Claude 会给一条小指令：把 #pay、#fees 和第 5 个 FAQ 换成实测结果，署名行和 "Last reviewed" 改成付款那天。
