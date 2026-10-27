# 北京 3 天行程页改版：/3-day-beijing-itinerary/（官方来源 + 已实测的价格）

> **页面**：https://chinaeasebuddy.com/3-day-beijing-itinerary/（网址不改）
> **日期**：2026-10-27
> **做法**：整页重写（旧版 10-27 已导出看过）。行程结构和 11 个锚点保留，新加一节门票总表；把"去官方查"的地方换成具体的票价、开放时间和放票时间（北京市政府英文网、Visit Beijing、China Bound），酒店和高铁价格用预算页、酒店页已经实测过的。不用截图
>
> **你要做的（1 分钟）**
> 1. 下载 beijing-spec.md，用访达拖进 `ChinaTravel-AI-Buddy/docs/seo/`
> 2. 把第 8 节的指令粘给 Claude Code
> 3. 上线后：GSC 请求编入索引（Bing 由 IndexNow 自动推送）

---

## 1. 为什么改、改成什么

**数据**（GSC 过去 3 个月，截至 10-23）：22 次展示，平均排名 21.8。北京是第一次来中国的人搜得最多的城市，这页往前排对 11-20 的展示量最有用；也最对口付费的 Trip Plan（第一条真实询盘就是北京 4 人）。

**旧版的问题**（10-27 导出看过）：
- 一个价格都没有：故宫、长城、天坛、景山的门票都没写
- 故宫晚上 8 点放票、周一闭馆、午门进这些写了，但天坛、长城、景山还是"去官方查"
- 住宿只说"王府井、前门不错"，没有任何价格；交通没写地铁票价
- 署名行没有日期；正文入链 2 个

**这次改成**：
1. 新加一节「Tickets, prices and booking times」：故宫、景山、天坛、八达岭、慕田峪的官方票价和订票方法放进一张表，加开放时间和周一闭馆
2. 三天行程每天写上具体票价、放票时间、入口和末次入场时间
3. 住宿写上王府井的实测房价（10-25 携程、10-26 Trip.com），链到酒店页的 Guests Accepted 检查方法
4. 交通写上北京地铁票价和刷外国卡进站；北京—上海高铁二等座 ¥553-667
5. 补 2 条正文入链（长城一日游页、北京机场页）

---

## 2. 已核实的事实

| 事实 | 来源 |
|---|---|
| 故宫：4 月 1 日至 10 月 31 日 ¥60，11 月 1 日至 3 月 31 日 ¥40；珍宝馆、钟表馆各 ¥10；不卖当天票；官方小程序和官网买；8:30 开始入场，末次入场旺季 16:10、淡季 15:30；周一闭馆（法定节假日除外） | 北京市政府英文网（2024-07-19） |
| 故宫开售时间：参观日前 7 天的 20:00；外国人用护照预约和入园；从午门进，带预约用的证件原件；参观前一天 24:00 前退票不算违约 | 北京市政府英文网（2023-06-29 新规，6 月 30 日起） |
| 故宫 20:00 放票、国博 17:00 放票 | China Bound（2025-12-18） |
| 外国游客网上预约要填护照号；参观路线从南边午门到北边神武门 | Visit Beijing（北京市文旅局官网） |
| 景山公园：¥2（有展览时 ¥10）；4-10 月 6:00-21:00（20:30 停止入园），11-3 月 6:30-20:00（19:30 停止入园）；"畅游公园"公众号最多提前 7 天预约，也可以在门口买；护照 | 北京市政府英文网（2024-07-19） |
| 天坛：旺季联票 ¥34（含公园门票和祈年殿、回音壁、圜丘三处），旺季公园门票 ¥15；公园 6:00-22:00（21:00 停止入园）；三处景点 8:00-18:00、周二至周日（17:30 停止入场），周一关闭（法定节假日除外）；实名分时预约提前 1-7 天，外国游客在"天坛"公众号订、凭电子票和证件入园；门口扫码可买当天票（有余量时） | 北京市政府英文网（2024-07-19） |
| 天坛 18 岁以下凭有效证件免费 | 北京市政府英文网 12345 问答（2026-03-24） |
| 八达岭：旺季（4 月 1 日至 10 月 31 日）¥40，淡季（11 月 1 日至 3 月 31 日）¥35；旺季 6:30-16:30，淡季 7:30-16:00；不用预约，现场买票 | 北京市政府英文网（2024-07-17） |
| 慕田峪：成人 ¥45；摆渡车、缆车或滑道另外收费 | 北京市政府英文网（2024-07-17）；慕田峪官网游客须知（预算页已核实） |
| 国家博物馆：免费，实名预约，最多提前 7 天 | 北京市政府英文网（2026-07-24，预算页已核实） |
| 北京地铁：6 公里内 ¥3，6-12 公里 ¥4，12-22 公里 ¥5，22-32 公里 ¥6，之后每 20 公里加 ¥1；首都机场线 ¥25；闸机可以刷外国 Visa、Mastercard 等 | 北京市政府英文网（2025-04-23）；支付宝地铁页 |
| 王府井房价（11 月 4 日一晚）：携程 10-25 查到速 8 精选 ¥255；Trip.com 10-26 查到 Lavande CNY 600、含税费 CNY 636 | 实测（预算页、酒店页） |
| 北京宾馆不主动提供牙刷、梳子、剃须刀等一次性用品 | 携程页面上的北京城市通知（实测 10-26） |
| 北京南—上海二等座 ¥553-667，4 小时 41 分至 6 小时 5 分（12306，11 月 4 日，10-25 查） | 实测（预算页） |

