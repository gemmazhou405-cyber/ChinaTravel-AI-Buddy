# 苏州 3 天行程页改版：/3-day-suzhou-itinerary/（官方来源版）

> **页面**：https://chinaeasebuddy.com/3-day-suzhou-itinerary/（网址不改）
> **日期**：2026-10-27
> **做法**：整页重写（旧版 10-26 已导出看过）。行程结构和 8 个锚点保留，把旧版里"去官方查"的地方全部换成具体的票价、开放时间和预约规则，新加一节门票总表。来源是苏州市园林局、苏州博物馆、苏州市政府的发布，以及中国日报的 China Bound。不用截图
>
> **你要做的（1 分钟）**
> 1. 下载 suzhou-spec.md，用访达拖进 `ChinaTravel-AI-Buddy/docs/seo/`
> 2. 把第 8 节的指令粘给 Claude Code
> 3. 上线后：GSC 请求编入索引（Bing 由 IndexNow 自动推送）

---

## 1. 为什么改、改成什么

**数据**（GSC 过去 3 个月，截至 10-23）：7 次展示，平均排名 6.3。没升级的页面里离前 5 最近；行程页也最对口付费的 Trip Plan。

**旧版的问题**（10-26 导出看过）：
- 一个具体数字都没有，每一节都是"去官方渠道查开放时间、票价、预约规则"
- 正文入链 0 个（只有导航链到它）
- 署名行没有日期；Sources 里园林的两条是 2016 年的政府页面

**竞品写的票价互相打架**（10-26 查）：wanderinchina 写拙政园 ¥70 / ¥50；chinafortravelers 写 ¥80 / ¥70；官方小程序的名字一家写"苏州园林"，一家写"苏州园林旅游"。

**这次改成**：
1. 新加一节「Tickets, hours and booking」：主要景点的官方票价、开放时间、预约方法放进一张表
2. 外国人怎么订：拙政园、留园、狮子林要实名分时预约，用护照；拙政园现场不卖票；苏州博物馆免费但要预约，周一闭馆；西馆是另一个馆
3. 三天行程原样保留，每天写上具体的开门时间、地铁站和票价
4. 补 3 条正文入链（上海、杭州、南京 3 天行程页）

---

## 2. 已核实的事实

| 事实 | 来源 |
|---|---|
| 门票：拙政园旺季 ¥80、淡季 ¥70；留园 ¥55 / ¥45；狮子林 ¥40 / ¥30；网师园 ¥40 / ¥30，网师园夜花园 ¥120；沧浪亭 ¥20 / ¥15；虎丘 ¥70 / ¥60。旺季：4、5、7、8、9、10 月；淡季：1、2、3、6、11、12 月 | 苏州市园林和绿化管理局"门票价格"（2024-07-11）；中国日报 China Bound（2025-12）月份和价格一致 |
| 拙政园（东北街 178 号）、留园（留园路 338 号）：3-10 月 7:30-17:30，11-2 月 7:30-17:00。虎丘：5-10 月 7:30-18:00，11-4 月 7:30-17:30 | China Bound（2025-12-22） |
| 拙政园在微信公众号"苏州园林旅游"预约；护照可以入园；现场不卖票；7:30-9:00 去人少；地铁 6 号线拙政园苏博站 2 号口步行 5-10 分钟，或 4 号线北寺塔站 4 号口 10-15 分钟 | China Bound（2026-04-17） |
| 拙政园实名、分时预约，提前 1 至 7 天 | 中国旅游报（经网易转载，2026-07-05） |
| 2026 年 6 月 19 日至 10 月 7 日拙政园提前到 6:45 开园 | 苏州发布（2026-06-19） |
| 除拙政园、留园、狮子林外，其他园林景区取消实名预约，外籍游客可以直接扫码购票入园；实名预约的景区外籍游客用护照购票；购票已接入 Trip.com（携程海外版）；4A 级以上景区配了境外银行卡 POS 机 | 名城苏州新闻中心（苏州市园林和绿化管理局数据，2024-07-24） |
| 2025 年网师园夜花园 3 月 7 日至 11 月 16 日开放 | 苏州发布（2025-08-22） |
| 苏州博物馆本馆：免费；9:00-17:00，16:00 停止入馆；周一闭馆（法定节假日除外）；官网或微信公众号"苏州博物馆"预约，提前 7 天、早上 8 点放；护照或身份证；超过预约时段 30 分钟作废 | China Bound（2026-04-17）；苏州博物馆官网《开放指南》 |
| 本馆分时全预约，可以用"苏州博物馆全预约"小程序；实名入馆可出示护照原件；西馆（长江路 399 号）不用预约 | 苏州发布《延时开放公告》（2026-06-25） |
| 西馆是在古城以外的另一个馆 | China Bound（2026-04-17） |
| 12306 开车前 15 天开售 | 火车页（12306 官方） |

