# App 总页改版：/china-travel-apps/（实测 + 官方来源）

> **页面**：https://chinaeasebuddy.com/china-travel-apps/（网址不改）
> **日期**：2026-10-26
> **做法**：把已经实测过的 4 个 App（Amap、滴滴、TenPayGo、Google Maps）的结果串成一页总览，其他 App（支付宝、微信、12306、Trip.com）按官方来源写。不用新截图，复用已上线页面的 3 张
>
> **你要做的（1 分钟）**
> 1. 下载 apps-hub-spec.md，用访达拖进 `ChinaTravel-AI-Buddy/docs/seo/`
> 2. 把第 8 节的指令粘给 Claude Code
> 3. 等它报告上线以后：GSC 和 Bing 提交这个网址

---

## 1. 为什么改、改成什么

**数据**（GSC 过去 3 个月，截至 10-23）：17 次展示，平均排 11.4；10-22 并进来的 /best-apps-for-china-travel-2026/ 另有 6 次、平均排 4.8。"china travel apps" 这类词搜索量大，这页离第一页只差一点。

**旧版的问题**（10-26 导出全文看过）：
- 全是"因版本、地区、账号而异"一类的套话，没有一条实测结果
- 没有截图，没有 gig 3 卡片（这页和 gig 3 "帮你设置支付宝、微信支付、SIM 和 App" 最对口）
- 署名行没有日期；正文入链只有 2 个
- App 清单里把 ChinaEase Buddy 自己的网页工具也列成一个 App，这次去掉（DECISIONS：不在功能上和成熟 App 比）

**改成**：
1. 一张总表：每个 App 用来干什么、我测到了什么、详细指南在哪
2. 实测结果：Amap 和滴滴都能切英文、TenPayGo 只用邮箱注册并用英国卡付了 ¥4.90（3% 手续费免了）、Google Maps 不开 VPN 打不开
3. 每个 App 都链到已经改版的详细页，这页成为它们的总入口
4. 旧版里有用的内容保留：出发前的准备步骤、上网影响哪些 App 能用、常见错误

**H1 不变**（Essential China Travel Apps to Set Up Before Arrival）。按合并规矩，被并进来的 best-apps 那页的关键词放进 title：title 用 "Best China Travel Apps"。

---

## 2. 用到的实测和官方来源（都已在其他页面核实过）

| 事实 | 出处 |
|---|---|
| Amap 切英文：My → 齿轮 → Language → English，关掉 App 再打开；可用邮箱、Apple、Google 登录；Hi China 拍菜单翻译，结果页提示要自己核对 | 实测 10-23（Amap 页） |
| Amap 从广州塔到广州南站给出 3 条公交路线，最快 40 分钟 ¥5；Google Maps 不开 VPN 打不开，开 VPN 也找不到公交路线，Luckin 推荐 5.7 公里外的店，Amap 1 公里内 5 家 | 实测 10-26（地图对比页） |
| 滴滴切英文：Account → 齿轮 → Language → English → 完成 → Confirm；3.1 公里 Economy ¥10、出租车约 ¥14.1；网约车一口价、出租车是估价；出租车可付现金；上车前核对手机尾号 | 实测 10-24（滴滴页） |
| TenPayGo：只用邮箱注册；绑英国 Mastercard；店里付 ¥4.90，3% 手续费免了 | 实测 10-24、10-25（TenPayGo 页） |
| 外卡在支付宝、微信支付付款：单笔 ¥200 及以下一般免手续费，超过 ¥200 可能按全额收 3% | 上海市政府英文网 2026-09 |
| 北京、上海、广州、深圳地铁闸机可以直接刷外国 Visa、Mastercard | 支付宝地铁页（四城官方来源） |
| 12306 英文站只收外国护照，要邮箱不要手机号；开车前 15 天开售；不出纸质票，凭护照进站 | 火车页（12306 官方） |
| 北京南到上海二等座 ¥553-667（11 月 4 日） | 实测 10-25（预算页） |
| 中国大陆普通网络下 Google、Facebook、YouTube、X 等被屏蔽或受限 | 英国政府旅行建议（旧版已引用） |

