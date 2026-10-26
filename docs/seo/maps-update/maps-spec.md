# 地图对比页改版：/amap-vs-google-maps-china/（实测版）

> **页面**：https://chinaeasebuddy.com/amap-vs-google-maps-china/（网址不改）
> **日期**：2026-10-26
> **实测**：iPhone 14 · iOS 18.5 · Google Maps（版本号没查到，不写）· AMap Global 17.2 · 东莞 · 2026-10-26 14:46-14:50
>
> **你要做的（1 分钟）**
> 1. 下载 maps-update.zip，用访达拖进 `ChinaTravel-AI-Buddy/docs/seo/`
> 2. 把第 9 节的指令粘给 Claude Code。它先只读列出旧版有、新版没有的内容，然后停下；你把列表贴给 Claude，Claude 看完你再回它"继续"
> 3. 等它报告上线以后：GSC 和 Bing 提交这个网址

---

## 1. 为什么改、改成什么

**数据**（GSC 过去 3 个月，截至 10-23）：本页 14 次展示、平均排 9.1；10-22 并进来的 /does-google-maps-work-in-china-amap-guide/ 另有 14 次。剩下的页面里离前 5 最近。

**改成**：回答 "Does Google Maps work in China?" 这个大问题，用当天的实测截图：
1. 不开 VPN，Google Maps 打不开（地图空白，搜索一直转圈）
2. 开 VPN 能搜到广州塔（照片、4.6 分、营业时间）
3. 同一条公交路线：Google 显示"找不到路线"，Amap 给出 3 条，最快 40 分钟 ¥5
4. 卫星图上，广州塔的定位落在屋顶上，"阅江西路"的路名压在楼上，不在路上
5. 从广州塔找 Luckin Coffee：Google 给的那家在 5.7 公里外，步行 1 小时 27 分，没有公交方案；Amap 在 1 公里内列出 5 家，最近一家 345 米，有的店名显示成 "Ruixing Coffee"（瑞幸的拼音）

竞品大多只说"需要 VPN""数据不准"，没有同一条路线、同一个搜索的对比截图。

**H1 不变**（改 H1 会连带改全站 Related guides 的标签）。

---

## 2. 实测记录

| 编号 | 时间 | App | 做了什么 | 看到什么 |
|---|---|---|---|---|
| 1 | 14:46 | Google Maps | 不开 VPN，搜 Canton Tower | 地图空白，只有定位蓝点，搜索一直转圈 |
| 2 | 14:46 | Google Maps | 开 VPN，搜 Canton Tower | 搜到广州塔：照片、4.6 分（1,153 条评价）、"营业中 · 结束营业时间 22:30"。卡片上离你的距离已打码 |
| 3 | 14:47 | Google Maps | 卫星图放大 | 广州塔的定位落在屋顶和一排酒吧（LUCKY JACK、Zapatas、啤酒文化广场）旁边，下面没有塔；"阅江西路"路名压在楼顶上。底部地点卡片已裁掉 |
| 4 | 14:48 | Google Maps | 公交：Canton Tower → Guangzhou South Railway Station | "找不到路线" |
| 5 | 14:50 | Amap | 同一条公交路线 | 40 分钟 ¥5（3 号线 → 广佛线 → 2 号线）；46 分钟 ¥5（3 号线 → 7 号线）；301A 公交 1 小时 29 分 ¥3（步行 1.9 公里）；3 号线显示 "Approaching"；打车 33 分钟，¥26 起，20.6 公里 |
| 6 | 17:20 | Google Maps | 路线：广州塔 → Luckin Coffee | Google 选的那家在 5.7 公里外：步行 1 小时 27 分，开车 14 分钟，公交显示 "—"（没有方案） |
| 7 | 17:29 | Amap | 广州塔 Nearby 搜 Luckin coffee | 地址都是广州海珠、天河；1 公里内 5 家：345 米（标 Nearest）、493 米、546 米、915 米、963 米，再往外 1.1 公里、1.2 公里、1.2 公里；每家有评分；英文模式下大部分店名显示成 "Ruixing Coffee"（瑞幸咖啡的拼音），也有显示 "luckin coffee" 的 |

**不用的**：Amap 第一次搜 Luckin 那张（在路线框里搜的，结果是你家附近的东莞门店，露出了寮步的店名和离你 702 米）；Google 卫星图缩小那张（看不清错位）。

**你的手机是中文系统**，所以 Google Maps 的菜单是中文，页面图说里写明。

---

## 3. 来源

- 维基百科 Restrictions on geographic data in China：中国大陆的地图必须用加偏的坐标系（GCJ-02）；Google 的街道地图用 GCJ-02，卫星图不用，所以两者在中国大陆相差 50-500 米
- 上海市政府英文网：Amap for international visitors（2026-07）
- Amap 面向外国游客开放打车（PR Newswire，2026-08）

