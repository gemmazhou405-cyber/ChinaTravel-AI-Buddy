# 出行清单页改版：/china-travel-checklist/（实测汇总 + 官方来源）

> **页面**：https://chinaeasebuddy.com/china-travel-checklist/（网址不改）
> **日期**：2026-10-26
> **做法**：整页重写（旧版 10-26 已导出看过）。把已经实测和核实过的结果（支付、App、入境、酒店）串成一张出发前清单，每一项链到对应的详细页。不用新截图
>
> **你要做的（1 分钟）**
> 1. 下载 checklist-spec.md，用访达拖进 `ChinaTravel-AI-Buddy/docs/seo/`
> 2. 把第 8 节的指令粘给 Claude Code
> 3. 上线后：GSC 请求编入索引（Bing 由 IndexNow 自动推送）

---

## 1. 为什么改、改成什么

**数据**（GSC 过去 3 个月，截至 10-23）：6 次展示，平均排名 8.0。没升级的页面里，它和苏州页离前 5 最近。

**旧版的问题**（10-26 导出全文看过）：
- 全是"准备好 App、支付方式、上网"一类的套话，没有一条具体规则或实测结果
- Sources 两条都不是真来源（"各 App 的官方说明""你的航空公司、酒店……"）
- title 还带 " | ChinaEase Buddy" 后缀；署名行没有日期；FAQ 只有 3 个；正文入链只有 2 个

**改成**：
1. Quick answer 换成 8 条清单，每条一句话
2. 按"支付、App 和上网、入境、酒店、证件和急救、出发前一天、落地第一个小时"分节，每条写具体做法，链到已升级的详细页（支付宝地铁、TenPayGo、Amap、滴滴、地图对比、微信验证、火车、机场入境、入境卡、酒店）
3. 实测和官方说法分开写清楚：实测的写"I tested / When I checked"，规则写来源
4. Quick answer 下面放 gig 3 卡片（这页的读者正是要在出发前设置 App 的人）
5. 旧版 6 个锚点 id 保留在对应的节上；新加两节 entry、after-landing

**H1 不变**（China Travel Checklist for First-Time Visitors）。

---

## 2. 用到的事实（都已在其他页面核实过）

| 事实 | 出处 |
|---|---|
| 外卡在支付宝、微信支付付款：单笔 ¥200 及以下一般免手续费，超过 ¥200 可能按全额收 3% | 上海市政府英文网 2026-09 |
| TenPayGo 只用邮箱注册，绑英国 Mastercard，店里付 ¥4.90，3% 手续费免了 | 实测 10-24、10-25（TenPayGo 页） |
| 北京、上海、广州、深圳地铁闸机可以直接刷外国 Visa、Mastercard | 支付宝地铁页（四城官方来源） |
| Amap 切英文：My → 齿轮 → Language → English，关掉再打开 | 实测 10-23（Amap 页） |
| 滴滴切英文：Account → 齿轮 → Language → English → 完成 → Confirm；上车前核对手机尾号 | 实测 10-24（滴滴页） |
| Google Maps 不开 VPN 打不开，开 VPN 也找不到公交路线 | 实测 10-26（地图对比页） |
| 微信注册可能要现有用户帮你验证 | 微信好友验证页 |
| 12306 英文站只收外国护照，要邮箱不要手机号；开车前 15 天开售；凭护照进站 | 火车页（12306 官方） |
| 入境卡 2025-11-20 起可以在线填，免费；国家移民管理局网站、移民局 12367 App、微信或支付宝小程序；也可以到口岸再填 | 中国驻瑞典使馆通知 2025-11；国家移民管理局 |
| 14 岁到 70 岁的外国人入境要留指纹 | 国家移民管理局《Welcome to China》 |
| 人民币现金 2 万元及以上、外币折合 5,000 美元及以上要申报 | 海关总署（经上海市政府英文网） |
| Trip.com 酒店 Policies 里的 Guests Accepted 一行；王府井一家酒店写着接待所有国家和地区的客人 | 实测 10-26（酒店页） |
| 住酒店以外的地方，要在 24 小时内向当地公安机关登记 | 《出境入境管理法》第三十九条（机场入境页、12367 登记页） |
| 北京宾馆不主动提供牙刷、梳子、剃须刀等一次性用品，要用可以向酒店要 | 携程页面上的北京城市通知（实测 10-26，酒店页） |
| 中国大陆普通网络下 Google、Facebook、YouTube、X 等被屏蔽或受限 | 英国政府旅行建议 |
| 110 报警、120 急救、119 火警 | 旧版原有 |

