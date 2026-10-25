# 预算页改版：/china-travel-budget/（实测价格 + 官方票价）

> **页面**：https://chinaeasebuddy.com/china-travel-budget/（网址不改）
> **日期**：2026-10-25
> **做法**：实测版 + 官方来源版混合。日常消费、打车报价、火车票价、酒店价格来自你 10 月的实际消费和 App 查询；门票、地铁、刷卡手续费、汇率按官方来源
>
> **你要做的（1 分钟）**
> 1. 下载 budget-update.zip，用访达拖进 `ChinaTravel-AI-Buddy/docs/seo/`
> 2. 把第 9 节的指令粘给 Claude Code
> 3. 等它报告上线以后：GSC 和 Bing 提交这个网址

---

## 1. 为什么改、改成什么

**数据**（GSC 过去 3 个月，截至 10-23）：113 次展示，平均排名 26.35，0 点击。能看到的搜索词有 china travel budget、trip to china cost、china trip budget、budget china、china travel costs，都排在 66-95 名，量很小；大部分展示来自 GSC 不显示的长尾词。

**现在的问题**：页面上的价格全是"ChinaEase 估算区间"，没有一个数字标了来源或日期；高铁、机票没给任何具体价格；汇率只写"用实时汇率"。

**竞品**（10-25 查）：
- wanderinchina.com（2026-07）：没有署名，没有来源，标题里的每日预算和它自己的表格对不上
- Trip.com 指南（2026-06）：食物价格写着"按 2025 年估算"，按约 ¥7 兑 1 美元换算，几乎每节都链到自己的产品

两家都没有标了日期的真实价格，用的也不是现在的汇率（2026 年 10 月约 ¥6.7 兑 1 美元）。

**这次改成**：
1. 新加一节「Real prices I checked in October 2026」：每个价格写清是平时付的还是 App 里查的、在哪查、哪天查
2. 门票、地铁按官方来源写具体价格，附来源
3. 写进外卡手续费规则（单笔超过 ¥200 可能收 3%）和 TenPayGo 实测
4. 写进 2026 年 10 月汇率，美元、英镑、欧元三种
5. **每日预算区间和计算器不改**。实测价格用来支撑这些区间；最便宜的住宿比区间低很多，页面上如实写出来，并说明为什么不改区间（离市中心远、评分低）

---

## 2. 实测数据

### 日常消费（你平时在东莞付的价格）

| 项目 | 价格 |
|---|---|
| 早餐 | 10 块左右 |
| 咖啡 | 一二十 |
| 一瓶水 | 2 块 |
| 零食 | 几块钱 |
| 水果（买一次） | 二三十 |
| 一支笔（10-25 用 TenPayGo 付，绑的英国 Mastercard） | ¥4.90，International Card Fee ¥0.00，原价 ¥0.15（3%）划掉 |

### 打车（App 报价，没下单，东莞）

| 日期 | App | 行程 | 最便宜的网约车 | 出租车 |
|---|---|---|---|---|
| 10-24 | 滴滴 | 3.1 公里 | Economy ¥10（一口价） | 约 ¥14.1（估价） |
| 10-23 | 高德 | 14 公里 32 分钟 | 特惠快车 ¥19-23 | 约 ¥49 |
| 10-23 | 高德 | 25 公里 56 分钟 | 特惠快车 ¥34-38 | 约 ¥96 |

### 高铁（12306，11 月 4 日周三，10-25 晚上查；"起"价就是二等座价）

| 线路 | 车次 | 历时 | 二等座 |
|---|---|---|---|
| 北京南→上海虹桥 | G547 / G565 | 5 小时 53 分 / 6 小时 5 分 | ¥553 |
| 北京南→上海虹桥 | G1 | 4 小时 54 分 | ¥598 |
| 北京南→上海 | G3 | 4 小时 41 分 | ¥667 |
| 北京西→西安北 | G351 / G321 | 4 小时 10 分 / 4 小时 20 分 | ¥587 |
| 北京西→西安北 | G3931 | 5 小时 46 分 | ¥494 |
| 北京西→西安东 | K507（普速） | 15 小时 48 分 | ¥152.5（硬座） |
| 广州东→深圳 | C7005（城际） | 1 小时 27 分 | ¥72 |