---

## 4. 没核实到的事（页面上一律不写）

- 用国外手机卡漫游或 eSIM 时 Google Maps 能不能用（这次只测了 VPN）
- Google Maps 能不能叫车、离线地图在中国能不能用
- Apple Maps 在中国用的是什么数据
- 广州塔在卫星图上的真实位置离定位有多远：截图里看不出具体米数
- 普通地图上 "广州塔" 和 "广州塔景区" 两个点为什么不在一起

---

## 5. 定稿文案

**正文整页按本节重写**：结构、顺序和英文文案都按本节，文案已经定稿，直接用，不要改写、不要扩写。页面模板自带的 LinBox、Get my free China itinerary、Related guides 保留。H1 不变。

### Title（58 字符）

```
Does Google Maps Work in China? I Tested It vs Amap (2026)
```

### Meta description（152 字符）

```
Tested in China, October 2026: without a VPN Google Maps didn't load; with one it found no transit route. Amap found 3 routes and 5 Luckins within 1 km.
```

### 署名行

```
Maintained by Lin · Tested on iPhone 14 (iOS 18.5) with Google Maps and AMap Global 17.2, Dongguan, October 26, 2026
```

"Last reviewed" 改成 October 26, 2026。

### 跳转目录（Quick answer 下面）

> Jump to: [Without a VPN](#no-vpn) · [Public transport](#transit) · [Satellite view](#satellite) · [Shops and cafés](#places) · [What to use](#what-to-use)

### Quick answer

> Not on its own. I tested both apps on my iPhone in Dongguan on October 26, 2026:
>
> - **Without a VPN,** Google Maps didn't load. The map stayed blank and the search kept spinning.
> - **With a VPN,** it found Canton Tower, with photos, a 4.6 rating and opening hours.
> - **Public transport:** from Canton Tower to Guangzhou South Railway Station, Google Maps said "No route found". Amap, in English, gave me three routes; the fastest took 40 minutes and cost ¥5.
> - **Satellite view:** the Canton Tower pin sat on rooftops, and a road name ran across buildings instead of along the road.
> - **Shops and cafés:** Google Maps sent me to a Luckin Coffee 5.7 km from Canton Tower, 1 hour 27 minutes on foot. Amap listed five Luckin branches within 1 km, the nearest 345 m away.
>
> **Use Amap to get around.** Google Maps is still handy for photos and reviews of big sights, if you can get it to load.

Quick answer 下面放 gig 3 卡片（和 Amap 页同一个）。

### 对比表（放在 gig 3 卡片后面）

> | What I tested | Google Maps | Amap (English) |
> |---|---|---|
> | Opens without a VPN | No: blank map, search kept loading | Yes |
> | Finds Canton Tower | Yes, with a VPN: photos, 4.6 rating, hours | Yes |
> | Public transport, Canton Tower → Guangzhou South Railway Station | "No route found" | 3 routes: 40 min (¥5), 46 min (¥5), bus 301A 1 h 29 min (¥3) |
> | Luckin Coffee from Canton Tower | Picked one 5.7 km away (1 h 27 min on foot) | 5 within 1 km; nearest 345 m |
> | Satellite view | Pin and road name off the photo | Not tested |
> | Ride for the same trip | Not tested | Offered: 33 min, from ¥26 |

### H2：Without a VPN, Google Maps doesn't load（id="no-vpn"）

> On a normal Chinese connection, Google Maps opened to a blank map: no streets, just my location dot, and the search for Canton Tower kept spinning. Google's services, Maps included, are blocked in mainland China. With a VPN on, the same search loaded straight away, with photos, a 4.6 rating from 1,153 reviews and opening hours.
>
> Not sure how you'll get online in China? See the [China eSIM and internet guide](/china-esim-internet-guide/).
>
> [截图 1、2 并排]
>
> *Left: no VPN. Right: with a VPN. My phone is set to Chinese, so Google Maps shows Chinese menus. Dongguan, October 26, 2026.*

### H2：Public transport: Google found no route, Amap found three（id="transit"）

> I asked both apps for public transport from Canton Tower to Guangzhou South Railway Station. Google Maps answered "No route found" (找不到路线). Amap, in English, gave me three:
>
> | Route | Time | Fare |
> |---|---|---|
> | Metro Line 3 → Guangfo Line → Line 2 | 40 min | ¥5 |
> | Metro Line 3 → Line 7 | 46 min | ¥5 |
> | Bus 301A, no changes (plus 1.9 km of walking) | 1 h 29 min | ¥3 |
>
> Amap also showed the next Line 3 train as "Approaching" and offered a ride for the same trip: 33 minutes, from ¥26. [How to use the metro in Amap](/amap-english-mode-guide-2026/#metro) · [Book a taxi in Amap](/amap-english-mode-guide-2026/#taxi)
>
> [截图 4、5 并排]
>
> *Left: Google Maps, "No route found". Right: Amap, three routes with fares. October 26, 2026.*

### H2：Satellite view doesn't line up（id="satellite"）

> Zoomed in on satellite view, the Canton Tower pin sat on rooftops next to a row of bars, with no tower underneath, and the label for Yuejiang West Road ran across buildings instead of along the road. In mainland China, Google's street map uses China's required shifted coordinates but its satellite photos don't, so the two can be 50 to 500 meters apart. If you follow a pin on satellite view, you may end up at the wrong spot.
>
> [截图 3]
>
> *Google Maps satellite view at Canton Tower, October 26, 2026.*

### H2：Shops and cafés（id="places"）

> I looked for the coffee chain Luckin Coffee from Canton Tower in both apps. Google Maps picked a branch 5.7 km away: 1 hour 27 minutes on foot, with no public transport option. Amap listed five branches within 1 km, the nearest 345 m away, each with a rating.
>
> In Amap's English mode, many branches show up as "Ruixing Coffee", the pinyin of Luckin's Chinese name (瑞幸咖啡). If "Luckin" finds nothing, search for that instead.
>
> [截图 6、7 并排]
>
> *Left: Google Maps sent me to a Luckin 5.7 km away. Right: Amap listed five within 1 km. October 26, 2026.*

### H2：What to use instead（id="what-to-use"）

> - **Amap** for directions, public transport and taxis. It works in English: [how to switch Amap to English](/amap-english-mode-guide-2026/#switch).
> - **DiDi** if you want a separate taxi app: [DiDi in English](/didi-in-china-for-foreigners/).
> - **Google Maps**, if you can get it to load, for photos and reviews of big sights. Check the location in Amap before you set off.

### FAQ（6 个，结构化数据同步）

1. **Does Google Maps work in China?**
   Not on its own. When I tested it on October 26, 2026, it didn't load without a VPN. With a VPN it found Canton Tower, but no public transport route to Guangzhou South Railway Station.
2. **Does Google Maps work in China with a VPN?**
   It loads and finds big sights with photos, ratings and hours. On my test it found no public transport route, and on satellite view its pin and road names didn't line up with the photo.
3. **Is Google Maps accurate in China?**
   Not reliably. In mainland China its street map and satellite photos can be 50 to 500 meters apart, and on my test the Canton Tower pin sat on rooftops, not on the tower.
4. **What map app should I use in China?**
   Amap. It works in English, plans public transport with fares, and books taxis. For Canton Tower to Guangzhou South Railway Station it gave me three routes, the fastest 40 minutes for ¥5.
5. **Can I use Amap in English?**
   Yes. AMap Global has an English mode; here's [how to switch it](/amap-english-mode-guide-2026/#switch).
6. **Can Google Maps find shops and restaurants in China?**
   Not well. From Canton Tower, Google Maps sent me to a Luckin Coffee 5.7 km away, while Amap listed five branches within 1 km, the nearest 345 m away.

### Official or primary sources to verify（4 条）

1. Wikipedia: Restrictions on geographic data in China: https://en.wikipedia.org/wiki/Restrictions_on_geographic_data_in_China
2. Shanghai government: Amap for international visitors (July 2026): https://english.shanghai.gov.cn/en-EasyShanghai/20260713/379bcea6e1bd4defaa7db2451d68d3dd.html
3. Amap brings ride-hailing to international visitors in China (PR Newswire, August 2026): https://tirto.id/amap-brings-ride-hailing-to-international-visitors-in-china-hA5e
4. AMap Global on the App Store: https://apps.apple.com/us/app/amap-global/id461703208

---

## 6. 截图

截图不要再改图。和之前几页同一套处理：640 宽 WebP，并排每张最宽 220px，单张最宽 300px，写 alt、width、height，除第一张外加 loading="lazy"。

| 编号 | 放在哪 | alt |
|---|---|---|
| 1 | #no-vpn，和 2 并排 | Google Maps on a Chinese connection without a VPN: a blank map and a search for Canton Tower that keeps loading |
| 2 | #no-vpn，和 1 并排 | Google Maps with a VPN showing Canton Tower with photos, a 4.6 rating and opening hours |
| 3 | #satellite，单张 | Google Maps satellite view where the Canton Tower pin sits on rooftops and a road name crosses buildings |
| 4 | #transit，和 5 并排 | Google Maps showing no public transport route from Canton Tower to Guangzhou South Railway Station |
| 5 | #transit，和 4 并排 | Amap in English showing three public transport routes from Canton Tower to Guangzhou South Railway Station, the fastest 40 minutes for ¥5 |
| 6 | #places，和 7 并排 | Google Maps walking directions from Canton Tower to a Luckin Coffee 5.7 km away, 1 hour 27 minutes on foot |
| 7 | #places，和 6 并排 | Amap search near Canton Tower listing Luckin Coffee branches from 345 m away, several named Ruixing Coffee |

---

## 7. 内链

本页正文入链少于 3 个的话，从相关页面补到 3 个，用 sectionNotes 那种方式加一句。优先 /amap-english-mode-guide-2026/、/china-travel-apps/、/china-esim-internet-guide/。句子只说明本页讲什么，例如：

> Wondering whether Google Maps works here? See [my Google Maps vs Amap test in China](/amap-vs-google-maps-china/).

加链接的那些页面，lastmod 和 "Last reviewed" 不动。

---

## 8. 站外：Facebook 群回答模板（有人问 Google Maps 在中国能不能用时）

> Does Google Maps work in China? I tested it on October 26, 2026: on a Chinese connection it didn't load at all. With a VPN it found Canton Tower, but for public transport to Guangzhou South station it said "No route found", and it sent me to a Luckin Coffee 5.7 km away. Amap (it has an English mode) gave me 3 routes, the fastest 40 minutes for ¥5, and listed 5 Luckins within 1 km. Use Amap to get around. Screenshots: [link]

---

## 9. 给 Claude Code 的指令

分两段：第 1 段只读，列出旧版有、新版没有的内容就停下；你把结果贴给 Claude 看过，再回 "继续"。这是熊猫基地页的教训：整页重写前先看旧版，免得丢掉已经核实过的内容。

```
先运行 pwd，确认当前目录是 ~/ChinaTravel-AI-Buddy。不是的话立刻停下，什么都不要改，告诉我。

是的话：git pull origin main。确认 docs/seo/maps-update.zip 在，解压到 docs/seo/maps-update/，里面应该有 maps-spec.md 和 maps-shots/1.png 到 7.png。找不到就停下告诉我。

1. 先只读，不改任何文件：
   - /amap-vs-google-maps-china/ 用到的文件，最近有没有别人改过；有没有还没合进 main 的分支、worktree 或 stash 在改这一页
   - 现在的 title、H1、署名行、Last reviewed、FAQ 问题
   - 旧版里有、maps-spec.md 第 5 节没有的事实，逐条列出来，每条注明旧版写的来源（没有来源的也注明）
   列完就停下，等我回复"继续"再往下做。

2. 我回复"继续"以后：按 maps-spec.md 第 5 节重写 /amap-vs-google-maps-china/。正文的结构、顺序和英文文案都按第 5 节，直接用，不要改写、不要扩写；如果我回复里让你加回某几条，照我说的加。H1 不变。按第 5 节加锚点 id：no-vpn、transit、satellite、places、what-to-use。Quick answer 下面放和 Amap 页同一张 gig 3 卡片。页面模板自带的 LinBox、Get my free China itinerary、Related guides 保留。浏览器版和静态预渲染版都要改到。FAQ 结构化数据同步更新
3. 截图 1-7 按第 6 节放：和之前几页同一套处理，640 宽 WebP，并排每张最宽 220px，单张最宽 300px，写 alt、width、height，除第一张外加 loading="lazy"，图下加第 5 节写的那行小字。截图不要再改图；docs/seo/maps-update/ 里的原始 PNG 不要提交进 git
4. 按第 7 节补内链：本页正文入链少于 3 个才补，补到 3 个。加链接的那些页面 lastmod 和 "Last reviewed" 不动
5. 本页 lastmod 和 "Last reviewed" 改成今天；其他页面不动
6. 跑项目自带的 SEO 检查和测试；检查脚本里加这一页的规则：5 个锚点都在，Sources 里有第 5 节列的 4 条链接

验收：合回 main 并部署，然后用带 ?cb=随机数 的网址检查正式站：
- 本页返回 200，title、meta description、署名行和第 5 节一致，H1 没变
- 5 个锚点都在；Quick answer 里有 "No route found" 和 "5.7 km"；两张表都在
- 截图 1-7 返回 200、有 alt；gig 3 卡片链到 https://www.fiverr.com/s/p3dZbQR
- FAQ 是 6 个，结构化数据和页面一致；4 条来源链接都在
- 第 4 步新加的链接都返回 200
- 全站没有内部链接指向被 301 的网址

最后把验收结果贴给我。
```