---

## 3. 没核实到的事（页面上一律不写）

- 天坛淡季的票价（官方页面只列了旺季价）；官方页面上一条 "Admission Ticket (Passport/Foreign Permanent Resident ID Card) CNY 20" 看不懂是什么票，不写
- 慕田峪的开放时间、要不要预约、摆渡车和缆车具体多少钱
- 国家博物馆周几闭馆、具体位置
- 颐和园的票价和时间（这次只当第四天的备选，不写细节）
- 故宫的官方订票页有没有英文界面

---

## 4. 定稿文案

**正文整页按本节重写**：结构、顺序和英文文案都按本节，文案已经定稿，直接用，不要改写、不要扩写。页面模板自带的 Get my personalised Beijing itinerary、免责声明、LinBox、两组 Related guides 保留。H1 不变。

### Title（53 字符）

```
3-Day Beijing Itinerary (2026): Prices & When to Book
```

### Meta description（154 字符）

```
Three days in Beijing with official prices: Forbidden City ¥40–60 (on sale 8 pm, 7 days ahead), Mutianyu Great Wall ¥45, Temple of Heaven ¥34, metro ¥3–6.
```

### 署名行

```
Maintained by Lin · Prices and booking rules checked against official sources, October 2026 · Hotel prices checked in the Trip.com and Ctrip apps
```

"Last reviewed" 改成今天。

### Quick answer（id="quick-answer"）