---

## 3. 没核实到的事（页面上一律不写）

- eSIM 和漫游哪家好用、多少钱（没测过，只写"出发前设置好、看清套餐覆盖什么"）
- 带药入境的具体规定（只保留旧版"随身带好需要的用药文件"那句）
- 240 小时过境免签的国家数、口岸数（只给链接，不写数字）
- 支付宝、微信用外国手机号注册的完整流程

---

## 4. 定稿文案

**正文整页按本节重写**：结构、顺序和英文文案都按本节，文案已经定稿，直接用，不要改写、不要扩写。页面模板自带的 Get my free China itinerary、LinBox、Related guides 保留。H1 不变。

### Title（56 字符，去掉 " | ChinaEase Buddy"）

```
China Travel Checklist (2026): What to Do Before You Fly
```

### Meta description（149 字符）

```
What I'd set up before a first trip to China in 2026: the free arrival card, Alipay with a foreign card, Amap and DiDi in English, trains and hotels.
```

### 署名行

```
Maintained by Lin · Apps, payments and hotel booking tested in China, October 2026 · Entry rules checked against official sources
```

"Last reviewed" 改成今天。

### Quick answer（id="quick-answer"，保留）

> Before a first trip to China:
>
> 1. **Visa:** check whether your passport can enter visa-free.
> 2. **Arrival card:** fill it in free online before you fly, or at the airport.
> 3. **Payment:** link a foreign card to Alipay, set up a second way to pay, and carry a physical card and some cash.
> 4. **Apps:** install Amap and DiDi and switch both to English. Google Maps didn't load without a VPN when I tested it in China.
> 5. **Mobile data:** set up an eSIM or roaming before you fly.
> 6. **Trains:** book on 12306 or Trip.com. Tickets go on sale 15 days before departure.
> 7. **Hotels:** check the "Guests Accepted" line on Trip.com, and save the address in Chinese.
> 8. **Emergencies:** save 110 (police), 120 (ambulance) and 119 (fire).
>
> Jump to: [Payment](#payment-preparation) · [Apps and data](#apps-and-connectivity) · [Entry](#entry) · [Hotels](#hotels-and-arrival-details) · [Documents and emergencies](#documents-health-and-emergency-backups) · [The day before](#the-final-24-hour-check) · [After landing](#after-landing)

### gig 3 卡片（紧跟在 Quick answer 下面，和 App 总页同一张卡片的样式）

> **Flying soon?** I'll help you set up Alipay, TenPayGo, Amap and DiDi before you fly, so nothing gets stuck at a verification screen when you land.
> [See the app setup service on Fiverr →](https://www.fiverr.com/s/p3dZbQR)

### H2：Payment: two ways to pay, plus cash（id="payment-preparation"）

> - Link a Visa, Mastercard or other foreign card to **Alipay** before you fly. With a foreign card in Alipay or Weixin Pay, payments of ¥200 or less are generally free; above ¥200, a 3% fee may apply to the whole amount (Shanghai government, September 2026).
> - Set up a second way to pay. I signed up for **TenPayGo** with just an email, linked a UK Mastercard and paid ¥4.90 in a shop; the 3% card fee was waived. [TenPayGo, tested](/tenpaygo-for-tourists/)
> - Carry a physical card and some yuan. A linked card can still fail at a verification step.
> - Make sure you can receive your bank's security texts in China. Never share a payment PIN or one-time code with anyone offering to help you set up.
> - In Beijing, Shanghai, Guangzhou and Shenzhen you can tap a contactless Visa or Mastercard at metro gates. [Metro: card or ride code](/alipay-metro-qr-transport-code-guide/#card)
>
> [Alipay for foreigners](/alipay-for-foreigners/) · [China payment guide](/china-payment-guide/)

### H2：Apps and mobile data（id="apps-and-connectivity"）

> - **Amap** for maps, public transport and taxis. To switch it to English: **My** → gear icon → **Language** → **English**, then close and reopen the app. [Amap in English](/amap-english-mode-guide-2026/)
> - **DiDi** for rides: **Account** → gear icon → **Language** → **English** → **完成** (Done) → **Confirm**. [DiDi in English](/didi-in-china-for-foreigners/)
> - **Not Google Maps.** When I tested it in China on October 26, 2026, it didn't load without a VPN, and with one it found no public transport route. [My Google Maps vs Amap test](/amap-vs-google-maps-china/)
> - **WeChat** for messages. When you sign up, it may ask an existing user to verify you. [WeChat verification](/wechat-verification-without-friend-qr-2026/)
> - **12306 or Trip.com** for trains. 12306's English site takes foreign passports and asks for an email, not a Chinese phone number. Tickets go on sale 15 days before departure, and you board with your passport. [China train tickets](/china-train-travel-guide/)
> - **Mobile data:** on ordinary mainland networks, Google, Facebook, YouTube, X and some other services are blocked or restricted. Set up an eSIM or roaming before you fly, and check what your plan covers. [China eSIM guide](/china-esim-internet-guide/)
> - Download an offline translation app with Chinese, and test it in airplane mode.
>
> For all the apps I tested, see [China travel apps](/china-travel-apps/).

### H2：Entry: visa, arrival card and customs（id="entry"，新加）

> - **Visa:** check whether you can enter visa-free with your passport, or use 240-hour visa-free transit if you're flying on to a third country. [China visa-free travel guide](/china-visa-free-travel-guide/) · [240-hour visa-free transit](/china-240-hour-visa-free-transit-2026/)
> - **Arrival card:** since November 20, 2025, you can fill it in online before you travel, on the National Immigration Administration website, the NIA 12367 app, or the WeChat or Alipay mini program. It's free; ignore websites that charge. You can also do it at the airport. [How to fill in the arrival card](/china-online-arrival-card-2026/)
> - **Fingerprints:** if you're 14 to 70, they're taken at immigration.
> - **Customs:** declare ¥20,000 or more in yuan cash, or US$5,000 or more in foreign currency.
>
> Step by step from the plane: [arrival card, immigration and customs](/china-airport-arrival-guide/)

### H2：Hotels and getting from the airport（id="hotels-and-arrival-details"）

> - On Trip.com, open the hotel's **Policies** tab and read the **Guests Accepted** line before you book. When I checked a hotel near Wangfujing in October 2026, it said "Guests from all countries/regions are welcome at this property." [How I checked](/china-hotels-for-foreigners/#check-before-booking)
> - Save the hotel's name, address and phone number in Chinese, plus a screenshot of the booking. A driver may need the Chinese address even when the brand name is familiar.
> - Staying somewhere other than a hotel, such as a friend's home? Register with the local police within 24 hours. [Register your stay online](/nia-12367-online-accommodation-registration-guide/)
> - In Beijing, hotels don't put out toothbrushes, combs or razors unless you ask, so pack your own.
> - Check your arrival terminal and the last metro or airport train. If you land late, plan on the taxi queue or DiDi.

### H2：Documents, health and emergencies（id="documents-health-and-emergency-backups"）

> - Keep your passport, onward ticket and first hotel booking easy to reach. Use the same passport name for flights, trains and hotels.
> - Keep any medication documents you need with you.
> - If you have a food allergy, carry it written in Chinese, and confirm with restaurant staff: translation tools can miss ingredients.
> - Save 110 for police, 120 for an ambulance and 119 for fire, plus your embassy, insurer and hotel, in an offline note.

### H2：The day before you fly（id="the-final-24-hour-check"）

> 1. Charge your phone and power bank, and save your tickets and bookings for offline use.
> 2. Open each app once more: log in, find your hotel in Amap, check your card in Alipay.
> 3. Check your arrival terminal, the last metro or airport train, and your hotel's reception hours.
> 4. Share your arrival plan with someone at home.

### H2：In the first hour after landing（id="after-landing"，新加）

> - Switch on your eSIM or roaming and check that you have data.
> - Make one small payment, like a bottle of water, to check that your payment app works with your card.
> - Into the city: tap your card at the metro gate in Beijing, Shanghai, Guangzhou or Shenzhen, use the official taxi queue, or book DiDi from the ride-hailing pickup area. Before you get in, confirm the last digits of your phone number with the driver.
>
> [From the plane to your hotel](/china-airport-arrival-guide/)

### FAQ（6 个，结构化数据同步；旧版 3 个问题保留，换或补答案，另加 3 个）

1. **What should first-time visitors prepare before going to China?**
   Check your visa options, fill in the arrival card, set up Alipay plus a second way to pay, install Amap and DiDi in English, sort out mobile data, and save your hotel address in Chinese. Carry a physical card and some cash too.
2. **Do I need to fill in an arrival card for China?**
   Most foreign visitors do. Since November 20, 2025, you can fill it in free online before you fly, or do it at the airport. Some travelers are exempt, such as passengers transiting within 24 hours who stay inside the airport.
3. **Can I use my foreign bank card in China?**
   Yes, through Alipay or Weixin Pay: payments of ¥200 or less are generally free, and above ¥200 a 3% fee may apply. In Beijing, Shanghai, Guangzhou and Shenzhen you can also tap a contactless Visa or Mastercard at metro gates. Carry some cash as a backup.
4. **Does Google Maps work in China?**
   Not on its own. When I tested it in China on October 26, 2026, it didn't load without a VPN, and with one it found no public transport route. Use Amap, which works in English.
5. **Should I save my hotel address in Chinese?**
   Yes. A Chinese hotel address is helpful for taxis, ride-hailing pickups, hotel returns, and asking locals for directions. Before you book, also check the hotel's "Guests Accepted" line on Trip.com.
6. **Do I need offline phrases in China?**
   Offline phrases are useful when mobile data is weak, apps are unavailable, or you need to show a clear Chinese sentence quickly.

### Official or primary sources to verify（整体替换成这 8 条）

1. National Immigration Administration: online arrival card: https://s.nia.gov.cn/ArrivalCardFillingPC/
2. Chinese Embassy in Sweden: Notice on the online filling of China's arrival card (November 2025): https://se.china-embassy.gov.cn/eng/lsyfw/202511/t20251126_11760567.htm
3. National Immigration Administration: Welcome to China (fingerprints): https://www.nia.gov.cn/2022en/files/basic-html/page10.html
4. China Customs, via the Shanghai government: customs guide for inbound passengers: https://english.shanghai.gov.cn/en-CustomsClearance/20231212/9a3c7f512d464e0798be3fc76c8dd6f2.html
5. Shanghai government: Pay with overseas bank cards, with the ¥200 / 3% rule (September 2026): https://english.shanghai.gov.cn/en-Individuals-BankingandPayments-Payments/20260921/c2c94d06a0454c8fa05386b80d0ae865.html
6. Shanghai government: Hotels told not to turn away foreign guests (May 2024): https://english.shanghai.gov.cn/en-Latest-WhatsNew/20240529/6ff842313deb45e1b14cf5fd2a01d065.html
7. China Railway 12306 (English): https://www.12306.cn/en/index.html
8. UK government: China internet access advice: https://www.gov.uk/foreign-travel-advice/china/safety-and-security#internet-access

---

## 5. 旧版内容怎么处理

- **保留**：旧版 6 个锚点 id（quick-answer、apps-and-connectivity、payment-preparation、hotels-and-arrival-details、documents-health-and-emergency-backups、the-final-24-hour-check），按第 4 节放在对应的节上；旧版指向 /china-travel-apps/、/china-airport-arrival-guide/、/china-online-arrival-card-2026/、/china-visa-free-travel-guide/ 的 4 条正文链接，第 4 节里都有；FAQ 的 3 个问题；保存中文地址、过敏卡、报警电话、同一个护照名、出发前一天检查这些内容（写得更具体）
- **去掉**：两条不是来源的 Sources；"保存收据""和可信的人分享行程时别解锁所有个人文件"这类和出发准备关系不大的句子

---

## 6. 内链：2 个页面各加一句指向本页

本页正文入链现在 2 个（/first-trip-to-china/、/partners/china-visa-checker/），补到 4 个。用 sectionNotes 那种方式加一句，其他文案不动；这 2 页的 lastmod 和 "Last reviewed" 不动（只加一条链接不算内容更新）。已经有正文链接指向本页的就跳过，告诉我。

| 页面 | 放在哪 | 加的句子 |
|---|---|---|
| /china-travel-apps/ | #before 节末 | For everything else to sort out before you fly, see [my China travel checklist](/china-travel-checklist/). |
| /china-airport-arrival-guide/ | #before 节末 | For the full list of what to do before you fly, see [my China travel checklist](/china-travel-checklist/). |

---

## 7. 站外：Facebook 群回答模板（有人问"第一次去中国要准备什么"时用）

> My pre-trip list for China (checked October 2026): 1) see if you can enter visa-free; 2) fill in the arrival card online, it's free; 3) link a foreign card to Alipay and set up a backup like TenPayGo, plus carry some cash (payments over ¥200 with a foreign card may carry a 3% fee); 4) install Amap and DiDi and switch them to English, because Google Maps didn't even load for me without a VPN; 5) sort out an eSIM; 6) save your hotel address in Chinese. Full checklist with links: [link]