**不用的**：上海→杭州东那张。列表按发车时间排，只露出凌晨从上海松江出发的慢车（¥23.5 硬座、¥33 动车二等座），不代表游客常坐的虹桥→杭州东高铁票价，所以这条线路不写。

### 酒店（携程，11 月 4 日入住一晚，1 间 1 人，10-25 晚上查）

| 搜索 | 默认排序前两家 | 低价优先前三家 |
|---|---|---|
| 北京 王府井 | 麗枫酒店（王府井大街，步行<100 米）¥598；速8精选酒店（步行 110 米）¥255 | ¥59（驾车 3 公里，4.1 分）、¥68（步行 1.9 公里，4.1 分）、¥71（驾车 3.4 公里，4.2 分） |
| 上海 南京东路 | 汉庭（外滩外白渡桥店，步行 1.4 公里）¥539；汉庭（外滩四川北路地铁站店，步行 1.4 公里）¥273 | 青旅床位 ¥30（驾车 4.9 公里，1.7 分）、¥31（驾车 3.6 公里，3.0 分）、¥31（驾车 2.3 公里，3.4 分） |

价格含携程给你账号显示的优惠（早鸟优惠、错峰白银价等）。

**没查的**：机票（可选项，跳过了）。

---

## 3. 官方来源核实过的

| 事实 | 来源 |
|---|---|
| 北京地铁：6 公里内 ¥3，6-12 公里 ¥4，12-22 公里 ¥5，22-32 公里 ¥6，之后每 20 公里加 ¥1；首都机场线 ¥25 | 北京市政府英文网 About Subway Fares（2025-04-23） |
| 上海地铁：6 公里内 ¥3，之后每 10 公里加 ¥1（2005 年起）；9 月 7 日开了调价听证会，两套方案都会让平均每次涨约 ¥1，没说什么时候定 | 上海市政府英文网（2026-08-20）；新民晚报 9-8："最终方案审定之后，将第一时间向全社会予以公布" |
| 故宫：4-10 月 ¥60，11-3 月 ¥40；珍宝馆、钟表馆各 ¥10；外国游客网上预约要填护照号 | Visit Beijing（北京市文旅局官网） |
| 慕田峪长城门票：成人 ¥45，优惠 ¥25 | 北京市政府英文网（2024-07-17） |
| 慕田峪摆渡车、缆车另外收费（身高 1.2 米及以下儿童免费乘坐，说明其他人要买票） | 慕田峪官网游客须知（2023-07-18） |
| 国家博物馆：免费，实名预约，最多提前 7 天 | 北京市政府英文网（2026-07-24） |
| 兵马俑：成人 ¥120，淡旺季同价；学生 ¥60；官网或官方微信实名预约 | 秦始皇帝陵博物院官网 |
| 成都大熊猫基地：成人 ¥55；6 岁及以下或身高 1.3 米以下免费 | 成都大熊猫繁育研究基地官网 |
| 外卡在支付宝、微信支付付款：单笔 ¥200 及以下一般免手续费，超过 ¥200 可能按全额收 3% | 上海市政府英文网（2026-09-21） |
| 2026-10-16 人民币汇率中间价：1 美元 = 6.7220 元，1 欧元 = 7.5228 元，1 英镑 = 8.9037 元 | 新华社 Market exchange rates in China（The Star 转载） |

**换算**（按 ¥6.72 / ¥8.90 / ¥7.52，取整到 10）：

| 档位 | 每人每天 | 美元 | 英镑 | 欧元 |
|---|---|---|---|---|
| Budget | ¥350-650 | 50-100 | 40-70 | 50-90 |
| Mid-range | ¥800-1,500 | 120-220 | 90-170 | 110-200 |
| Comfortable | ¥1,800-3,000+ | 270-450+ | 200-340+ | 240-400+ |

10 天总额：¥4,500-8,000 ≈ US$670-1,190；¥9,000-18,000 ≈ US$1,340-2,680；¥20,000-36,000+ ≈ US$2,980-5,360+。