---

## 3. 旧版内容怎么处理

- **保留并改写得更具体**：出发前 5 个准备步骤、上网影响哪些 App 能用、常见错误、7 个 FAQ（问题基本保留，回答换成实测结果）
- **去掉**：ChinaEase Buddy 网页工具那一条；Meituan 和"城市地铁 App"那一节（没测过，也不是外国游客的必需品）；"旅行 eSIM 不等于 VPN、VPN 受中国许可规定约束"那句（旧版没有对应来源）
- **来源**：旧版 6 条保留，加 1 条上海市政府的手续费规则

---

## 4. 没核实到的事（页面上一律不写）

- 支付宝、微信用外国手机号注册的完整流程（这次没测）
- Meituan、城市地铁 App 对外国人好不好用
- 用漫游或旅行 eSIM 时 Google 服务能不能用
- 离线翻译 App 哪个最好用

---

## 5. 定稿文案

**正文整页按本节重写**：结构、顺序和英文文案都按本节，文案已经定稿，直接用，不要改写、不要扩写。页面模板自带的 LinBox、Get my free China itinerary、Related guides 保留。H1 不变。

### Title（53 字符）

```
Best China Travel Apps (2026): What I Tested in China
```

### Meta description（145 字符）

```
The apps to set up before China, from my tests in October 2026: Amap and DiDi in English, TenPayGo with a UK card, and Google Maps without a VPN.
```

### 署名行

```
Maintained by Lin · Amap, DiDi, TenPayGo and Google Maps tested on iPhone 14, Dongguan, October 23–26, 2026 · Other apps checked against official sources
```

"Last reviewed" 改成 October 26, 2026。

### 跳转目录（Quick answer 下面）