> For three full days in Beijing:
>
> - **Day 1:** the Forbidden City (Palace Museum), then the view from Jingshan Park.
> - **Day 2:** one section of the Great Wall, such as Mutianyu or Badaling.
> - **Day 3:** the Temple of Heaven, then Qianmen, Dashilan or a hutong area.
>
> Book the Forbidden City first. Tickets go on sale at 20:00 Beijing time, 7 days before your visit, and there are no same-day tickets. It's ¥60 from April to October and ¥40 from November to March, and it's closed on Mondays. Count your arrival and departure days separately.
>
> [Tickets, prices and booking times](#tickets)

### H2：Three days in Beijing at a glance（id="three-days-in-beijing-at-a-glance"）

> | Day | Morning / main visit | Later in the day |
> |---|---|---|
> | Day 1 | The Forbidden City, entering by the Meridian Gate | Jingshan Park, then dinner near your hotel |
> | Day 2 | One Great Wall section, with transport planned both ways | Back in Beijing; keep the evening free |
> | Day 3 | The Temple of Heaven (not on a Monday) | Qianmen and Dashilan, or a hutong area if you have the energy |
>
> - This means three full sightseeing days, plus your arrival and departure.
> - Fix the Forbidden City date first, and keep a separate day for the Great Wall. If your dates include a Monday, use the order below.
> - Save the Summer Palace for a fourth day rather than adding it after the Temple of Heaven and the hutongs.
>
> - [Beijing airport transfer: PEK or PKX](/beijing-airport-to-city-guide/): check your airport and how you'll get into town before counting your arrival day as a sightseeing day.

### H2：Tickets, prices and booking times（id="tickets"，新加）

> Official adult prices and booking rules, checked in October 2026.
>
> | Sight | Adult ticket | How to book |
> |---|---|---|
> | Forbidden City (Palace Museum) | ¥60 April–October, ¥40 November–March; Treasure Gallery and Gallery of Clocks ¥10 each | Official website or WeChat mini program, with your passport. On sale at 20:00, 7 days before; no same-day tickets |
> | Jingshan Park | ¥2 (¥10 during exhibitions) | WeChat account "Visiting Beijing Parks" up to 7 days ahead, or at the gate |
> | Temple of Heaven | Combined ticket ¥34 in high season: the park plus the Hall of Prayer for Good Harvests, the Echo Wall and the Circular Mound Altar. Park only: ¥15 | WeChat account "Temple of Heaven", 1 to 7 days ahead, with your passport. Same-day tickets at the gate if there's space |
> | Badaling Great Wall | ¥40 April–October, ¥35 November–March | No booking needed; buy on site |
> | Mutianyu Great Wall | ¥45; the shuttle bus and the cable car or toboggan cost extra | See the [Great Wall day-trip guide](/great-wall-of-china-day-trip-from-beijing/) |
>
> **Closed on Mondays** (except public holidays): the Forbidden City, and the Temple of Heaven's three ticketed sights. The Temple of Heaven park stays open.
>
> **Opening hours.** The Forbidden City opens at 8:30; last entry is 16:10 from April to October and 15:30 from November to March. The Temple of Heaven's ticketed sights are open 8:00–18:00 (last entry 17:30), and the park 6:00–22:00. Badaling is open 6:30–16:30 from April to October and 7:30–16:00 from November to March. Jingshan Park is open from early morning to 20:00 or 21:00, depending on the season.
>
> **Free:** the National Museum of China (book a real-name slot up to 7 days ahead; slots are released at 17:00). Under-18s get into the Temple of Heaven free with a valid ID.

### H2：If your three days include a Monday（id="if-your-three-days-include-a-monday"）

> | Monday–Wednesday example | Suggested block | Check before committing |
> |---|---|---|
> | Monday | Great Wall day | The section is open, the weather is safe, and you have transport back |
> | Tuesday | Forbidden City and Jingshan Park | A ticket for this date, booked at 20:00 seven days before |
> | Wednesday | Temple of Heaven, then Qianmen | A combined ticket for the three ticketed sights |
>
> - The Forbidden City closes on Mondays except national holidays. The Temple of Heaven's three ticketed sights close on Mondays too (except public holidays), but the park itself stays open.
> - This is a planning example, not a promise that tickets will be available. If the Great Wall is closed or the weather is bad, swap in a city day and rebuild the order around your bookings.

### H2：Day 1: Beijing imperial centre（id="day-1-beijing-imperial-centre"）

> 1. Book the Forbidden City at 20:00 Beijing time, 7 days before your visit, on the Palace Museum's official website or WeChat mini program. Book with your passport; you'll need the original at the gate. Add the Treasure Gallery or the Gallery of Clocks (¥10 each) if you want them.
> 2. Enter through the Meridian Gate (午门), the south gate, and walk north through the palace. Go in the morning: last entry is 16:10 from April to October and 15:30 from November to March.
> 3. After you leave by the north gate, walk up Jingshan Park (景山, ¥2) for the view over the Forbidden City.
> 4. Each place around Tiananmen has its own access and ID rules. A Forbidden City ticket doesn't cover the others.
> 5. Keep the evening light: dinner near your hotel or a short walk around Wangfujing.

### H2：Day 2: Great Wall day trip（id="day-2-great-wall-day-trip"）

> - Choose one section. **Mutianyu** is ¥45, and the shuttle bus and the cable car or toboggan cost extra. **Badaling** is ¥40 (¥35 from November to March), needs no booking, and is open 6:30–16:30 from April to October and 7:30–16:00 from November to March.
> - Price and confirm the whole journey, there and back. A train station, bus stop or scenic-area entrance is only one part of the trip.
> - Save the pickup point or station name in Chinese, the last return connection and a backup plan. Keep the evening free in case of delays.
>
> - [Plan the Great Wall train or bus journey](/great-wall-of-china-day-trip-from-beijing/): Badaling station choices, Mutianyu bus connections and return checks.

### H2：Day 3: Temple of Heaven, Qianmen and local Beijing（id="day-3-temple-of-heaven-qianmen-and-local-beijing"）

> 1. Get the combined ticket (¥34 in high season), which covers the park and its three ticketed sights: the Hall of Prayer for Good Harvests, the Echo Wall and the Circular Mound Altar. Book 1 to 7 days ahead on the "Temple of Heaven" WeChat account with your passport, or scan the code at the gate for a same-day ticket if there's space. The ticketed sights are open 8:00–18:00 and closed on Mondays, except public holidays.
> 2. Then take the metro or a taxi to Qianmen (前门) and Dashilan (大栅栏) for food and a shorter walk.
> 3. If hutongs are your priority, pick the Shichahai (什刹海) area instead of adding it on top of every stop. Save the Chinese place name and check the route in your map app.
> 4. Keep the Summer Palace for a fourth day. If you leave early the next morning, spend the last evening near your hotel.

### H2：Book these before the trip（id="book-these-before-the-trip"）

> | Item | What to book or check | When |
> |---|---|---|
> | Forbidden City | A ticket in your passport name; entry by the Meridian Gate | 20:00 Beijing time, 7 days before your visit |
> | Temple of Heaven | The combined ticket on the "Temple of Heaven" WeChat account | 1 to 7 days ahead |
> | Great Wall | Section, transport both ways, shuttle and cable car, last return, weather | Before you go; check again the day before |
> | Hotel | The "Guests Accepted" line on Trip.com, the address in Chinese, the nearest metro station | Before you pay |
> | Onward train | Station, passport name, departure time | On 12306; tickets go on sale 15 days before departure |
>
> - Spell your name exactly as in your passport. A nickname, a missing middle name or a wrong passport number can cause problems at the gate.
> - If your plans change, Forbidden City tickets can be refunded without penalty until midnight the day before your visit.
> - Prices and booking rules on this page were checked against official sources in October 2026. Check again for your dates: a release time doesn't guarantee a ticket.

### H2：Where to stay for a three-day visit（id="where-to-stay-for-a-three-day-visit"）

> - Choose a hotel for getting around, not the lowest price in the city. A useful metro line saves more time than being next to one sight.
> - Wangfujing and the central east side suit most first-time visitors: close to the Forbidden City, restaurants and transport. For the night of November 4, 2026, a budget chain on Wangfujing was ¥255 on Ctrip, and a Lavande hotel there was CNY 600 on Trip.com, or CNY 636 with taxes and fees. [All the prices I checked](/china-travel-budget/#real-prices)
> - Qianmen suits travelers focused on the historic centre and the Temple of Heaven.
> - Before you book, read the hotel's "Guests Accepted" line on Trip.com ([how I checked](/china-hotels-for-foreigners/#check-before-booking)), and save its name and address in Chinese.
> - Beijing hotels don't put out toothbrushes, combs or razors unless you ask, so pack your own.

### H2：Transport and daily pace（id="transport-and-daily-pace"）

> - **Metro:** fares go by distance: ¥3 for up to 6 km, ¥4 for 6–12 km, ¥5 for 12–22 km and ¥6 for 22–32 km. The Capital Airport Express is ¥25. You don't need an app: [tap your Visa or Mastercard at the metro gate](/alipay-metro-qr-transport-code-guide/#card).
> - Allow time for security checks, long corridors, transfers and finding the right exit.
> - Use taxis or DiDi for awkward connections, late returns or limited mobility. Save the destination in Chinese and check the plate before you get in. [Book a DiDi in English](/didi-in-china-for-foreigners/#book)
> - Beijing's sights are big: even two nearby ones can mean a lot of walking. Keep one flexible block each day.

### H2：Adjust the itinerary for your trip（id="adjust-the-itinerary-for-your-trip"）

> | Situation | Best adjustment |
> |---|---|
> | Only two full days | Keep the Forbidden City and the Great Wall; drop Day 3 rather than squeezing all three |
> | Four full days | Add the Summer Palace, the National Museum or a slower neighbourhood day |
> | Bad Great Wall weather | Swap Days 2 and 3 if your bookings allow; never ignore closure or safety notices |
> | Travelling with children | Shorter museum time, proper meal breaks and an easier Great Wall route |
> | Limited mobility | Fewer stops a day, check step-free access, and budget for taxis |
> | Monday or a closure | Use the Monday order above and check each venue's calendar before changing a booking |
>
> - If Beijing is part of a longer trip, plan it with the 7-, 10- or 14-day routes rather than city by city. If you're also visiting Nanjing, see my [3-day Nanjing itinerary](/3-day-nanjing-itinerary/).
> - Beijing to Shanghai by high-speed train: second class was ¥553–667 on 12306 for November 4, 2026, taking 4 h 41 min to 6 h 5 min. [How to book China trains](/china-train-travel-guide/)
>
> - [Calculate a China travel budget for your trip](/china-travel-budget/#cost-estimator): set your travel days and group size, then add actual intercity and flight costs separately.

### FAQ（9 个，结构化数据同步；旧版 8 个问题保留顺序，第 3、4、7 个换答案，最后加第 9 个）

1. **Are three days enough for Beijing?**（回答不动）
2. **How should I plan three days in Beijing including a Monday?**（回答不动）
3. **Which Great Wall section is best for a first visit?**
   Choose by transport, walking ability, season and crowds. Badaling is ¥40 (¥35 from November to March), needs no booking and has an official website. Mutianyu is ¥45, and the shuttle bus and the cable car or toboggan cost extra.
4. **Do I need to book the Palace Museum in advance?**
   Yes. Tickets go on sale at 20:00 Beijing time, 7 days before your visit, on the official website or WeChat mini program, and there are no same-day tickets. Book with your passport and bring the original to the Meridian Gate. It's closed on Mondays except national holidays.
5. **Can I visit the Forbidden City and Great Wall on the same day?**（回答不动）
6. **Where should a first-time visitor stay in Beijing?**（回答不动）
7. **How should I get around Beijing?**
   Use the metro for longer trips: rides of up to 32 km cost ¥3–6, and you can tap a contactless Visa or Mastercard at the gate. Use taxis or DiDi for awkward connections. Save addresses in Chinese and allow time for security checks.
8. **Can ChinaEase Buddy personalise this Beijing itinerary?**（回答不动）
9. **（新加）How much do Beijing's main sights cost?**
   Official adult prices: the Forbidden City is ¥60 from April to October and ¥40 from November to March; the Temple of Heaven combined ticket is ¥34 in high season; Jingshan Park is ¥2; Badaling is ¥40 (¥35 in winter); Mutianyu is ¥45, plus the shuttle bus and cable car. The National Museum of China is free.

### Official or primary sources to verify（整体替换成这 15 条）

1. The Palace Museum official international website: https://intl.dpm.org.cn/index.html
2. Palace Museum official ticket service: https://bookingticket.dpm.org.cn/
3. Palace Museum: official ticket and admission instructions: https://young.dpm.org.cn/en/category/279
4. Beijing government: The Palace Museum, tickets and hours (July 2024): https://english.beijing.gov.cn/specials/ticketing/museums/202407/t20240719_3752962.html
5. Beijing government: New guidelines for visiting the Palace Museum (June 2023): https://english.beijing.gov.cn/latest/news/202306/t20230629_3150036.html
6. Visit Beijing: The Palace Museum: https://english.visitbeijing.com.cn/special/35211decffa0df13234b0ec0b6eaa70b/a09086a79d9ad908daa236f25a5ed16b
7. China Bound (China Daily): museum tickets and release times (December 2025): https://govt.chinadaily.com.cn/s/202512/18/WS6943b94f498e23165e06be0e/tickets-attractions.html
8. Beijing government: Jingshan Park (July 2024): https://english.beijing.gov.cn/specials/ticketing/parks/202407/t20240719_3753324.html
9. Beijing government: Temple of Heaven, tickets and hours (July 2024): https://english.beijing.gov.cn/specials/ticketing/parks/202407/t20240719_3753312.html
10. Beijing government: Temple of Heaven park and charged attractions (March 2026): https://english.beijing.gov.cn/travellinginbeijing/parks/202603/t20260320_4562532.html
11. Beijing government: Badaling Great Wall (July 2024): https://english.beijing.gov.cn/specials/ticketing/attractions/202407/t20240717_3751609.html
12. Beijing government: Mutianyu Great Wall (July 2024): https://english.beijing.gov.cn/specials/ticketing/attractions/202407/t20240717_3751593.html
13. Badaling Great Wall official website: https://www.badaling.cn/website/pc/index.html
14. Beijing government: About Subway Fares (April 2025): https://english.beijing.gov.cn/specials/beijinglifeonthesubway/noticeforpassengers/202504/t20250423_4072294.html
15. China Railway 12306 English website: https://www.12306.cn/en/index.html

删掉：北京市政府英文网首页那一条（太泛）。

---

## 5. 旧版内容怎么处理

- **保留**：11 个锚点 id（新加 tickets）；三天的结构、周一方案的表、调整行程的表；故宫 20:00 放票、不卖当天票、午门进、带护照原件（已按北京市政府 2023 年新规核实）；指向机场页、长城一日游页、地铁刷卡、滴滴、预算计算器的链接；FAQ 的 8 个问题和其中 5 个回答
- **改写得更具体**：每一天的步骤、"出发前要订的"表、住宿、交通
- **去掉**："Booking and closure details in this update were checked on October 22, 2026"（换成新的核对说明）；Sources 里北京市政府英文网首页

---

## 6. 内链：2 个页面各加一句指向本页

本页正文入链现在 2 个（7 天、10 天行程页）。用 sectionNotes 那种方式各加一句，其他文案不动；这 2 页的 lastmod 和 "Last reviewed" 不动（只加一条链接不算内容更新）。已经有正文链接指向本页的就跳过，告诉我。

| 页面 | 放在哪 | 加的句子 |
|---|---|---|
| /great-wall-of-china-day-trip-from-beijing/ | 讲规划或回程的段落末尾；找不到就放在 Quick answer 后面 | For the rest of your time in Beijing, see my [3-day Beijing itinerary](/3-day-beijing-itinerary/), with Forbidden City booking times and prices. |
| /beijing-airport-to-city-guide/ | 文末，或讲到达市区以后的段落末尾 | Once you're in the city, see my [3-day Beijing itinerary](/3-day-beijing-itinerary/), with Forbidden City booking times and prices. |

本页正文里新加了指向 /3-day-nanjing-itinerary/ 的一条链接（调整行程那一节）。

---

## 7. 站外：Facebook 群回答模板（有人问北京 3 天怎么排、故宫怎么订时用）

> For a first trip: Day 1 Forbidden City + Jingshan Park (¥2, best view of the palace), Day 2 one Great Wall section (Mutianyu ¥45 plus shuttle and cable car, or Badaling ¥40, no booking), Day 3 Temple of Heaven (combined ticket ¥34) + Qianmen. The key one: Forbidden City tickets go on sale at 8 pm Beijing time, exactly 7 days before your visit, no same-day tickets, and it's closed on Mondays. Book with your passport and bring the original. Full plan with official prices: [link]

---

## 8. 给 Claude Code 的指令

旧版内容已经导出看过（docs/seo/export/3-day-beijing-itinerary-old.md），这次不用再停下确认。

```
先运行 pwd，确认当前目录是 ~/ChinaTravel-AI-Buddy。不是的话立刻停下，什么都不要改，告诉我。

是的话：git pull origin main。确认 docs/seo/beijing-spec.md 在，找不到就停下告诉我。

1. 先只读检查：/3-day-beijing-itinerary/ 用到的文件，最近有没有别人改过；有没有还没合进 main 的分支、worktree 或 stash 在改这一页。有的话停下告诉我
2. 按 beijing-spec.md 第 4 节重写 /3-day-beijing-itinerary/：正文的结构、顺序和英文文案都按第 4 节，直接用，不要改写、不要扩写。H1 不变。锚点 id 按第 4 节：quick-answer、three-days-in-beijing-at-a-glance、tickets、if-your-three-days-include-a-monday、day-1-beijing-imperial-centre、day-2-great-wall-day-trip、day-3-temple-of-heaven-qianmen-and-local-beijing、book-these-before-the-trip、where-to-stay-for-a-three-day-visit、transport-and-daily-pace、adjust-the-itinerary-for-your-trip。表格做成正常的 HTML 表格。页面模板自带的 Get my personalised Beijing itinerary、免责声明、LinBox、两组 Related guides 保留。如果这页还是旧的页面格式，换成和其他改版页一样的格式，浏览器版和静态预渲染版都从同一份数据出来。FAQ 结构化数据同步更新
3. 按第 6 节在 2 个页面各加一句内链。已经有正文链接指向本页的就跳过，告诉我。这 2 页 lastmod 和 "Last reviewed" 不动
4. 本页 lastmod 和 "Last reviewed" 改成今天；其他页面不动
5. 跑项目自带的 SEO 检查和测试；检查脚本里加这一页的规则：11 个锚点都在，Sources 里有第 4 节列的 15 条链接，正文不能再出现 "checked on October 22, 2026"

验收：合回 main 并部署，然后用带 ?cb=随机数 的网址检查正式站：
- 本页返回 200，title、meta description、署名行和第 4 节一致，H1 没变
- 11 个锚点都在；#tickets 的表格 5 行都在
- FAQ 是 9 个，结构化数据和页面一致；15 条来源链接都在
- 本页正文里的站内链接全部返回 200（#check-before-booking、#real-prices、#card、#book、#cost-estimator 这些锚点在对应页面上存在）；第 3 步新加的 2 条链接也返回 200
- 全站没有内部链接指向被 301 的网址
- 用 scripts/indexnow.mjs 推送本页和第 3 步改过的 2 页，写上返回的状态码

最后把第 1 步的结果和验收结果一起贴给我。
```
