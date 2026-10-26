# 酒店页加一节实测：/china-hotels-for-foreigners/

> **页面**：https://chinaeasebuddy.com/china-hotels-for-foreigners/（网址不改）
> **日期**：2026-10-26
> **做法**：不整页重写。加一节实测（10-26 晚在 Trip.com 英文版和携程上查，查到预订表那一步，没付款），改 title、meta、署名行，Quick answer 末尾加一句，FAQ 加 2 个。其他节一律不动
>
> **你要做的**
> 1. **粘指令前花 1 分钟确认一件事**：Trip.com 用同样的搜索（王府井，11 月 4 日）→ Filters，把 Property facilities & services、Property Features、Room facilities & services 下面的 **Show more** 都点开，看有没有 Foreign guests / International guests / Overseas 之类的选项
>    - **没有** → 直接做第 2 步
>    - **有** → 截图发给 Claude，先别粘指令（第 4 节第 2 步的说法要改）
> 2. 下载 hotels-update.zip，用访达拖进 `ChinaTravel-AI-Buddy/docs/seo/`。等 Claude Code 上一条（IndexNow）报告完，再把第 7 节的指令粘过去
> 3. 上线后：GSC 明天和另外 6 个一起交（共 7 个）；Bing 看报告里 IndexNow 推送成功没有，没成功就手动交

---

## 1. 为什么改、改成什么

**数据**（GSC 过去 3 个月，截至 10-23）：52 次展示，平均排名 17.04，0 点击。

**旧版**：已经很全（15 节、11 个 FAQ、有官方来源，包括 2024 年"酒店不得以没有涉外资质为由拒绝外国客人"的通知）。缺的是两样：一是"订之前怎么确认这一家收不收外国人"的具体做法，二是任何亲手查过的东西。

**竞品**（10-26 查）：
- wanderinchina.com 的 Trip.com 指南（2026-02-11）：说 Trip.com 有 "Foreign Guests Accepted" 筛选（在 Facilities 里）、酒店上有这个标签、预订时要填护照信息；还写着没有执照的酒店会拒绝你（这和 2024 年 5 月的通知不符）
- gkomunika.com（2026-04-18）：说 Ctrip/Trip.com 高级搜索里有 "accepts overseas travelers" 筛选，把两个 App 当成一个；没有截图，没提 2024 年的通知
- fabionodariphoto.com（2026-09-19）：只说 Trip.com 和携程"每家酒店有个小标签"，没写在哪、怎么看；没有截图，没提 2024 年的通知

三家都没写清楚具体在哪一页、哪一行看。

**这次加的**：
1. 新的一节「How to check whether a hotel accepts foreigners」，5 步，按你实际操作的顺序：搜索结果（价格不含税）→ 筛选（没找到外宾筛选）→ Policies 里的 Guests Accepted → 预订表（没要护照号）→ 携程的"外宾适用"筛选和"可接待人群"
2. 写明你是在国内用的（预订表默认 +86），外国手机上看到的界面可能不一样。竞品说有筛选、要填护照，你这边没看到，这句话两种情况都说得通
3. 携程页面上顺带看到的北京城市通知：2020 年 5 月 1 日起宾馆不主动提供牙刷、梳子等一次性用品

---

## 2. 实测数据（10-26 晚 20:34-20:40，北京王府井，11 月 4 日住一晚）

**Trip.com 英文版**

| 看了什么 | 看到的 |
|---|---|
| 搜索结果 | 1,714 家。第一家 Lavande Hotel（天安门广场王府井大街店，标了 Ad）：CNY 600（原价 813 划掉），含税费总价 CNY 636；第二家 Yitel，9.5 分，7,698 条评价 |
| 筛选面板 | 没有和外国客人有关的分组或选项（Show more 要你粘指令前确认，见上面第 1 步）。最接近的是 English-speaking staff（400+ 家）。付款类有 Pay at Hotel、Book without credit card。预算筛选写的是 "Price per room per night (excl. taxes & fees)" |
| Yitel 的 Policies | Guests Accepted："Guests from all countries/regions are welcome at this property"；入住 14:00 后、退房 12:00 前；前台 24 小时；主入住人至少 18 岁；页面价 CNY 471（原价 488） |
| Yitel 的预订表 | Guest info 只要 First name、Last name、Email、Mobile（默认 +86）；没要护照号；Prepay Online CNY 499.00；"Rest easy with free cancellation" |