> Jump to: [At a glance](#at-a-glance) · [Paying](#pay) · [Maps and rides](#getting-around) · [Trains](#trains) · [WeChat](#wechat) · [Translation](#translation) · [Before you fly](#before)

### Quick answer

> Set these up before you fly, and test each one while you still have Wi-Fi and your home number:
>
> - **Alipay** to pay in shops and use the metro ride code.
> - **WeChat** for messages, plus **TenPayGo** if WeChat Pay won't work for you.
> - **Amap** for maps, public transport and taxis. It works in English.
> - **DiDi** for rides. It works in English too.
> - **12306** or **Trip.com** for train tickets.
> - An **offline translation app**, and your hotel's address saved in Chinese.
>
> I tested four of these on my iPhone in Dongguan in October 2026: Amap, DiDi, TenPayGo and Google Maps. Google Maps didn't load at all without a VPN. The rest comes from official sources.

### gig 3 卡片（紧跟在 Quick answer 下面，和 Amap 页同一张卡片的样式）

> **Flying soon?** I'll help you set up Alipay, TenPayGo, Amap and DiDi before you fly, so nothing gets stuck at a verification screen when you land.
> [See the app setup service on Fiverr →](https://www.fiverr.com/s/p3dZbQR)

### H2：The apps at a glance（id="at-a-glance"）

> | App | Use it for | What I found | Full guide |
> |---|---|---|---|
> | Alipay | Paying in shops; the metro ride code | With a foreign card, payments up to ¥200 are generally free; above that, 3% may apply | [Metro: card or ride code](/alipay-metro-qr-transport-code-guide/) · [Alipay](/alipay-for-foreigners/) |
> | WeChat | Messages, calls, Weixin Pay | Sign-up may ask an existing user to verify you | [WeChat verification](/wechat-verification-without-friend-qr-2026/) |
> | TenPayGo (tested) | Paying where WeChat Pay works, without WeChat | Signed up with just an email, linked a UK Mastercard and paid ¥4.90 at a shop; the 3% card fee was waived | [TenPayGo](/tenpaygo-for-tourists/) |
> | Amap (tested) | Maps, public transport, taxis | Works in English. From Canton Tower to Guangzhou South station it gave me 3 routes, the fastest 40 minutes for ¥5 | [Amap in English](/amap-english-mode-guide-2026/) |
> | DiDi (tested) | Taxis and ride-hailing | Works in English. A 3.1 km Economy ride was quoted at ¥10; a taxi, about ¥14.1 | [DiDi](/didi-in-china-for-foreigners/) |
> | 12306 or Trip.com | Train tickets | 12306's English site takes foreign passports and asks for an email, not a Chinese phone number | [Train tickets](/china-train-travel-guide/) |
> | Google Maps (tested) | Not for China | Didn't load without a VPN; with one, it found no public transport route | [Google Maps vs Amap](/amap-vs-google-maps-china/) |
>
> [截图：复用 3 张，并排]
>
> *From my tests: Amap (October 26), DiDi (October 24) and TenPayGo (October 25), 2026.*

### H2：Paying: Alipay first, TenPayGo as a backup（id="pay"）

> **Alipay** is the main one: link a foreign card, then pay by scanning a shop's QR code or showing yours. With a foreign card in Alipay or Weixin Pay, payments of ¥200 or less are generally free; above ¥200, a 3% fee may apply to the whole amount (Shanghai government, September 2026).
>
> **TenPayGo** is Tencent's payment app for visitors. It pays at shops that take WeChat Pay, without a WeChat account. I signed up with just an email, linked a UK Mastercard, and paid ¥4.90 at a shop in Dongguan; the 3% card fee was crossed out.
>
> Carry a physical bank card and some yuan as well. A linked card can still fail because of a verification step, your bank's checks or the shop's setup.
>
> [Alipay for foreigners](/alipay-for-foreigners/) · [China payment guide](/china-payment-guide/) · [TenPayGo, tested](/tenpaygo-for-tourists/)

### H2：Maps and rides: Amap and DiDi, not Google Maps（id="getting-around"）

> **Amap** works in English: tap **My**, then the gear icon, then **Language** → **English**, and close and reopen the app. You can sign in with email, Apple or Google, book taxis inside it, and get public transport routes with fares. [Amap in English](/amap-english-mode-guide-2026/)
>
> **Google Maps** didn't load at all on a Chinese connection when I tested it on October 26, 2026. With a VPN it found Canton Tower, but no public transport route, and it sent me to a Luckin Coffee 5.7 km away while Amap listed five within 1 km. [My Google Maps vs Amap test](/amap-vs-google-maps-china/)
>
> **DiDi** works in English too: **Account** → gear icon → **Language** → **English** → **完成** (Done) → **Confirm**. App rides show a fixed upfront fare and taxis show an estimate; taxi trips can be paid in cash. [DiDi in English](/didi-in-china-for-foreigners/) · [Paying for DiDi](/didi-payment-for-foreigners/)
>
> **LOCAL NOTE:** Before you get in, confirm the last digits of your phone number with the driver, or the trip may not start. If you don't speak Chinese, just show the driver the digits on your phone.
>
> For the metro you don't always need an app: in Beijing, Shanghai, Guangzhou and Shenzhen you can tap a contactless Visa or Mastercard at the gate. [Metro: card or Alipay ride code](/alipay-metro-qr-transport-code-guide/)

### H2：Trains: 12306 or Trip.com（id="trains"）

> **12306** is China Railway's official site and app, with an English version. It only accepts foreign passports and asks for an email address, not a Chinese phone number. Tickets go on sale 15 days before departure, and there's no paper ticket: you show the passport you booked with. **Trip.com** also sells China train tickets in English. For Beijing to Shanghai in second class, I saw ¥553–667 on 12306 for November 4. [China train tickets](/china-train-travel-guide/) · [What a China trip costs](/china-travel-budget/)

### H2：WeChat: messages first（id="wechat"）

> WeChat is China's main messaging app, and hotels, guides and new friends will often ask for your WeChat. When you sign up, it may ask an existing user to verify you. If you don't have anyone, read [WeChat verification without a friend](/wechat-verification-without-friend-qr-2026/). If WeChat Pay won't work for you, TenPayGo still lets you pay at the same shops.

### H2：Translation and menus（id="translation"）

> Amap's **Hi China** tools, in the shortcut icons below the search bar, include **Menu Translation**: photograph a menu and you get English dish names, flavor tags and prices. Set your allergies, then show staff a Chinese order card. Amap asks you to double-check the results, so confirm allergies with staff. [Menu translation in Amap](/amap-english-mode-guide-2026/#menu-translation)
>
> Also download an offline translation app with Chinese, and test it in airplane mode before you fly. Keep your hotel address, allergies and tickets as screenshots too. [Chinese phrases for travelers](/chinese-travel-phrases/) · [How to order food in China](/china-food-ordering-guide/)

### H2：Set everything up before you fly（id="before"）

> 1. Download each app from your phone's official app store, and check it's the real one, not a look-alike.
> 2. Register with a phone number or email you can still use in China, and finish any card or identity checks.
> 3. Save your hotel's name, address and phone number in Chinese, in a note and as a screenshot.
> 4. Sort out mobile data: an eSIM or a roaming plan.
> 5. Before you leave, test a login, a payment, a route and offline translation.

### H2：Internet access changes which apps work（id="internet"）

> On ordinary mainland mobile networks and Wi-Fi, Google, Facebook, YouTube, X and some other services are blocked or restricted. Roaming plans and travel eSIMs handle this differently by provider and plan, so check the exact plan before you buy. [China eSIM and internet guide](/china-esim-internet-guide/)

### H2：Common setup mistakes（id="mistakes"）

> - Downloading a look-alike app or the wrong regional version.
> - Losing access to the phone number you used for verification after changing SIM settings.
> - Relying on one wallet, one map or one internet connection with no backup.
> - Arriving without your hotel address and first destination saved in Chinese.
> - Deleting an eSIM while troubleshooting, or keeping tickets only inside an online account.

### FAQ（7 个，结构化数据同步）

1. **What apps should I download before visiting China?**
   Alipay, WeChat, Amap, DiDi, and 12306 or Trip.com, plus an offline translation app. Add TenPayGo if WeChat Pay doesn't work for you. Set them up and test them before you fly.
2. **Is Amap available in English?**
   Yes. Tap My, then the gear icon, then Language → English, and close and reopen the app. I tested it on an iPhone in October 2026.
3. **Does Google Maps work in mainland China?**
   Not on its own. When I tested it on October 26, 2026, it didn't load without a VPN, and with one it found no public transport route. Use Amap instead.
4. **Can I book China train tickets with a foreign passport?**
   Yes. 12306's English site only accepts foreign passports and asks for an email address, not a Chinese phone number. Trip.com also sells train tickets. Carry the passport you booked with.
5. **Should I set these apps up before arriving in China?**
   Yes. Install, register, verify and test them before you leave, while you have reliable internet and your usual phone number. Keep a backup for paying, maps and offline information in case one setup fails.
6. **Do I need a Chinese phone number for every app?**
   No. In my tests, TenPayGo signed me up with just an email, and Amap lets you sign in with email, Apple or Google. 12306's English site asks for an email instead of a phone number. Other apps vary, so keep access to your home number.
7. **Can I use Uber in China?**
   Uber isn't the usual ride-hailing app in mainland China. Use DiDi or the ride option in Amap, or join an official taxi queue.

### Official or primary sources to verify（7 条）

1. AMap Global official Google Play listing: https://play.google.com/store/apps/details?id=com.autonavi.minimap
2. Alipay official Google Play listing: https://play.google.com/store/apps/details?id=com.eg.android.AlipayGphone
3. WeChat official Google Play listing: https://play.google.com/store/apps/details?id=com.tencent.mm
4. Railway 12306 English website: https://www.12306.cn/en/index.html
5. Trip.com official website: https://www.trip.com/
6. UK government China internet-access advice: https://www.gov.uk/foreign-travel-advice/china/safety-and-security#internet-access
7. Shanghai government: Pay with overseas bank cards, with the ¥200 / 3% rule (September 2026): https://english.shanghai.gov.cn/en-Individuals-BankingandPayments-Payments/20260921/c2c94d06a0454c8fa05386b80d0ae865.html

---

## 6. 截图：复用已上线页面的 3 张，不新增图片文件

放在 #at-a-glance 表格下面，3 张并排，每张最宽 220px，加 loading="lazy"，alt 沿用原页面的 alt：

| 顺序 | 用哪张 | 原来在 |
|---|---|---|
| 1 | Amap 3 条公交路线（最快 40 分钟 ¥5） | /amap-vs-google-maps-china/ 第 5 张 |
| 2 | 滴滴英文车型和报价（3.1 公里，Economy ¥10） | /didi-in-china-for-foreigners/ #book 的车型报价图 |
| 3 | TenPayGo 付款确认页（International Card Fee ¥0.00，¥0.15 划掉） | /tenpaygo-for-tourists/ #pay 的第 15 张 |

---

## 7. 内链

本页正文入链现在 2 个（/first-trip-to-china/、/partners/china-visa-checker/），补到至少 3 个。用 sectionNotes 那种方式加一句，优先 /china-payment-guide/、/china-travel-checklist/、/tenpaygo-for-tourists/。句子只说明本页讲什么，例如：

> For all the apps to set up before you fly, see [the China travel apps I tested](/china-travel-apps/).

加链接的那些页面，lastmod 和 "Last reviewed" 不动。

---

## 8. 给 Claude Code 的指令

旧版内容已经导出看过（docs/seo/export/china-travel-apps.md），这次不用再停下确认。

```
先运行 pwd，确认当前目录是 ~/ChinaTravel-AI-Buddy。不是的话立刻停下，什么都不要改，告诉我。

是的话：git pull origin main。确认 docs/seo/apps-hub-spec.md 在，找不到就停下告诉我。

1. 先只读检查：/china-travel-apps/ 用到的文件，最近有没有别人改过；有没有还没合进 main 的分支、worktree 或 stash 在改这一页。有的话停下告诉我
2. 按 apps-hub-spec.md 第 5 节重写 /china-travel-apps/：正文的结构、顺序和英文文案都按第 5 节，直接用，不要改写、不要扩写。H1 不变。按第 5 节加锚点 id：at-a-glance、pay、getting-around、trains、wechat、translation、before、internet、mistakes。Quick answer 下面放 gig 3 卡片（和 Amap 页同一种卡片样式，文字用第 5 节的）。页面模板自带的 LinBox、Get my free China itinerary、Related guides 保留。浏览器版和静态预渲染版都要改到。FAQ 结构化数据同步更新
3. 截图按第 6 节复用已上线页面的 3 张，不新增图片文件，alt 沿用原页面的；图下加第 5 节那行小字
4. 按第 7 节补内链，补到至少 3 个。加链接的那些页面 lastmod 和 "Last reviewed" 不动
5. 本页 lastmod 和 "Last reviewed" 改成今天；其他页面不动
6. 跑项目自带的 SEO 检查和测试；检查脚本里加这一页的规则：9 个锚点都在，Sources 里有第 5 节列的 7 条链接，正文不能再出现 "ChinaEase Buddy: a web-based toolkit"

验收：合回 main 并部署，然后用带 ?cb=随机数 的网址检查正式站：
- 本页返回 200，title、meta description、署名行和第 5 节一致，H1 没变
- 9 个锚点都在；总表 7 行都在；gig 3 卡片链到 https://www.fiverr.com/s/p3dZbQR
- 3 张复用截图返回 200、有 alt
- FAQ 是 7 个，结构化数据和页面一致；7 条来源链接都在
- 第 4 步新加的链接都返回 200
- 全站没有内部链接指向被 301 的网址

最后把第 1 步的结果和验收结果一起贴给我。
```