---

## 4. 没核实到的事（页面上一律不写）

- 上海地铁调价的最终方案和实施时间：查到 10-25，只找到 9-8 的听证会报道
- 慕田峪摆渡车、缆车、滑道的具体价格：能打开的官方页面都没写
- 广州、深圳的地铁票价规则；各城市出租车起步价
- 上海虹桥→杭州东、广州南→深圳北的高铁票价（这次截图没拍到）
- 国内机票价格
- 最便宜的那几家能不能接待外国人（酒店页写了：2024 年官方表态酒店不能因为没有涉外资质拒绝境外客人，但不保证一定订得到）
- 外国老人能不能享受熊猫基地、兵马俑的老年免票
- 携程和 Trip.com 英文版价格是否一致
- 酒店、火车票都是动态价格，只代表 11 月 4 日这一天、10-25 查的那一刻

---

## 5. 定稿文案

**只改下面列出的地方。没列出的节一律保留不动**：计算器那一节、Daily China travel budget at a glance、When and where China costs more、Reduce cost without weakening the trip、Build your personal China budget、Budget mistakes to avoid、Get my free China itinerary、Lin 的咨询框、Related guides。

### Title（55 字符）

```
China Trip Cost (2026): Real Prices & Budget Calculator
```

### Meta description（150 字符）

```
China trip cost per day, from prices I checked in October 2026: Beijing–Shanghai train ¥553–667, a Wangfujing hotel ¥255, a 3 km DiDi ride ¥10.
```

### H1

不变：How Much Does a Trip to China Cost? 2026 Budget Guide

### 署名行

```
Maintained by Lin · Prices checked in Dongguan and in the 12306 and Ctrip apps, October 23–25, 2026 · Ticket and metro prices from official sources
```

"Last reviewed" 改成 October 25, 2026。

### Quick answer（整节替换，标题不变）