**携程**

| 看了什么 | 看到的 |
|---|---|
| 筛选 | 左边"点评"那一栏往下，"适用人群"里有：外宾适用、台湾客人适用、香港客人适用、澳门客人适用 |
| 某家王府井附近酒店的"酒店政策" | 可接待人群：接待来自任何国家/地区的客人；入住 14:00 后、退房 12:00 前；不提供早餐；¥326 起 |
| 同一页的"城市通知" | 根据《北京市宾馆不得主动提供的一次性用品目录》，自 2020 年 5 月 1 日起，宾馆不得主动提供牙刷、梳子、浴擦、剃须刀、指甲锉、鞋擦，需要可以向酒店索取 |

---

## 3. 没核实到的事（页面上一律不写）

- 用外国手机号、外国账号时，Trip.com 的筛选和预订表会不会不一样（你在国内用，默认 +86）
- Trip.com 英文版是不是已经把不接待外宾的酒店藏起来了（没比数量）
- 不接待外宾的酒店，Guests Accepted 那一行怎么写（这次没碰到）
- 别的酒店预订时要不要护照号（只试了 1 家）
- Lavande 图上的 "Hi China!" 标签是什么意思（没点开）
- 携程那张政策截图是哪家酒店（页面上不写店名）
- 同一家酒店在携程和 Trip.com 是不是同价（查的日期不同、税费算法不同，不比）
- 北京一次性用品：只按携程页面上的城市通知写，没另找北京官方原文
- 筛选面板最下面折叠的 8 组（Guest Impressions、Reviews、Room packages、Opening/renovation time、Room Size、Discounts、Brands、Accessibility）没展开，看名字都和外国客人无关

---

## 4. 定稿文案

**只改下面列出的地方。没列出的节、旧的 11 个 FAQ（除非和新 FAQ 重复，见本节最后）、Lin 的咨询框、Related guides 一律保留不动。**

### Title（57 字符）

```
China Hotels for Foreigners (2026): Will They Accept You?
```

### Meta description（151 字符）

```
Tested on Trip.com in October 2026: where to see if a hotel accepts foreigners, what the booking form asks, and the 2024 rule against turning you away.
```

### H1

不变。

### 署名行（整行替换）

```
Maintained by Lin · Booking steps checked in the Trip.com and Ctrip apps on October 26, 2026 · Rules checked against official sources
```

"Last reviewed" 改成今天。

### Quick answer：末尾加一句（这一节其他句子不动；没有 Quick answer 就跳过，告诉我）

