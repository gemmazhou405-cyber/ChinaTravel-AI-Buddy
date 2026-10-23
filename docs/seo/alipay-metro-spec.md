# 支付宝地铁乘车码页改版方案 · 定稿（不需要实测）

> **页面**：https://chinaeasebuddy.com/alipay-metro-qr-transport-code-guide/（网址不改）
> **日期**：2026-10-23
>
> **你要做的（1 分钟）**
> 1. 在 Mac 上下载这个文件，用访达拖进 `ChinaTravel-AI-Buddy/docs/seo/`
> 2. 把第 9 节的指令粘给 Claude Code
>
> 以后有空可以补截图（第 4 节，在家 5 分钟），不补也不影响上线。

---

## 1. 为什么是这一页、这次的角度

- **数据**：5 周 27 次展示，排名 12.4；"alipay transport qr code" 排第 9。"外国人怎么坐中国地铁"是每个游客都会搜的事。
- **现在这页的问题**：只有约 600 字，没有图；核心步骤是"菜单名称可能不同"这种含糊话；主要来源是北京 2022 年的旧页面；有一个假按钮 "Ask Buddy for my city metro setup"，点进去是首页。
- **这次的角度：坐地铁不一定要支付宝。** 北京、上海、广州、深圳的地铁闸机都能直接刷外国 Visa / Mastercard / Amex / JCB 非接触卡，不用 App，不用买票。竞品在这一点上过时或互相矛盾：
  - SinoWander（2026-10 更新）说单独的外国 Visa / Mastercard 刷不了闸机。这是错的
  - ChinaPass（2026-09 核对）列出北京、上海、广州、成都，漏了深圳
  - 深圳是 2026 年 6 月 30 日才开始的全线网试点，几乎没有竞品写到
- **这页的价值是"信息对、来源硬"**：四个城市都引政府或官方媒体原文。这次不写"实测"，署名行写"按官方公告核对"，不冒充测过。
- **精准客户**：要坐地铁的人多半也在折腾支付宝和微信支付，对上 gig 3（App 和支付设置）。

---

## 2. 目标（11-20 判定时看）

| 搜索词 | 现在排名 | 目标 |
|---|---|---|
| alipay transport qr code | 9 | 前 3 |
| alipay metro / alipay ride code | 无数据 | 出现展示 |
| china metro / metro in china | 60-67 | 进前 30 |
| can i use visa on china metro 这类问题 | 无数据 | 出现展示 |

---

## 3. 已核实的规则

| 城市 | 能刷的卡 | 范围 | 来源 |
|---|---|---|---|
| 北京 | Visa、Mastercard（2024-09-13 起）；JCB、Amex（2025-06-15 起）；银联 | 全部 29 条线、523 个站，含两条机场线和市郊铁路 S2；所有闸机 | 北京市政府英文网 2025-06-16 |
| 上海 | 银联、Visa、Mastercard、Amex、JCB 非接触卡（Tap to Ride） | 地铁闸机；卡里要有足够余额或额度，并开通小额免密 | 上海市政府英文网，2026-06-29 更新 |
| 广州 | 境外发行的 Visa、Mastercard、Amex、JCB | 全部车站，2025-10-12 起 | 南方+（newsgd）2025-10-12 |
| 深圳 | Visa、Mastercard、Amex、JCB，含绑在手机钱包里的卡 | 2026-06-30 起全线网试点：17 条线、432 个站，只认带对应标志的闸机；计划 2026 年底前所有闸机都能刷 | 深圳市政府英文网 2026-07-01 |

---

## 4. 以后可选：在家 5 分钟补截图

不用去地铁站。把支付宝切成英文（我的 → 设置 → 通用 → 多语言），截这 3-4 张，截完切回中文：
1. 语言设置页
2. 乘车码入口和选城市的页面
3. 乘车码二维码页面
4. 以前坐过地铁的话：行程记录页

发给我，我补进页面，署名行再加上 "Tested on iPhone 14"。

---

## 5. 新页面（英文定稿）

### Title（60 字符）

```
Alipay Metro QR Code in China (2026): Setup or Tap Your Card
```

### Meta description（147 字符）

```
Pay for China's metro in 2026: tap your Visa or Mastercard at the gate in Beijing, Shanghai, Guangzhou or Shenzhen, or set up the Alipay ride code.
```

### H1

```
How to Pay for the Metro in China: Alipay Ride Code or Tap Your Card
```

### 署名行

```
Maintained by Lin · Rules checked against official metro announcements, October 23, 2026
```