---

## 3. 没核实到的事（页面上一律不写）

- 上海到苏州的高铁车程和票价（想补的话：12306 查上海虹桥 → 苏州、11 月 4 日，截一张发给 Claude，加一行就行，不急）
- 狮子林、网师园白天的开放时间
- 2026 年网师园夜花园的开放日期，拙政园夜游现在开不开
- 同里的门票价格
- 苏州地铁能不能刷外国银行卡
- 2024 年说的"有困难可以找现场工作人员买票"现在还算不算数（2026 年 China Bound 说拙政园现场不卖票，页面按 2026 年的写）
- Trip.com 现在还卖不卖园林门票（页面写成"2024 年苏州说已经上了 Trip.com"）

---

## 4. 定稿文案

**正文整页按本节重写**：结构、顺序和英文文案都按本节，文案已经定稿，直接用，不要改写、不要扩写。页面模板自带的 Get my personalised Suzhou itinerary、免责声明、LinBox、两组 Related guides 保留。H1 不变。

### Title（57 字符）

```
3-Day Suzhou Itinerary (2026): Gardens, Tickets & Booking
```

### Meta description（150 字符）

```
Three days in Suzhou with 2026 prices: Humble Administrator's Garden ¥70–80, Lingering Garden ¥45–55, Suzhou Museum free. How to book with a passport.
```

### 署名行

```
Maintained by Lin · Prices, hours and booking rules checked against official sources, October 2026
```

"Last reviewed" 改成今天。

### Quick answer（id="quick-answer"）