> **To check one hotel:** on Trip.com, open its Policies tab and read the "Guests Accepted" line. [What I saw when I checked](#check-before-booking)

### 新加一节：放在 Quick answer 那一节后面（没有 Quick answer 就放在第一节后面）

H2：**How to check whether a hotel accepts foreigners**（id="check-before-booking"）

> On October 26, 2026, I looked for a room near Wangfujing in Beijing for the night of November 4, first in Trip.com's English app and then in Ctrip, its Chinese version. I went as far as the booking form and stopped before paying. The short version: open the hotel's **Policies** tab and read the **Guests Accepted** line.
>
> I did this from China (the booking form defaulted to a +86 phone code), so a few screens may look different on your phone.
>
> **1. The big price is before taxes.** Trip.com found 1,714 properties near Wangfujing. The big number on a listing was the price before taxes and fees, with the total in smaller print below it. The first listing, a Lavande hotel on Wangfujing Street marked "Ad", showed CNY 600 a night, or CNY 636 with taxes and fees.
>
> **2. I didn't find a filter for foreign guests.** Some guides mention a "Foreign Guests Accepted" filter on Trip.com. I went through the filter panel, including the full facilities lists, and didn't see one. The closest was "English-speaking staff" (400+ properties). There are also filters for "Pay at Hotel" and "Book without credit card".
>
> **3. The Policies tab says who the hotel accepts.** I opened Yitel (Beijing Tiananmen Wangfujing Subway Station), rated 9.5 out of 10, and scrolled to Policies. Under "Guests Accepted", it said: "Guests from all countries/regions are welcome at this property." That's the line to read before you book. The same tab said check-in was after 14:00 and the main guest had to be at least 18.
>
> **4. The booking form didn't ask for a passport number.** It asked for a first name, last name, email and mobile number. The total, prepaid online, came to CNY 499.00 with free cancellation. Enter your name exactly as it's printed in your passport: at check-in, the hotel checks your passport and has to register your stay with the local police within 24 hours ([Shanghai government, May 2024](https://english.shanghai.gov.cn/en-Latest-WhatsNew/20240529/6ff842313deb45e1b14cf5fd2a01d065.html)).
>
> [截图 1、2、3 并排]
>
> *Trip.com's English app, October 26, 2026: search results near Wangfujing, the Policies tab and the booking form. I stopped before paying.*
>
> **5. Ctrip, the Chinese app, does have a filter.** Tap 筛选 (Filter), and under 适用人群 (who it suits), tick 外宾适用 (for foreign guests). There are separate options for guests from Hong Kong, Macao and Taiwan. On a hotel's page, the 酒店政策 (hotel policy) section has a 可接待人群 (guests accepted) line; 接待来自任何国家/地区的客人 means guests from any country or region are welcome. This helps if a Chinese-speaking friend is booking for you.
>
> The same Ctrip page showed a Beijing city notice: since May 1, 2020, hotels don't put out toothbrushes, combs, razors and a few other disposables, so you have to ask for them. Pack your own toothbrush.
>
> [截图 4、5 并排]
>
> *Ctrip (Chinese app), October 26, 2026: the 外宾适用 filter and a hotel's policy section.*
>
> Since May 2024, hotels have been told not to turn away foreign guests by claiming they lack the qualifications to host them ([Shanghai government](https://english.shanghai.gov.cn/en-Latest-WhatsNew/20240529/6ff842313deb45e1b14cf5fd2a01d065.html)). Listings still carry a "Guests Accepted" line, and reading it takes ten seconds. For room prices, see [what I found on Ctrip in central Beijing and Shanghai](/china-travel-budget/#real-prices).

最后一句（For room prices…）：旧版里已经有指向 /china-travel-budget/#real-prices 的句子，就删掉这一句，不重复。

### FAQ：旧的 11 个顺序和内容不动，最后加 2 个

12. **How can I tell if a hotel in China accepts foreigners?**
    Open the hotel's Policies tab on Trip.com and read the "Guests Accepted" line. When I checked a Beijing hotel in October 2026, it said "Guests from all countries/regions are welcome at this property." My Trip.com app didn't show a filter for foreign guests; Ctrip, the Chinese version, has one called 外宾适用.

13. **Do I need my passport number to book a hotel in China?**
    Not for the hotel I tried. In October 2026, Trip.com's booking form for a Beijing hotel asked only for my name, email and mobile number. You still need your passport at check-in, because the hotel has to register your stay with the police.

FAQ 结构化数据同步更新。

### Sources：Sources 里还没有的话加上这一条（已有就不动）

Shanghai government: Hotels told not to turn away foreign guests (May 2024): https://english.shanghai.gov.cn/en-Latest-WhatsNew/20240529/6ff842313deb45e1b14cf5fd2a01d065.html

### 和旧版冲突的处理

| 旧版如果写了 | 怎么处理 |
|---|---|
| Trip.com（英文版）有"接待外国客人"之类的筛选或标签 | 整句换成：When I checked in October 2026, my Trip.com app didn't show a filter for foreign guests, so read each hotel's "Guests Accepted" line instead ([how](#check-before-booking)). |
| 在 Trip.com 预订时要填护照号 | 整句换成：Trip.com's booking form for the Beijing hotel I tried in October 2026 didn't ask for a passport number; you show your passport at check-in. |
| 有旧 FAQ 和新 FAQ 12 或 13 问的是同一件事 | 不重复加：旧问题留在原位，答案换成新答案 |
| 其他和第 2 节实测对不上的句子 | 不改，列出来告诉我 |

每一处改动都记下来（原句 → 新句），报告里给我。

---

## 5. 截图

5 张都已裁掉手机状态栏，橙色框是加的标注。表单是空的，没有个人信息，不用打码。

| 编号 | 内容 | 放在哪 | alt |
|---|---|---|---|
| 1 | Trip.com 搜索结果：1,714 家，CNY 600 / 含税 CNY 636（框出） | 第 4 步后面，1、2、3 并排 | Trip.com search results near Wangfujing, Beijing, for November 4, 2026: 1,714 properties, and a hotel at CNY 600 a night or CNY 636 with taxes and fees |
| 2 | Trip.com Policies：Guests Accepted（框出） | 同上 | Trip.com Policies tab for a hotel near Wangfujing, saying guests from all countries and regions are welcome |
| 3 | Trip.com 预订表：名、姓、邮箱、手机（框出），CNY 499.00 | 同上 | Trip.com booking form asking for first name, last name, email and mobile number, with CNY 499.00 to prepay |
| 4 | 携程筛选：适用人群 → 外宾适用（框出） | 第 5 步后面，4、5 并排 | Ctrip filter panel with the 外宾适用 (for foreign guests) option under 适用人群 |
| 5 | 携程酒店政策：可接待人群（框出），上面是北京一次性用品的城市通知 | 同上 | Ctrip hotel policy section: 可接待人群, 接待来自任何国家/地区的客人 (guests from any country or region are welcome) |

图下小字见第 4 节（两行，一行 Trip.com，一行携程）。

---

## 6. 站外：Facebook 群回答模板（有人问"酒店会不会拒绝外国人""怎么知道这家收不收外国人"时用）

> Open the hotel on Trip.com → Policies → "Guests Accepted". I checked a Wangfujing hotel in Beijing in October 2026 and it said "Guests from all countries/regions are welcome at this property." My app didn't show a filter for foreign guests, so don't rely on one. Since May 2024, hotels have been told not to turn foreign guests away for lacking "foreign-related qualifications", but checking that line takes ten seconds. Screenshots: [link]

---

## 7. 给 Claude Code 的指令

```
先运行 pwd，确认当前目录是 ~/ChinaTravel-AI-Buddy。不是的话立刻停下，什么都不要改，告诉我。

是的话：git pull origin main。确认 docs/seo/hotels-update.zip 在，解压到 docs/seo/hotels-update/，里面应该有 hotels-spec.md 和 hotels-shots/1.png 到 5.png。找不到就停下告诉我。

1. 先只读检查：/china-hotels-for-foreigners/ 用到的文件最近有没有别人改过；有没有还没合进 main 的分支、worktree 或 stash 在改这一页。有的话停下告诉我。没有的话，把这一页现在的 title、meta description、H1、署名行、所有 H2（带 id）、FAQ 问题、Sources 列表导出到 docs/seo/export/china-hotels-for-foreigners-old.md（不提交）
2. 按 hotels-spec.md 第 4 节改这一页：不是整页重写，只改第 4 节列出的地方，没列出的节和旧 FAQ 保留不动。新加的一节用 id="check-before-booking"，放在 Quick answer 那一节后面（没有 Quick answer 就放在第一节后面）。浏览器版和静态预渲染版都要改到。FAQ 结构化数据同步更新
3. 按第 4 节最后"和旧版冲突的处理"检查旧文案，每一处改动记下原句和新句
4. 截图按第 5 节放：和之前几页同一套处理，640 宽 WebP，同一行并排每张最宽 220px（手机上可以换行），写 alt、width、height，加 loading="lazy"，图下加第 4 节那两行小字。截图不要再改图；docs/seo/hotels-update/ 里的原始 PNG 不要提交进 git
5. 本页 lastmod 和 "Last reviewed" 改成今天；其他页面不动
6. 跑项目自带的 SEO 检查和测试；检查脚本里这一页的规则按新文案更新，再加一条：本页必须有 #check-before-booking，Sources 里必须有上海市政府 2024-05-29 那条链接

验收：合回 main 并部署，然后用带 ?cb=随机数 的网址检查正式站：
- 本页返回 200，title、meta description、H1、署名行和第 4 节一致
- 有 #check-before-booking，5 步都在；Quick answer 末尾有指向 #check-before-booking 的那句
- 5 张截图返回 200、有 alt
- FAQ 数量和结构化数据一致
- 全站没有内部链接指向被 301 的网址
- 如果 scripts/indexnow.mjs 已经有了，用它推送 https://chinaeasebuddy.com/china-hotels-for-foreigners/ 并写上返回的状态码；没有就跳过，说一声

最后把这些贴给我：第 1 步的检查结果；旧版的 title 和 meta；第 3 步的每一处改动（原句 → 新句）；验收结果。
```