### Quick answer（框）

> You have two easy options:
>
> 1. **Tap your bank card at the gate.** Beijing, Shanghai, Guangzhou and Shenzhen metros accept contactless Visa, Mastercard, American Express and JCB cards. No app, no ticket. In Shenzhen, use a gate showing your card's logo.
> 2. **Use Alipay's ride code.** In Alipay, open **Transport** (出行) or search for "ride code" (乘车码), choose your city, activate it once, then scan the code at the gate. It's the **ride code**, not the payment QR you show in shops.
>
> Jump to: [Tap your card](#card) · [Alipay ride code](#alipay-ride-code) · [At the gate](#gate) · [Other options](#other-options)

### CTA 卡片（紧跟在 Quick answer 下面）

> **Flying soon?** I'll get Alipay, WeChat Pay and your metro code working on your phone before you fly, so you're not troubleshooting at the gate.
> [See the app setup service on Fiverr →](https://www.fiverr.com/s/p3dZbQR)

### H2：Option 1: tap your bank card at the gate（id="card"）

In China's biggest metro systems you no longer need an app. Hold a contactless card over the card reader on the gate, and tap the same card again when you exit.

| City | Cards | Where |
|---|---|---|
| Beijing | Visa, Mastercard, American Express, JCB, UnionPay | All 29 lines and 523 stations, including both airport express lines and Suburban Line S2 |
| Shanghai | Visa, Mastercard, American Express, JCB, UnionPay | Metro gates ("Tap to Ride"). Your card needs enough balance and must allow small contactless payments without a PIN |
| Guangzhou | Overseas Visa, Mastercard, American Express, JCB | All stations, since October 12, 2025 |
| Shenzhen | Visa, Mastercard, American Express, JCB, including cards in mobile wallets | All 17 lines and 432 stations, but only at gates showing the card logos (a trial since June 30, 2026; all gates are due by the end of 2026) |

Other cities: check for card logos on the gates before you rely on it. Your bank may also charge a foreign transaction fee on each ride, so check with your bank before you travel.

### H2：Option 2: Alipay ride code, step by step（id="alipay-ride-code"）

1. Open Alipay and go to **Transport** (出行), or search for "ride code" (乘车码).
2. Choose the city you're in.
3. Activate the ride code: agree to the service terms and choose how to pay. If you have an international Alipay account, it may ask you to verify your passport first. Follow its prompts.
4. At the gate, hold the **ride code** over the scanner. Scan it again when you exit.
5. The fare is charged to your linked payment method after you exit.

**Ride code vs payment code:** shops scan your payment code (付款码); metro gates need the ride code (乘车码). They are different QR codes, and the gate reads the ride code.

Set this up before you fly, while you have time to sort out card linking: [Alipay for foreigners](/alipay-for-foreigners/).

### H2：At the gate（id="gate"）

- Exit the same way you entered: if you scanned in with the ride code, scan out with it; if you tapped in with a card, tap out with the same card. The fare is calculated when you exit.
- Have the code open before you reach the gate, so you're not holding up the line.
- If the gate won't read your code or card, don't keep trying. Use the staffed gate or the service center.

### H2：Other options: tickets, passes and WeChat（id="other-options"）

- **Single-journey tickets:** ticket machines have an English option. In Shanghai, station service centers also sell tickets by card, including overseas cards.
- **Shanghai passes:** a one-day pass costs 18 yuan and a three-day pass 45 yuan, for unlimited rides.
- **WeChat:** WeChat also has ride codes, and Shanghai's metro accepts both Alipay and WeChat.

More on tickets, gates and transfers: [China metro guide](/china-metro-guide/). To find the right station entrance and exit, see [how to use Amap in English](/amap-english-mode-guide-2026/#metro).

### H2：FAQ（6 个）

- **Can foreigners use Alipay for the metro in China?** Yes. Open the ride code in Alipay, choose your city and activate it once. International accounts may need to verify a passport first.
- **Can I use my Visa or Mastercard on the metro in China?** Yes in Beijing, Shanghai, Guangzhou and Shenzhen, by tapping a contactless card at the gate. In Shenzhen, use gates showing the card logo. In other cities, check the gates first.
- **Can I use Apple Pay or Google Pay?** Shenzhen Metro says cards in mobile wallets work at its card-enabled gates. Elsewhere, the physical card is the safer bet.
- **Is the Alipay ride code the same as the payment QR?** No. Shops scan your payment code; metro gates need the ride code.
- **Do I need a different code in each city?** In Alipay you choose the city first, so check it's set to the city you're in before you reach the gate.
- **What if the gate won't read my code or card?** Don't keep scanning. Go to the staffed gate or the service center, or buy a single-journey ticket.

### LinBox 和 Related guides

LinBox 保持现状。Related guides 加上 Amap 页和 metro 指南。

### Official or primary sources（整体替换）

1. Beijing government — Beijing Subway supports tap-and-go with the 5 most used overseas cards (June 2025): https://english.beijing.gov.cn/latest/news/202506/t20250616_4114250.html
2. Shanghai government — metro payment and ticket choices (updated June 2026): https://english.shanghai.gov.cn/en-Individuals-Transportation-PublicTransport/20260813/f257d5c373db4da3a8bde717b9f46b27.html
3. Guangzhou Metro accepts foreign bank cards for tap-to-ride payment (October 2025): https://info.newsgd.com/node_73b7112307/57e7d5affe.shtml
4. Shenzhen government — Shenzhen Metro accepts foreign bank cards (July 2026): https://www.sz.gov.cn/en_szgov/news/latest/content/post_12871620.html

删掉：北京 2022 年那条旧页面。

---

## 6. 转化

- **Quick answer 下方**：gig 3 卡片
- **文末**：LinBox 不变
- **删掉**假按钮 "Ask Buddy for my city metro setup"
- 整页只留这两个 CTA

---

## 7. 内链

| 页面 | 加在哪一段 | 锚文本 | 链到 |
|---|---|---|---|
| /china-metro-guide/ | 付款方式那段 | pay with the Alipay ride code or tap your card | 本页 |
| /amap-english-mode-guide-2026/ | #metro 那节末尾 | pay for the metro with Alipay or your card | 本页 |
| /alipay-for-foreigners/ | 出行或交通那段 | use Alipay for the metro | 本页 #alipay-ride-code |
| /china-payment-guide/ | 交通那段 | metro: Alipay ride code or card tap | 本页 |
| /first-trip-to-china/ | 交通那段 | how to pay for the metro | 本页 |
| /3-day-beijing-itinerary/、/3-day-shanghai-itinerary/、/3-day-guangzhou-itinerary/、/3-day-shenzhen-itinerary/ | 交通那段 | tap your Visa at the metro gate | 本页 #card |

---

## 8. 站外：Facebook 群

"外国人在中国怎么坐地铁""能不能刷 Visa"是常见问题。回答模板：

> In Beijing, Shanghai, Guangzhou and Shenzhen you can just tap a contactless Visa, Mastercard, Amex or JCB card at the metro gate, no app needed (in Shenzhen, use a gate with your card's logo). Everywhere else, set up the ride code in Alipay before you fly. It's a different QR from the payment code you show in shops. Official sources for each city here: [link]

---

## 9. 给 Claude Code 的指令

```
先 git pull origin main。

确认 docs/seo/alipay-metro-spec.md 在。任务：按这个文件改版 /alipay-metro-qr-transport-code-guide/。

1. title、meta description、H1、署名行、Quick answer、CTA 卡片按第 5 节替换
2. 正文按第 5 节的结构、顺序和英文文案重写。文案已经定稿，直接用，不要改写、不要扩写。按第 5 节加锚点 id：card、alipay-ride-code、gate、other-options。第一节的城市表格做成正常的 HTML 表格。FAQ 换成第 5 节的 6 个，页面如果有 FAQ 结构化数据，同步更新
3. 删掉 "Ask Buddy for my city metro setup" 这个按钮；文末 LinBox 不动；Related guides 加上 /amap-english-mode-guide-2026/ 和 /china-metro-guide/
4. 官方来源列表按第 5 节整体替换
5. 按第 7 节，在那几个页面的正文里加指向本页的链接
6. 本页 lastmod 和 "Last reviewed" 改成今天；其他页面只加了链接、内容没变的，日期不动

验收：合回 main 并部署，然后对正式站跑：
- curl 确认本页返回 200，title、meta description、H1 和第 5 节一致
- 页面不再出现 "Ask Buddy for my city metro setup"；Fiverr 链接是 https://www.fiverr.com/s/p3dZbQR；LinBox 和 lin@chinaeasebuddy.com 还在
- 4 个锚点 id 都存在；4 条官方来源链接都在
- 第 7 节每个页面都能找到指向本页的链接
- 全站没有内部链接指向被 301 的网址
把结果贴给我
```