---

## 8. 给 Claude Code 的指令

旧版内容已经导出看过（docs/seo/export/china-travel-checklist-old.md），这次不用再停下确认。

```
先运行 pwd，确认当前目录是 ~/ChinaTravel-AI-Buddy。不是的话立刻停下，什么都不要改，告诉我。

是的话：git pull origin main。确认 docs/seo/checklist-spec.md 在，找不到就停下告诉我。

1. 先只读检查：/china-travel-checklist/ 用到的文件，最近有没有别人改过；有没有还没合进 main 的分支、worktree 或 stash 在改这一页。有的话停下告诉我
2. 按 checklist-spec.md 第 4 节重写 /china-travel-checklist/：正文的结构、顺序和英文文案都按第 4 节，直接用，不要改写、不要扩写。H1 不变。锚点 id 按第 4 节：quick-answer、payment-preparation、apps-and-connectivity、entry、hotels-and-arrival-details、documents-health-and-emergency-backups、the-final-24-hour-check、after-landing。Quick answer 下面放 gig 3 卡片（和 App 总页同一种卡片样式，文字用第 4 节的）。页面模板自带的 Get my free China itinerary、LinBox、Related guides 保留。如果这页还是旧的页面格式，换成和其他改版页一样的格式。浏览器版和静态预渲染版都要改到。FAQ 结构化数据同步更新
3. 按第 6 节补内链。加链接的那 2 页 lastmod 和 "Last reviewed" 不动
4. 本页 lastmod 和 "Last reviewed" 改成今天；其他页面不动
5. 跑项目自带的 SEO 检查和测试；检查脚本里加这一页的规则：8 个锚点都在，Sources 里有第 4 节列的 8 条链接，title 里不能再有 "| ChinaEase Buddy"

验收：合回 main 并部署，然后用带 ?cb=随机数 的网址检查正式站：
- 本页返回 200，title、meta description、署名行和第 4 节一致，H1 没变
- 8 个锚点都在；Quick answer 是 8 条；gig 3 卡片链到 https://www.fiverr.com/s/p3dZbQR
- FAQ 是 6 个，结构化数据和页面一致；8 条来源链接都在
- 本页正文里的站内链接全部返回 200；第 3 步新加的 2 条链接也返回 200
- 全站没有内部链接指向被 301 的网址
- 用 scripts/indexnow.mjs 推送本页和第 3 步改过的 2 页，写上返回的状态码

最后把第 1 步的结果和验收结果一起贴给我。
```