> With three days in Suzhou:
>
> - **Day 1:** the Humble Administrator's Garden at opening time, Suzhou Museum a short walk away, then Pingjiang Road.
> - **Day 2:** the Lingering Garden and the western old city.
> - **Day 3:** Tiger Hill, a smaller garden, or a whole day in a water town.
>
> Book ahead with your passport: the Humble Administrator's Garden (¥70–80) and the Lingering Garden (¥45–55) take real-name bookings, and Suzhou Museum is free but needs a reserved slot and is closed on Mondays. Stay in or near the old city.
>
> [Tickets, hours and booking](#tickets)

### H2：Three days at a glance（id="three-days-at-a-glance"）

> | Day | Main route | Why this grouping works |
> |---|---|---|
> | Day 1 | Humble Administrator's Garden, Suzhou Museum, Pingjiang Road | The garden and the museum are a short walk apart in the northeast of the old city |
> | Day 2 | Lingering Garden, western old-city lanes, one smaller garden or Shantang Street | A different garden and a quieter part of town |
> | Day 3 | Choose one: Tiger Hill, more old-city culture, or a water-town day | Leave room for your own pace and your onward train |
>
> - This assumes three full sightseeing days. A late arrival and an early departure don't add up to a third day.
> - Two major gardens in one day can blur together. Give each one time for sitting, details and photos.
> - Garden paths, narrow lanes and canal bridges involve steps. Adapt the route for mobility and summer heat.

### H2：Tickets, hours and booking（id="tickets"，新加）

> Official adult prices. Peak season is April, May and July–October; off-peak is November–March and June.
>
> | Sight | Ticket (peak / off-peak) | Hours | Booking |
> |---|---|---|---|
> | Humble Administrator's Garden | ¥80 / ¥70 | 7:30–17:30 March–October; 7:30–17:00 November–February | Timed, real-name booking 1 to 7 days ahead; no tickets sold on site |
> | Lingering Garden | ¥55 / ¥45 | Same as above | Real-name booking |
> | Tiger Hill | ¥70 / ¥60 | 7:30–18:00 May–October; 7:30–17:30 November–April | Scan the code at the gate and pay |
> | Suzhou Museum (main building) | Free | 9:00–17:00, last entry 16:00; closed Mondays except public holidays | Timed slot, released 7 days ahead at 8:00 |
> | Pingjiang Road | Free | Open street | None |
>
> **How to book the gardens.** The Humble Administrator's Garden, the Lingering Garden and the Lion Grove Garden take real-name bookings. Book them on the official WeChat account **苏州园林旅游** (Suzhou Gardens Tourism), using your passport. In 2024, Suzhou said it had also put the tickets on Trip.com. Most of the other gardens the city runs dropped real-name booking in 2024, so you can scan the code at the gate and pay. Big holidays can sell out: Xinhua reported the Humble Administrator's Garden was fully booked over the 2025 May Day holiday.
>
> **Suzhou Museum.** The main building, a short walk from the Humble Administrator's Garden, is free, but you need a timed slot. Slots open 7 days ahead at 8:00 on the museum's website, its WeChat account **苏州博物馆**, or the mini program **苏州博物馆全预约**. Bring the passport you booked with, and arrive within 30 minutes of your slot. **Suzhou Museum West**, at 399 Changjiang Road outside the old city, is a separate branch that doesn't need a booking. Make sure you're going to the right one.
>
> **Paying.** In 2024, Suzhou said its major sights had card machines for foreign bank cards. For everyday payments, see the [China payment guide](/china-payment-guide/).

### H2：Day 1: gardens, museum and Pingjiang Road（id="day-1-gardens-museum-and-pingjiang-road"）

> 1. Take the first slot at the **Humble Administrator's Garden**, 178 Dongbei Street. It opens at 7:30; arrive between 7:30 and 9:00 to avoid the crowds. Take Metro Line 6 to Zhuozhengyuan Subo station, Exit 2, about a 5–10 minute walk. In summer 2026 it opened at 6:45 for the lotus season (June 19–October 7), so check the hours if you visit in summer.
> 2. Walk to **Suzhou Museum** for your reserved slot. It's free, opens at 9:00 and is closed on Mondays.
> 3. Walk **Pingjiang Road** slowly, turning into side lanes and crossing the small bridges instead of treating it as one photo stop.
> 4. Have dinner near the old city or your hotel. If it rains, spend longer in the museum instead of walking the canals.

### H2：Day 2: Lingering Garden and the western old city（id="day-2-lingering-garden-and-the-western-old-city"）

> 1. Visit the **Lingering Garden**, 338 Liuyuan Road, for its halls, courtyards, rockwork and framed views. It opens at 7:30 and takes real-name bookings like the Humble Administrator's Garden.
> 2. Add one stop that matches your interests: a smaller garden, a craft venue, or a walk along Shantang Street.
> 3. Take a food break instead of crossing town for several more gardens. Try a Suzhou noodle shop, and confirm the ingredients if you have allergies.
> 4. In the evening, walk by the canals, or check whether the **Master of the Nets Garden** night garden is running. It's ¥120 on the official price list, and in 2025 it ran from March 7 to November 16.

### H2：Day 3: choose one sensible extension（id="day-3-choose-one-sensible-extension"）

> | Option | Best for | Planning trade-off |
> |---|---|---|
> | Tiger Hill | A scenic hill northwest of the old city | ¥70 / ¥60; open 7:30 to 17:30–18:00 depending on the season. Shantang Street leads there |
> | Smaller gardens and Suzhou history | Design, architecture and a relaxed city day | The Lion Grove Garden and the Master of the Nets Garden are ¥40 / ¥30. Don't rush between distant sites |
> | Museum, silk or craft focus | Culture with an indoor weather backup | Tell demonstrations apart from sales |
> | Canals and old-city neighbourhoods | Walking, photography and food | Wear comfortable shoes and take your time in the narrow lanes |
> | Tongli or another water town | A whole day outside central Suzhou | Confirm transport, entry and the last return; don't combine several towns |
>
> - Choose one complete third-day route. A water town plus several central gardens is too much for most first-time visitors.
> - If you have an afternoon train, keep the last stop close to the station and collect your luggage before the rush.

### H2：Where to stay and how to arrive from Shanghai（id="where-to-stay-and-how-to-arrive-from-shanghai"）

> - For two garden-heavy days, stay near the old city or a metro stop close to your hotel. A hotel beside a distant railway station can cost you sightseeing time.
> - Suzhou, Suzhou North and Suzhou Industrial Park are different railway stations, and Shanghai has several major stations too. Read the exact stations on your ticket.
> - Book on 12306 or Trip.com with the passport you'll travel on. Tickets go on sale 15 days before departure. [How to book China trains](/china-train-travel-guide/)
> - Before you book a hotel, check its "Guests Accepted" line on Trip.com ([how](/china-hotels-for-foreigners/#check-before-booking)), and save its Chinese name, address and phone number.
> - A day trip from Shanghai can cover one garden and a nearby neighbourhood. Three days let you see Suzhou's gardens, canals and food at a slower pace.
>
> - [3-day Nanjing itinerary](/3-day-nanjing-itinerary/): Sun Yat-sen Mausoleum, Nanjing Museum, the Qinhuai River, city walls and train tips.

### H2：Bookings, crowds and weather（id="bookings-crowds-and-weather"）

> | Before you go | What to check | Why it matters |
> |---|---|---|
> | Gardens | Book the Humble Administrator's Garden (1 to 7 days ahead) and the Lingering Garden with your passport | No tickets are sold on site at the Humble Administrator's Garden, and holidays sell out |
> | Suzhou Museum | Book the main building, not Suzhou Museum West; not on a Monday | The museum is closed on Mondays except public holidays |
> | Trains | The exact Shanghai and Suzhou stations on your ticket | A wrong-station transfer can cost half a day |
> | Water-town day | Transport each way, entry and the last return | It's a full day, not a quick stop |
>
> - In summer, start early and keep shade, water and an indoor break in the plan. In rain, stone paths and bridges get slippery.
> - The prices and hours on this page come from official sources, checked in October 2026. They can change on holidays, so check again shortly before you go.

### H2：How to adapt the route（id="how-to-adapt-the-route"）

> - **One day:** the Humble Administrator's Garden plus Pingjiang Road, adding Suzhou Museum if you've booked a slot (not on a Monday).
> - **Two days:** keep the northeast cluster and the Lingering Garden on separate days; save the water town for another trip.
> - **With children or limited mobility:** one major garden a day, shorter lane walks, and check step-free routes and taxi drop-off points.
> - **Garden lovers:** replace Day 3's excursion with smaller gardens that differ in size and design. If you prefer canals and street life, visit fewer gardens.

### FAQ（7 个，结构化数据同步；旧版 6 个问题保留顺序，第 4 个换答案，最后加第 7 个）

1. **Are three days enough for Suzhou?**（回答不动）
2. **Can Suzhou be a day trip from Shanghai?**（回答不动）
3. **Which Suzhou railway station should I use?**（回答不动）
4. **Do I need to reserve Suzhou Museum and gardens?**
   Yes, for the big ones. The Humble Administrator's Garden, the Lingering Garden and the Lion Grove Garden take real-name bookings on the official WeChat account 苏州园林旅游; foreign visitors book with a passport, and the Humble Administrator's Garden sells no tickets on site. Suzhou Museum's main building is free, but slots open 7 days ahead at 8:00, and it's closed on Mondays except public holidays.
5. **Should I add Tongli to a three-day Suzhou itinerary?**（回答不动）
6. **Can ChinaEase Buddy personalise this Suzhou plan?**（回答不动）
7. **（新加）How much are Suzhou garden tickets?**
   On the Suzhou Gardens Bureau's price list, the Humble Administrator's Garden is ¥80 in April, May and July–October and ¥70 the rest of the year. The Lingering Garden is ¥55 / ¥45, Tiger Hill ¥70 / ¥60, and the Lion Grove and Master of the Nets gardens ¥40 / ¥30. Suzhou Museum is free.

### Official or primary sources to verify（整体替换成这 10 条）

1. UNESCO: Classical Gardens of Suzhou: https://whc.unesco.org/en/list/813/
2. Suzhou Landscape and Greening Bureau: ticket prices (July 2024): https://ylj.suzhou.gov.cn/szsylj/mpjg/wztt.shtml
3. China Bound (China Daily): Classical gardens of Suzhou, with hours and prices (December 2025): https://www.chinabound.cn/s/202512/22/WS6944c3fa498e36855033905c/classical-gardens-suzhou-humble-administrators-garden-huqiu-mountain-lingering-garden.html
4. China Bound (China Daily): How to experience the Humble Administrator's Garden, with booking and metro (April 2026): https://www.chinabound.cn/s/202604/17/WS69e20a33498e36855033bfcb/a-poets-garden-in-motion-how-to-experience-the-humble-administrators-garden-like-a-local.html
5. China Bound (China Daily): A visitor's guide to Suzhou Museum (April 2026): https://www.chinabound.cn/s/202604/17/WS69e2079e498e23165e06edc1/a-visitors-guide-to-suzhou-museum.html
6. Suzhou Museum: visitor guide: https://www.szmuseum.com/News/Index/OpenGuide
7. Suzhou government (苏州发布): Suzhou Museum notice, with Monday closing and Suzhou Museum West (June 2026): https://m.thepaper.cn/newsDetail_forward_33471958
8. Suzhou news centre: Suzhou gardens and foreign visitors, with passport booking and Trip.com (July 2024): https://news.2500sz.com/doc/2024/07/24/1096481.shtml
9. Xinhua: Humble Administrator's Garden fully booked over May Day (April 2025): http://csj.news.cn/20250429/f6432b0ae84b4bf9b4f28b75104afb61/c.html
10. China Railway 12306 (English): https://www.12306.cn/en/

删掉：苏州市政府英文网 2016 年拙政园、留园那两条，苏州市政府英文门户首页那一条。

---

## 5. 旧版内容怎么处理

- **保留**：8 个锚点 id（新加 tickets）；三天的结构和大部分句子；Day 3 选项表；车站、住宿、调整路线的建议；FAQ 的 6 个问题和其中 5 个回答；指向南京行程页的那条链接
- **去掉**："Avoid quoting an old ticket price or opening time as current"那句（这次就是要写具体的）；"Check foreign-passport check-in and late-arrival arrangements directly with the property"（换成 Guests Accepted 那句）；Sources 里 2016 年的 3 条

---

## 6. 内链：3 个页面各加一句指向本页

本页正文入链现在 0 个。用 sectionNotes 那种方式各加一句，其他文案不动；这 3 页的 lastmod 和 "Last reviewed" 不动（只加一条链接不算内容更新）。放在讲周边城市、一日游或去下一站的段落末尾；找不到就放在 Quick answer 后面。

| 页面 | 加的句子 |
|---|---|
| /3-day-shanghai-itinerary/ | If you add Suzhou, see my [3-day Suzhou itinerary](/3-day-suzhou-itinerary/), with garden tickets and booking rules for 2026. |
| /3-day-hangzhou-itinerary/ | If you add Suzhou, see my [3-day Suzhou itinerary](/3-day-suzhou-itinerary/), with garden tickets and booking rules for 2026. |
| /3-day-nanjing-itinerary/ | If you add Suzhou, see my [3-day Suzhou itinerary](/3-day-suzhou-itinerary/), with garden tickets and booking rules for 2026. |

---

## 7. 站外：Facebook 群回答模板（有人问苏州怎么玩、园林要不要预约时用）

> Suzhou tips, checked against official sources in October 2026: book the Humble Administrator's Garden (¥70 Nov–Mar, ¥80 most other months) on the WeChat account 苏州园林旅游 with your passport, 1 to 7 days ahead, because there are no tickets on site. Go at 7:30 when it opens. Suzhou Museum is a short walk away, free, but book a slot (they open 7 days ahead at 8:00) and don't go on a Monday. Make sure you book the main museum, not Suzhou Museum West. Full 3-day plan: [link]

---

## 8. 给 Claude Code 的指令

旧版内容已经导出看过（docs/seo/export/3-day-suzhou-itinerary-old.md），这次不用再停下确认。

```
先运行 pwd，确认当前目录是 ~/ChinaTravel-AI-Buddy。不是的话立刻停下，什么都不要改，告诉我。

是的话：git pull origin main。确认 docs/seo/suzhou-spec.md 在，找不到就停下告诉我。

1. 先只读检查：/3-day-suzhou-itinerary/ 用到的文件，最近有没有别人改过；有没有还没合进 main 的分支、worktree 或 stash 在改这一页。有的话停下告诉我
2. 按 suzhou-spec.md 第 4 节重写 /3-day-suzhou-itinerary/：正文的结构、顺序和英文文案都按第 4 节，直接用，不要改写、不要扩写。H1 不变。锚点 id 按第 4 节：quick-answer、three-days-at-a-glance、tickets、day-1-gardens-museum-and-pingjiang-road、day-2-lingering-garden-and-the-western-old-city、day-3-choose-one-sensible-extension、where-to-stay-and-how-to-arrive-from-shanghai、bookings-crowds-and-weather、how-to-adapt-the-route。表格做成正常的 HTML 表格。页面模板自带的 Get my personalised Suzhou itinerary、免责声明、LinBox、两组 Related guides 保留。如果这页还是旧的页面格式，换成和其他改版页一样的格式，浏览器版和静态预渲染版都从同一份数据出来。FAQ 结构化数据同步更新
3. 按第 6 节在 3 个页面各加一句内链。已经有正文链接指向本页的就跳过，告诉我。这 3 页 lastmod 和 "Last reviewed" 不动
4. 本页 lastmod 和 "Last reviewed" 改成今天；其他页面不动
5. 跑项目自带的 SEO 检查和测试；检查脚本里加这一页的规则：9 个锚点都在，Sources 里有第 4 节列的 10 条链接，正文不能再出现 "Avoid quoting an old ticket price"

验收：合回 main 并部署，然后用带 ?cb=随机数 的网址检查正式站：
- 本页返回 200，title、meta description、署名行和第 4 节一致，H1 没变
- 9 个锚点都在；#tickets 的表格 5 行都在
- FAQ 是 7 个，结构化数据和页面一致；10 条来源链接都在
- 本页正文里的站内链接全部返回 200（#check-before-booking 这个锚点在酒店页上存在）；第 3 步新加的 3 条链接也返回 200
- 全站没有内部链接指向被 301 的网址
- 用 scripts/indexnow.mjs 推送本页和第 3 步改过的 3 页，写上返回的状态码

最后把第 1 步的结果和验收结果一起贴给我。
```