> Plan on **¥350–650 a day** on a budget, **¥800–1,500** mid-range and **¥1,800–3,000+** for a comfortable trip, per person, before international flights. At October 2026 exchange rates (US$1 ≈ ¥6.7), that's about **US$50–100**, **US$120–220** and **US$270–450+** a day.
>
> These are my planning ranges, not official averages. Here's what things cost when I checked in October 2026:
>
> - **Metro:** ¥3–6 for rides up to 32 km in Beijing (official fares).
> - **Ride-hailing:** DiDi quoted me ¥10 for a 3.1 km Economy ride in Dongguan; a taxi was estimated at ¥14.1.
> - **High-speed train:** Beijing to Shanghai in second class was ¥553–667 on 12306 for November 4.
> - **Hotels near Wangfujing, Beijing, for November 4:** ¥255 at a budget chain and ¥598 at a mid-range chain, both on Wangfujing. The cheapest I saw were ¥59–71, 2–3.4 km away.
> - **Food in Dongguan:** breakfast about ¥10, coffee ¥10–20, a bottle of water ¥2.
> - **Big sights:** Forbidden City ¥40 (November–March) or ¥60 (April–October); Terracotta Army ¥120.
> - **Card fees:** with a foreign card in Alipay or Weixin Pay, payments up to ¥200 are generally free; above that, 3% may apply.
>
> [See every price I checked](#real-prices)

### 新加一节：放在计算器那一节（含 7、10、14 天示例表）后面，Daily China travel budget at a glance 前面

H2：**Real prices I checked in October 2026**（id="real-prices"）

> I'm based in Dongguan, a big city between Guangzhou and Shenzhen. Below is what I usually pay there, plus prices I looked up in apps on October 23–25, 2026. Train and hotel prices are for Wednesday, November 4, 2026. Apps change prices with the date and demand, so treat these as examples, not quotes.
>
> **Everyday spending in Dongguan (what I usually pay)**
>
> | What | Price |
> |---|---|
> | Breakfast | about ¥10 |
> | Coffee | ¥10–20 |
> | Bottle of water | ¥2 |
> | Snack | a few yuan |
> | Fruit, one purchase | ¥20–30 |
> | A pen, paid with TenPayGo and a UK Mastercard | ¥4.90, no card fee |
>
> **Rides in Dongguan (quoted in the apps; I didn't book)**
>
> | Trip | Cheapest app ride | Taxi |
> |---|---|---|
> | 3.1 km (DiDi, October 24) | ¥10 | about ¥14.1 |
> | 14 km, 32 min (Amap, October 23) | ¥19–23 | about ¥49 |
> | 25 km, 56 min (Amap, October 23) | ¥34–38 | about ¥96 |
>
> **High-speed trains (12306, second class, November 4)**
>
> | Route | Second class | Journey time |
> |---|---|---|
> | Beijing South → Shanghai | ¥553–667 | 4 h 41 min – 6 h 5 min |
> | Beijing West → Xi'an North | ¥494–587 | 4 h 10 min – 5 h 46 min |
> | Guangzhou East → Shenzhen | ¥72 | 1 h 27 min |
>
> **Hotels (Ctrip, one room for one night, November 4)**
>
> | Search | Top of the default list | Cheapest I saw |
> |---|---|---|
> | Near Wangfujing, Beijing | ¥598 (Lavande) and ¥255 (Super 8 Hotel Premier), both on Wangfujing | ¥59–71, 2–3.4 km away |
> | Near East Nanjing Road, Shanghai | ¥539 and ¥273, two Hanting hotels 1.4 km away | ¥30–31 for a dorm bed, 2.3–4.9 km away |
>
> I searched in Ctrip, Trip.com's Chinese app. The prices include the discounts Ctrip showed my account, and Trip.com's English app may show different prices. The cheapest places came in well under the ranges further down this page, but they were 2–5 km from the center, and the cheapest Shanghai beds were rated 1.7–3.4 out of 5. If you book somewhere very cheap, read [how hotel check-in works for foreigners](/china-hotels-for-foreigners/) first.
>
> [截图 1、2 并排]
>
> *Screenshots from the 12306 and Ctrip apps (Chinese versions), October 25, 2026.*

### What the estimates include, and exclude

只换两处，这一节其他句子不动：

**① 讲货币和汇率的那句**（大意：人民币是货币、用实时汇率）换成下面这段和表：

> Prices are in Chinese yuan (RMB, ¥). On October 16, 2026, the official reference rate was ¥6.72 to the US dollar, ¥8.90 to the pound and ¥7.52 to the euro. Some guides still convert at ¥7 or more to the dollar, which makes China look a little cheaper in dollars than it is now. Check the live rate before you go.
>
> | Style | Per person per day | US$ | £ | € |
> |---|---|---|---|---|
> | Budget | ¥350–650 | 50–100 | 40–70 | 50–90 |
> | Mid-range | ¥800–1,500 | 120–220 | 90–170 | 110–200 |
> | Comfortable | ¥1,800–3,000+ | 270–450+ | 200–340+ | 240–400+ |

**② 讲城际交通"去 12306 和航空公司查"的那句**换成：

> Intercity trains and flights aren't in the daily figures. See the [train fares I checked](#real-prices) and the trip totals below.

找不到对应的句子，就把新内容加在这一节末尾，告诉我。

### Accommodation: usually the biggest variable：节末加一段

> **What I found for November 4, 2026:** on Wangfujing in Beijing, ¥255 at a budget chain and ¥598 at a mid-range chain; in Shanghai, two Hanting hotels 1.4 km from East Nanjing Road at ¥273 and ¥539. [All the prices](#real-prices)

### Food: inexpensive locally, but easy to scale up：节末加一段

> **What I usually pay in Dongguan:** breakfast about ¥10, coffee ¥10–20, a bottle of water ¥2, fruit ¥20–30.

### Local and intercity transport（整节替换，标题不变；原来讲国内机票的那段原样保留，放在最后）

> **Metro.** Fares go by distance. In Beijing, a ride of up to 6 km costs ¥3, 6–12 km ¥4, 12–22 km ¥5 and 22–32 km ¥6, then ¥1 more for every extra 20 km. The Capital Airport Express is a flat ¥25. In Shanghai, it's ¥3 for the first 6 km, then ¥1 more for every 10 km. Shanghai held a hearing on raising metro fares in September 2026, so check before you go. In Beijing, Shanghai, Guangzhou and Shenzhen you can [tap a contactless Visa or Mastercard at the gate](/alipay-metro-qr-transport-code-guide/#card). A metro-and-bus day comes to about ¥10–30.
>
> **Taxis and ride-hailing.** In Dongguan, DiDi quoted me ¥10 for a 3.1 km Economy ride, against a taxi estimate of ¥14.1. On a 25 km trip, the cheapest ride in Amap was ¥34–38 and a taxi about ¥96. App rides show a fixed upfront fare; taxis show an estimate. [How to use DiDi in English](/didi-in-china-for-foreigners/)
>
> **High-speed trains.** Long trips are the biggest transport cost. On 12306 for November 4, 2026, second class was ¥553–667 from Beijing to Shanghai, ¥494–587 from Beijing to Xi'an and ¥72 from Guangzhou East to Shenzhen ([details](#real-prices)). On the same route, faster trains cost more. Slow conventional trains are much cheaper but take far longer: K507 from Beijing West to Xi'an East was ¥152.5 for a hard seat, for a 15 h 48 min trip. [How to book on 12306](/china-train-travel-guide/)
>
> **Domestic flights.** （原文保留）

### Attractions, mobile data, payment, and extras（整节替换，标题不变）

> **Tickets.** Many public spaces are free, and most big paid sights cost about ¥40–200. Official adult prices for some of the big ones:
>
> | Sight | Adult ticket | Good to know |
> |---|---|---|
> | Forbidden City (Palace Museum), Beijing | ¥60 April–October, ¥40 November–March | Treasure Gallery and Hall of Clocks ¥10 each. Book online with your passport number |
> | Mutianyu Great Wall, Beijing | ¥45 | The shuttle bus and the cable car or toboggan cost extra |
> | National Museum of China, Beijing | Free | Book up to 7 days ahead; real-name entry, so bring your passport |
> | Terracotta Army, Xi'an | ¥120 | Same price all year. Book on the official website or WeChat |
> | Chengdu Panda Base | ¥55 | Free for children 6 and under or under 1.3 m |
> | The Bund (Shanghai), West Lake (Hangzhou) | Free | Public waterfronts |
>
> **Mobile data.** Allow about ¥50–300 for an eSIM, roaming or a local SIM, depending on how long you stay and how much data you use. [China eSIM & internet guide](/china-esim-internet-guide/)
>
> **Payment fees.** With a foreign card in Alipay or Weixin Pay, payments of ¥200 or less generally have no fee. Above ¥200, a 3% fee may apply to the whole amount (Shanghai government, September 2026): on a ¥300 dinner, that's ¥9. When I paid ¥4.90 for a pen with [TenPayGo](/tenpaygo-for-tourists/), which runs on Weixin Pay, the ¥0.15 (3%) fee was crossed out. Your own bank may add a foreign transaction fee. Set up at least two ways to pay: see the [payment guide for visitors](原来那条指向 english.www.gov.cn 的 PBoC 指南链接，保留).

### Estimated total for 5, 10, or 14 days：表格后面加一段

> The daily tables above leave out intercity travel; these totals add an allowance for it. For scale, one long high-speed trip, such as Beijing to Xi'an or Beijing to Shanghai, was ¥494–667 in second class when I checked 12306 for November 4.

### FAQ（原来 8 个问题顺序不变；第 1-5 个换回答，第 6-8 个不动，最后加第 9 个）

1. **How can I calculate a China travel budget for two people?**
   Enter two travelers in the calculator. It multiplies the per-person range, so it doesn't count what you save by sharing a room. Hotel prices are per room, so two people sharing pay about half each for accommodation; meals, tickets and train seats are per person.

2. **How much money do I need per day in China?**
   Plan on ¥350–650 per person a day on a budget, ¥800–1,500 mid-range and ¥1,800–3,000+ for comfortable travel, before international flights. At October 2026 rates, that's about US$50–100, US$120–220 and US$270–450+.

3. **Is China cheap for tourists?**
   Day to day, yes. When I checked in October 2026, a Beijing metro ride cost ¥3–6, a 3 km DiDi ride in Dongguan was quoted at ¥10, and breakfast cost me about ¥10. The big costs are hotels in central Beijing and Shanghai, long train trips (Beijing to Shanghai was ¥553–667 in second class) and paid sights.

4. **How much should I budget for 10 days in China?**
   About ¥4,500–8,000 per person on a budget, ¥9,000–18,000 mid-range and ¥20,000–36,000+ comfortable, including intercity trains but not international flights. At October 2026 rates, that's roughly US$670–1,190, US$1,340–2,680 and US$2,980–5,360+.

5. **Are high-speed trains expensive in China?**
   Long trips add up. On 12306 for November 4, 2026, second class was ¥553–667 from Beijing to Shanghai, ¥494–587 from Beijing to Xi'an and ¥72 from Guangzhou East to Shenzhen. On the same route, faster trains cost more, and first class costs more than second.

6. Do I need cash in China? —— 回答不动
7. Does the budget include international flights? —— 回答不动
8. When is travel in China most expensive? —— 回答不动

9. **（新加）Is there a fee for paying with a foreign card in China?**
   With a foreign card in Alipay or Weixin Pay, payments of ¥200 or less are generally free; above ¥200, a 3% fee may apply to the whole amount. When I paid ¥4.90 with TenPayGo and a UK Mastercard, the fee line showed ¥0.00. Your own bank may also charge a foreign transaction fee.

FAQ 结构化数据同步更新（9 个）。

### Official or primary sources to verify（整节替换成下面 11 条）

1. China Railway 12306 (English): https://www.12306.cn/en/
2. 原来那条 PBoC 访客支付指南（english.www.gov.cn），链接和文字保留
3. Shanghai government: Pay with overseas bank cards, with the ¥200 / 3% rule (September 2026): https://english.shanghai.gov.cn/en-Individuals-BankingandPayments-Payments/20260921/c2c94d06a0454c8fa05386b80d0ae865.html
4. Beijing government: About Subway Fares (April 2025): https://english.beijing.gov.cn/specials/beijinglifeonthesubway/noticeforpassengers/202504/t20250423_4072294.html
5. Shanghai government: Shanghai seeks public opinion on metro fare adjustment (August 2026): https://english.shanghai.gov.cn/en-Latest-WhatsNew/20260820/6676e7847de746e9aef956c40460bd84.html
6. Visit Beijing: The Palace Museum: https://english.visitbeijing.com.cn/special/35211decffa0df13234b0ec0b6eaa70b/a09086a79d9ad908daa236f25a5ed16b
7. Beijing government: Mutianyu Great Wall: https://english.beijing.gov.cn/specials/ticketing/attractions/202407/t20240717_3751593.html
8. Beijing government: National Museum of China opening notice (July 2026): https://english.beijing.gov.cn/whatson/events/Tips/202607/t20260724_4783113.html
9. Emperor Qinshihuang's Mausoleum Site Museum: Ticketing: https://www.bmy.com.cn/jingtai/bmyweb/ticketing.html
10. Chengdu Research Base of Giant Panda Breeding: Tickets: https://www.panda.org.cn/en/service/ticket/
11. Xinhua: Market exchange rates in China, October 16, 2026 (via The Star): https://www.thestar.com.my/news/world/2026/10/16/market-exchange-rates-in-china----oct-16

---

## 6. 截图

两张都是中文 App 截图，已裁掉手机状态栏，没有个人信息，不用打码。

| 编号 | 内容 | 放在哪 | alt |
|---|---|---|---|
| 1 | 12306：北京南→上海，11 月 4 日 | #real-prices 节末，和 2 并排 | 12306 app listing Beijing South to Shanghai high-speed trains for November 4, 2026, with second-class fares from ¥553 to ¥667 |
| 2 | 携程：王府井，11 月 4 日，默认排序 | #real-prices 节末，和 1 并排 | Ctrip hotel search near Wangfujing, Beijing, for November 4, 2026, showing rooms at ¥598 and ¥255 a night |

图下一行小字：*Screenshots from the 12306 and Ctrip apps (Chinese versions), October 25, 2026.*

---

## 7. 内链：3 个页面各加一句指向本页

已经有正文链接指向 /china-travel-budget/ 的页面就不加，告诉我是哪页。只加这一句，其他文案不动；这 3 页的 lastmod 和 "Last reviewed" 不动（只加一条链接不算内容更新）。

| 页面 | 放在哪 | 加的句子 |
|---|---|---|
| /china-train-travel-guide/ | #book 节末 | For sample fares, see [the second-class fares I checked on popular routes](/china-travel-budget/#real-prices). |
| /china-hotels-for-foreigners/ | 讲价格或预订的段落末尾；找不到就放在 Quick answer 后面 | For what rooms cost, see [hotel prices I checked in central Beijing and Shanghai](/china-travel-budget/#real-prices). |
| /china-itinerary-first-time-7-10-14-days/ | 讲预算或费用的段落末尾；找不到就放在 Quick answer 后面 | To budget your route, see [what a China trip costs in 2026](/china-travel-budget/). |

---

## 8. 站外：Facebook 群回答模板（有人问去中国要花多少钱时用）

> Real numbers from October 2026 (I'm based in Guangdong): Beijing–Shanghai high-speed train ¥553–667 in second class, a budget chain hotel on Wangfujing ¥255 a night, a Beijing metro ride ¥3–6, a 3 km DiDi ride quoted at ¥10, breakfast about ¥10. I'd plan ¥350–650 a day on a budget or ¥800–1,500 mid-range, before flights. One cost people miss: with a foreign card in Alipay or WeChat Pay, payments over ¥200 may carry a 3% fee. Full breakdown with sources: [link]

---

## 9. 给 Claude Code 的指令

```
先运行 pwd，确认当前目录是 ~/ChinaTravel-AI-Buddy。不是的话立刻停下，什么都不要改，告诉我。

是的话：git pull origin main。确认 docs/seo/budget-update.zip 在，解压到 docs/seo/budget-update/，里面应该有 budget-spec.md 和 budget-shots/1.png、2.png。找不到就停下告诉我。

1. 先只读检查：/china-travel-budget/ 用到的文件（页面数据、静态预渲染、计算器组件）最近有没有别人改过；有没有还没合进 main 的分支、worktree 或 stash 在改这一页。有的话停下告诉我
2. 按 budget-spec.md 第 5 节改 /china-travel-budget/：只改第 5 节列出的地方，没列出的节和计算器保留不动，计算器组件的代码不要改。新加的一节用 id="real-prices"。浏览器版和静态预渲染版都要改到。FAQ 结构化数据同步更新
3. 截图 1、2 按第 6 节放：和之前几页同一套处理，640 宽 WebP，并排每张最宽 220px，写 alt、width、height，加 loading="lazy"，图下加第 6 节那行小字。截图不要再改图；docs/seo/budget-update/ 里的原始 PNG 不要提交进 git
4. 按第 7 节在 3 个页面各加一句内链。已经有正文链接指向本页的就跳过，告诉我。这 3 页的 lastmod 和 "Last reviewed" 不动
5. 本页 lastmod 和 "Last reviewed" 改成今天；其他页面不动
6. 跑项目自带的 SEO 检查和测试；检查脚本里这一页的规则按新文案更新，再加一条：本页必须有 #real-prices，Sources 里必须有第 5 节列的 11 条链接

验收：合回 main 并部署，然后用带 ?cb=随机数 的网址检查正式站：
- 本页返回 200，title、meta description、H1、署名行和第 5 节一致
- 有 #real-prices，里面 4 张表都在（日常消费、打车、高铁、酒店）；Quick answer 里有 "¥553–667"；交通节里有北京地铁分段票价和上海听证会那句；汇率那段和换算表在
- 截图 1、2 返回 200、有 alt
- FAQ 是 9 个，结构化数据和页面一致
- 计算器组件的代码在 git diff 里没有改动
- 第 7 节新加的链接都指向 /china-travel-budget/ 或 /china-travel-budget/#real-prices，返回 200
- 全站没有内部链接指向被 301 的网址

最后把第 1 步的结果和验收结果一起贴给我。
```
