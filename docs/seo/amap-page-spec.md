# Amap 英文页改版方案（SEO 打磨）· 定稿

> **页面**：https://chinaeasebuddy.com/amap-english-mode-guide-2026/（网址不改）
> **实测**：iPhone 14 · iOS 18.5 · AMap Global 17.2 · 东莞 · 2026-10-23
>
> **你还要做的（2 分钟）**
> 1. 在 Mac 上下载 amap-update.zip（这个文件和 18 张已排好序的截图都在里面），留在「下载」文件夹，不用解压
> 2. 把第 9 节的指令粘给 Claude Code，它会自己解压到 docs/seo/

---

## 1. 为什么是这一页

- **流量**：两个 Amap 页合并后，5 周约 172 次展示，主页面平均排名 13.7，是全站离首页最近的词群之一。核心词 "how to switch / change amap to english" 排 31-34 名，"is amap available in english" 排第 9，"a map in english" 排 7.5。
- **竞争能赢**：前排是 Trip.com、Klook、wanderinchina、geekchamp 和几篇 2025 年的新闻稿。抓取到的正文里，没有一家写明截图的拍摄日期和 App 版本号；wanderinchina 没有作者和更新日期；Trip.com 正文被酒店、机票、eSIM 广告挤满。
- **实测发现（竞品都没写或写错的）**：
  1. 切换路径是 **My → 齿轮 → Language**，3 下就到。竞品写的"设置 → 通用 → 语言"是错的，Language 就在设置第一层
  2. 手机是中文时，English 和其他外语**全是灰色的**；iPhone 改成英文和境外地区后才能选，选完必须重启 App
  3. **登录可以不用手机号**：Email、Apple、Google 都行
  4. **打车**能同时勾多个车型、一次发给多家平台；实测 25 公里，特惠快车 34-38 元，出租车 96 元
  5. **路线会告诉你从哪个口进站**，还有**下车提醒**
  6. **Hi China** 的点餐功能：拍菜单 → 英文菜名、口味标签、价格 → 设过敏和忌口 → 生成给服务员看的中文点单卡，还能 AA
  7. 英文版里**找不到离线地图入口**，竞品写的"我的 → 离线地图"照着找不到
- **精准客户**：搜这个词的人通常在出发前 1-4 周装 App，正好对上 Fiverr gig 3（帮你装好支付宝、微信支付、SIM 和 App），也是 LinBox"免费帮你看行程"的对象。

---

## 2. 目标（11-20 判定时看）

| 搜索词 | 现在排名 | 11-20 目标 |
|---|---|---|
| is amap available in english | 9 | 前 3 |
| amap in english | 10 | 前 5 |
| how to switch amap to english | 31.5 | 前 5 |
| amap english setting | 31.5 | 前 5 |
| how to change amap language to english | 34 | 前 5 |
| amap english | 34.8 | 前 10 |
| amap english grayed out / amap menu translation | 新词 | 出现展示 |

**怎么看**：GSC → 效果 → 添加筛选「网页」= 本页网址 → 看「查询」标签。

---

## 3. 现在这页的问题

1. **核心答案含糊，而且漏了最关键的坑**："菜单位置因版本而异""不是固定的点击路径"。这页从没真正测过，也没写 English 会变灰
2. **一张截图都没有**
3. **三处过时**：离线（"当作不能离线"）、外国号码（"因情况而异"）、打车（"可能没有英文支持"）
4. 三张表格在重复同一件事；FAQ 14 个，大半和正文重复
5. 假按钮 "Convert my address into an Amap-ready search"，点进去是首页
6. 正文两处提到 DiDi 没加链接；来源里有 2019 年的 WWDC 视频和一条不相关的英国政府页面
7. 没有对准这类读者的 CTA（gig 3）

---

## 4. 实测记录和截图

### 截图：编号、打码、用途

已按这个顺序改好名，在 amap-update.zip 的 amap-shots 文件夹里（19、20 是可选的，现在没有）。

| 编号 | 哪一张 | 用在哪 |
|---|---|---|
| 1 | 16:25 My 页 | 切换第 1 步 |
| 2 | 16:25 Settings 页 | 切换第 2 步 |
| 3 | 16:25 Language Settings（English 已选中） | 切换第 3 步 |
| 4 | 16:25 英文首页 | 切换第 4 步 |
| 5 | 15:59 中文的「语言设置」页（English 是灰色的） | English 变灰 |
| 6 | 16:06 搜 "Jihotel" | 英文搜索 |
| 7 | 16:07 搜 "Subway station" | 英文搜索 |
| 8 | 16:10 登录页（Email / Apple / Google） | 登录 |
| 9 | 16:10 区号列表 | 登录 |
| 10 | 16:14 打车页（起点 Subway Station Exit A） | 打车 |
| 11 | 16:30 公共交通路线 | 地铁 |
| 12 | 16:07 松山湖地铁站详情 | 地铁 |
| 13 | 16:03 Hi China 首页 | Hi China |
| 14 | 16:39 菜单翻译（第一道菜是 Stir-fried Fresh Beef 的那张） | 点餐 |
| 15 | 16:39 Dietary Preferences（过敏和忌口） | 点餐 |
| 16 | 16:40 Order Food（给服务员看的点单卡） | 点餐 |
| 17 | 16:41 Face-to-Face 翻译 | 其他工具 |
| 18 | 16:41 Arrival Guide（没有黑色提示框的那张） | 其他工具 |
| 19 | 可选：iPhone 设置 → 通用 → 语言与地区（English + United Kingdom）。改回中文之前截 | English 变灰 |
| 20 | 可选：App Store 里 AMap Global 的页面 | 下载 |

不用的：16:09 那张打车（起点是小区）、16:18 那张打车、16:04 那张 Arrival Guide、另外两张菜单、两张 Network Connection、16:40 那张 Hi China 全部功能。

### 实测记录

| 项 | 结果 |
|---|---|
| 设备 | iPhone 14 / iOS 18.5 / AMap Global 17.2 / 东莞 / 2026-10-23 |
| 切换路径 | 右下角 My（我的）→ 右上角齿轮 Settings（设置）→ Language（语言设置）→ 选语言 → 彻底关掉再打开。3 下到语言列表 |
| English 变灰 | 手机是中文、地区是中国时，English 和其他外语全灰。iPhone 改 English + United Kingdom 后变成可选 |
| Hi China 入口 | 首页搜索框下面的快捷图标，Drive 正下方 |
| 还是中文的东西 | 车站页的设施列表（卫生间、母婴室），有 View Translation 按钮；My 页的"语音包""车标" |
| 英文搜索 | "Jihotel"：5 家全季酒店的不同分店，英文名下面有中文全称和评分。"Subway station"：附近地铁站，英文 + 中文 + 线路标签，最近的标 Nearest |
| 登录方式 | 手机号（区号有 +86、+852、+853、+886、+81 等），或 Email、Apple、Google、微信、支付宝、淘宝。实际登录未测 |
| 打车 | 四种车型：Discount Express（便宜，堵车不加价，改行程重新计价）、Express、Flash（接驾快）、Taxi。可多选车型，每个车型发给多家平台（Selected 3/13）。14 公里 32 分钟：19-23 / 约 24 / 36-39 / 约 49 元。25 公里 56 分钟：34-38 / 44-71 / 74-80 / 约 96 元。可点地图上的上车点标签修改。有 Now / For Others。未下单，支付未测 |
| 公共交通 | 多个方案可切换；每段写明线路（含城际铁路）、站数、下车站、下一班时间、从哪个口进站、走多远；GO 按钮带下车提醒；路线可钉到首页 |
| 车站详情 | 各出入口、票价 2-11 元、两个方向首末班车、下一班倒计时和拥挤程度 |
| Hi China 点餐 | 拍菜单自动识别；每道菜有英文名、中文名、口味/食材标签、描述、人民币价格加美元换算；Dietary Preferences 可选严重过敏（牛奶、鸡蛋、鱼、甲壳类、坚果、花生、小麦、大豆、芝麻）、忌口（不吃猪肉、牛肉、海鲜、乳制品、无麸质）、辣度、其他；生成 "Show order to staff" 中文点单卡，带饮食偏好、已点菜品、预计总价、AA 计算。页面标注 "AI-generated. Please verify." |
| Hi China 其他 | Face-to-Face 双向文字翻译；Arrival Guide 三步：入境、上网（机场免费 Wi-Fi 三步连接；机场买 SIM：三大运营商、只有实体卡、需要护照、付款可用现金/支付宝/微信/银联/Visa；附带拼音短语）、去酒店 |
| 离线地图 | 英文版 17.2 里找不到入口 |
| 未测（可选） | 只改语言不改地区行不行；iPhone 改回中文后高德还是不是英文；不登录能用到哪一步 |

### LOCAL NOTE（你的原话，英文版在第 5 节）

1. 切换英文后，需要关掉 App，重启 App 语言系统才更新，否则会出现语言混乱的情况
2. 乘坐地铁时，需要看清楚地铁口，大部分地铁有行李专用的电梯，需要注意
3. 有极少部分道路无法上车，App 会自动识别，所以需要看清楚上车地点，并且上车时核对车牌号
4. 可以提前下载离线地图（如果 App 有这个功能的话），或者在地面空旷处使用
5. 点餐功能不错，可以拍照自动识别，然后选择好菜后直接展示给服务员下单，语言不通时特别有用；Walk 功能有点鸡肋

---

## 5. 新页面（英文定稿）

`[截图 N]` 是插图位置，编号对应第 4 节。英文文案已经定稿，直接用。

### Title（55 字符）

```
How to Use Amap in English (2026): Switch, Taxi & Metro
```

备用（两三周后如果点击率低再换）：`How to Change Amap to English (2026): Taxi, Metro, Offline`

### Meta description（144 字符）

```
Tested on my phone in China, Oct 2026: switch Amap to English, fix grayed-out English, compare taxi fares, find metro exits and translate menus.
```

### H1

```
How to Use Amap in English: Switch the Language, Book a Taxi, Ride the Metro
```

### 署名行

```
Maintained by Lin · Tested on iPhone 14 (iOS 18.5), AMap Global 17.2, Dongguan, October 23, 2026
```

### Quick answer（框）

> Download **AMap Global** (publisher: AutoNavi). In Amap, tap **My → ⚙️ Settings → Language → English**, then close Amap completely and reopen it. Amap itself reminds you to restart after changing the language.
>
> This works when your phone is set to a non-Chinese language and region, as most visitors' phones already are. (English grayed out? [Here's the fix](#english-grayed-out).)
>
> The app's buttons and route directions switch fully, but many shop and street names stay in Chinese, so keep your hotel's Chinese address handy.
>
> *Tested on iPhone 14, Dongguan, October 23, 2026.*
>
> Jump to: [English grayed out?](#english-grayed-out) · [Book a taxi](#taxi) · [Metro exits](#metro) · [Menu translation](#menu-translation) · [Offline](#offline)

### CTA 卡片（紧跟在 Quick answer 下面）

> **Flying soon?** If you'd rather not troubleshoot at the airport, I'll get Amap, Alipay and DiDi working on your phone before you fly.
> [See the app setup service on Fiverr →](https://www.fiverr.com/s/p3dZbQR)

### H2：Download the right app: AMap Global

In the App Store and Google Play the app is called **AMap Global**, published by **AutoNavi Information Technology**. It's the same app Chinese drivers and locals use: in China's App Store it's listed as 高德地图 (Gaode), with the same publisher. Ignore look-alike apps with "English map" in their name.

Update before you fly: newer features such as English taxi booking only appear in recent versions. [截图 20，可选]

### H2：How to switch Amap to English, step by step（id="switch"）

1. Tap **My** (我的), bottom right. [截图 1]
2. Tap the **gear icon** (设置 Settings), top right. [截图 2]
3. Tap **Language** (语言设置) and choose **English**. [截图 3]
4. **Close Amap completely** (swipe it away) and reopen it. [截图 4]

That's three taps to the language list. The same list also has Spanish, Portuguese, French, German, Thai, Japanese and more.

**LOCAL NOTE:** After switching to English, you need to close Amap and restart it before the language updates. Otherwise the languages get mixed up.

**Android:** you can also try Settings → System → Languages → App languages → AMap → English. This works on supported phones; Google notes some steps need Android 14 or later.

#### H3：English grayed out?（id="english-grayed-out"）

If your phone is set to Chinese, Amap's language list shows English and the other foreign languages grayed out (greyed out). [截图 5] This mostly catches overseas Chinese visitors or anyone who uses their phone in Chinese. The fix: go to **iPhone Settings → General → Language & Region**, set the iPhone language to **English** and the region to a country outside mainland China (I used United Kingdom) [截图 19，可选], then choose English in Amap and restart it.

### H2：Search in English, and what stays in Chinese（id="search"）

The app's buttons and turn-by-turn directions switch to English. Since July 2025, Amap also shows English names and descriptions for key places such as major attractions, hotels and restaurants. Smaller shops, bus stops and many residential compounds still appear in Chinese, and so do some details: on station pages, for example, the facilities list (toilets, baby rooms) is in Chinese. Tap **View Translation** to translate it.

**English search works, but watch the branch** [截图 6、7]
- I searched for Ji Hotel in English and got five branches of the same chain in one city, each with its Chinese name underneath. Pick the branch whose Chinese name matches your booking confirmation.
- Searching "subway station" listed the nearby stations with English and Chinese names, the line number, and a **Nearest** tag.
- Your own hotel by its Chinese name always works best. Copy the name from your booking confirmation.

**Watch out for twins:** Shanghai Hongqiao Railway Station (上海虹桥站) and Shanghai Hongqiao International Airport (上海虹桥国际机场) are different places, and Pudong Airport (上海浦东国际机场) is another airport again. Match the name on your ticket.

### H2：Do you need a Chinese phone number?（id="sign-in"）

No. According to Amap, its main features work without logging in. To book a taxi you do sign in, and you don't need a Chinese SIM for that either: the sign-in screen offers country codes beyond mainland China, Amap's August 2026 update says numbers from 65 countries and regions work, and you can skip the phone number entirely by signing in with **email, Apple or Google** (or WeChat, Alipay or Taobao). [截图 8、9]

To pay for rides, link a card to Alipay or WeChat Pay first: [Alipay for foreigners](/alipay-for-foreigners/) · [WeChat Pay for foreigners](/wechat-pay-for-foreigners/).

### H2：Book a taxi in English inside Amap（id="taxi"）

Since August 2026, AMap Global lets international visitors book rides in English. Tap **Ride** on the Home screen (or the ride icon on any route screen), set your destination, choose a car type, check the fare estimate and pickup point, then confirm. Amap sends your request to a network of ride-hailing and taxi operators in one tap. [截图 10]

What I saw on two trips in Dongguan on October 23, 2026 (fares change with time and traffic):

| Ride type | What it's for | 14 km, 32 min | 25 km, 56 min |
|---|---|---|---|
| Discount Express | Cheapest; no extra charge for traffic jams (the price is recalculated if you change the trip) | 19–23 CNY | 34–38 CNY |
| Express | Everyday rides | about 24 CNY | 44–71 CNY |
| Flash | Faster pickup | 36–39 CNY | 74–80 CNY |
| Taxi | Regular taxi | about 49 CNY | about 96 CNY |

On the longer trip, Discount Express cost less than half the taxi fare.

You can tick **several ride types at once**, and each one goes out to several ride platforms (mine showed "Selected 3/13"), so more drivers can pick up your request. If the pickup pin is in the wrong spot, tap the pickup label on the map to move it. Before you confirm, Amap asks you to accept the third-party ride terms. You can also book **For Others**. I stopped before booking, so I haven't tested the payment step.

**LOCAL NOTE:** A small number of roads don't allow pickups, and the app detects this automatically, so check exactly where your pickup point is. When you get in, check the license plate.

**Amap or DiDi?** Amap books across several operators from the map you're already using. DiDi is a single platform with its own English app. Step-by-step DiDi setup: [DiDi in China for foreigners](/didi-in-china-for-foreigners/).

### H2：Metro and walking routes: pick the right entrance（id="metro"）

Search your destination, then tap the **bus icon** (Public Transport) on the route screen. Amap lists several options with total journey times. Each leg shows the line (intercity trains as well as metro), how many stops, where to get off, when the next train leaves, and **which station entrance to use** plus how far you'll walk to it. [截图 11]

Tap **GO** to start the route with a **get-off reminder**, so you don't miss your stop.

Tap any station to see its entrances and exits, the fare range, first and last train times in each direction, and a live countdown to the next train with how crowded it is. [截图 12] For the whole network, use the **Subway Map** shortcut on the Home screen.

**LOCAL NOTE:** When you take the metro, look carefully at which entrance you use. Most stations have elevators for luggage, so look out for them.

For walking routes, zoom in near big roads, footbridges and malls to check where the entrance actually is. More on metro tickets and gates: [China metro guide](/china-metro-guide/).

### H2：Hi China: menu translation and more tools for visitors（id="hi-china"）

On the Home screen, tap **Hi China**: it's in the shortcut icons below the search bar, right under **Drive**. It's Amap's one-stop page for international visitors. [截图 13]

#### H3：Order food with Menu Translation（id="menu-translation"）

Take a photo of a Chinese menu and Amap turns it into an English one: each dish gets an English name above the Chinese, tags such as spicy, pork or seafood, a short description, and the price in yuan with an approximate dollar amount. [截图 14]

Tap **+** to add dishes and set your **Dietary Preferences**: severe allergies (peanut, tree nuts, crustaceans, milk, egg and more), restrictions such as no pork or gluten-free, and how spicy you want it. [截图 15] Amap then builds a card to **show the staff**: a polite request in Chinese, your dishes, your dietary preferences and the estimated total, with a bill splitter underneath. [截图 16]

Amap marks these translations as machine-generated and asks you to check them. If you have a severe allergy, add it in Dietary Preferences so it shows on the card, and confirm with the staff before you eat.

More on ordering: [How to order food in China](/china-food-ordering-guide/).

#### H3：Other tools in Hi China

- **Face-to-Face Translation**: type in English or Chinese and both appear on screen, for quick back-and-forth with staff or drivers. [截图 17]
- **Arrival Guide**: three checklists for landing: immigration and the arrival card; getting online (airport free Wi-Fi in three steps, and buying a SIM card at the airport from China's three main carriers: physical SIMs only, passport required); and getting to your hotel by ride, airport pickup, airport bus or metro. The Wi-Fi and SIM checklist includes phrases in Chinese with pinyin. [截图 18] See also: [China airport arrival guide](/china-airport-arrival-guide/).
- **Ride**, **Public transport**, **Walk** and **Bike**: shortcuts to Amap's navigation features.
- **Trip planner**, **Check entry requirements** (visa-free eligibility), **Arrival card** (official online form), **Hotels**, **Cultural Notes** and **Emergency help**.

**LOCAL NOTE:** The food-ordering feature is good: take a photo and it recognizes the menu automatically, then you pick your dishes and show the order straight to the staff. It's especially useful when you don't speak the language. The Walk feature feels a bit pointless.

### H2：Offline maps and weak signal（id="offline"）

Many guides tell you to download offline maps from **Me → Offline Maps**. In the October 2026 English version (17.2), I couldn't find that entry anywhere. Amap's update notes mention offline navigation, but I couldn't confirm how to use it from the English interface. So don't count on offline maps: screenshot your hotel's Chinese address and key routes, and get a working data plan before you land: [China eSIM & internet guide](/china-esim-internet-guide/).

**LOCAL NOTE:** You can download offline maps in advance if your version of the app has the feature, or use Amap at street level in an open area.

### H2：Still in Chinese? Quick fixes（id="troubleshooting"）

| Problem | Fix |
|---|---|
| English is grayed out in Amap's language list | Set your iPhone language to English and region outside mainland China, then choose English in Amap and restart it ([details](#english-grayed-out)) |
| Chose English but the app is still in Chinese, or a mix of both | Close Amap fully and reopen it; the change only applies after a restart |
| Can't find the Language option | It's in My → ⚙️ Settings → Language. If it isn't there, update AMap Global to the latest version |
| App in English, hotel name in Chinese | That's normal. Search by the Chinese name or paste the Chinese address from your booking |
| Wrong branch, airport or station | Compare the district, street and distance. Use the full Chinese name and match the terminal or station on your ticket |
| Can't book a taxi | Sign in (email, Apple or Google work), link Alipay or WeChat Pay, and update the app |

### H2：Phrases to show drivers and staff

保留现有 5 句，不改。

### H2：FAQ（8 个）

- **Does Amap have an English version?** Yes. Switch it in My → Settings → Language, then restart Amap. Since July 2025 Amap also supports 14 more languages, including Spanish, French, German, Japanese, Korean, Russian and Arabic.
- **Why is English grayed out in Amap?** In my test, English and the other foreign languages were grayed out while my iPhone was set to Chinese. Setting the iPhone to English with a region outside mainland China unlocked them.
- **Is Amap free?** Yes. Downloading and using the map is free; you only pay for rides you book.
- **Do I need a VPN to use Amap in China?** No. Amap is a Chinese app and works on Chinese mobile networks without a VPN.
- **Do I need a Chinese phone number?** No. The main features work without an account. To book taxis you sign in, and you can use email, Apple or Google instead of a phone number; Amap says numbers from 65 countries and regions also work.
- **Can Amap translate a Chinese menu?** Yes. In Hi China, Menu Translation turns a photo of a Chinese menu into English dish names with tags and prices, then shows your order to the staff in Chinese. Confirm allergies with the staff.
- **Does Amap work offline?** Don't count on it. Amap's update notes mention offline navigation, but in the October 2026 English version I couldn't find an Offline Maps entry. Save screenshots of key addresses and routes, and get a data plan.
- **Is Amap better than Google Maps in China?** For mainland China, yes. See [Amap vs Google Maps in China](/amap-vs-google-maps-china/).

### LinBox 和 Related guides

保持现状。

### Official or primary sources（整体替换）

1. AMap Global on the App Store: https://apps.apple.com/us/app/amap-global/id461703208
2. AMap Global on Google Play: https://play.google.com/store/apps/details?id=com.autonavi.minimap
3. Shanghai government — China's first multilingual map adds 14 new languages (July 2025): https://english.shanghai.gov.cn/en-Latest-WhatsNew/20250711/8f2fcf3c6b624a56a6b2c0d8152ea2f2.html
4. Amap brings ride-hailing to international visitors in China (PR Newswire Asia, August 11, 2026): https://en.prnasia.com/releases/global/amap-brings-ride-hailing-to-international-visitors-in-china-543611.shtml
5. Shanghai government — Amap for international visitors (July 2026): https://english.shanghai.gov.cn/en-EasyShanghai/20260713/379bcea6e1bd4defaa7db2451d68d3dd.html
6. Google — change app language on Android: https://support.google.com/android/answer/12395118

删掉：WWDC 2019 视频、英国政府关于上网的那一条。

---

## 6. 转化

- **Quick answer 下方**：gig 3 的 CTA 卡片。读者此刻的问题就是"App 装不好"，gig 3 正好对口
- **文末**：LinBox 不变（免费看行程 → gig 2）
- **删掉**假按钮 "Convert my address into an Amap-ready search"
- 整页只留这两个 CTA

---

## 7. 内链：让站内其他页把权重导过来

| 页面 | 加在哪一段 | 锚文本 | 链到 |
|---|---|---|---|
| /china-travel-apps/ | 介绍 Amap 的那段 | how to switch Amap to English | 本页 |
| /amap-vs-google-maps-china/ | 开头结论段 | step-by-step Amap English setup | 本页 |
| /china-metro-guide/ | 找出口那段 | find the right metro entrance in Amap | 本页 #metro |
| /didi-in-china-for-foreigners/ | Amap 和 DiDi 对比那段 | book a taxi in English inside Amap | 本页 #taxi |
| /china-airport-arrival-guide/ | 落地前准备那段 | switch Amap to English before you land | 本页 |
| /china-food-ordering-guide/ | 看不懂菜单那段 | translate a Chinese menu with Amap | 本页 #menu-translation |
| /what-to-eat-in-china-first-time-guide/ | 点菜那段 | Amap's menu translation | 本页 #menu-translation |
| /first-trip-to-china/ | App 清单那段 | Amap in English | 本页 |
| /3-day-shenzhen-itinerary/、/3-day-guangzhou-itinerary/ | 交通那段 | use Amap in English | 本页 |

---

## 8. 站外：Reddit

每周挑 2-3 个相关帖子回答，用每天那 15 分钟 Reddit 时间。先看版规允不允许放链接。

**问"在中国用什么地图"时：**

> Google Maps is unreliable in mainland China, so use Amap — it's called AMap Global in the App Store. To switch it to English: My → Settings (gear icon) → Language → English, then close and reopen the app. If English is grayed out, set your phone language to English and region outside mainland China first. Small shop names stay in Chinese, so save your hotel's Chinese address. I tested it this week and put the steps with screenshots here: [link]

**问"不会中文怎么点菜"时：**

> Amap (AMap Global) has a menu translator in its Hi China section: take a photo of the menu, it shows English dish names, tags and prices, and then gives you a card in Chinese to show the staff, including any allergies you set. Still double-check allergies with the staff. Screenshots here: [link]

---

## 9. 给 Claude Code 的指令

前提：amap-update.zip 在 Mac 的「下载」文件夹。

```
先 git pull origin main。

0. 解压：unzip -o ~/Downloads/amap-update.zip -d docs/seo/（如果下载的文件名带了 "(1)" 之类的后缀，用实际文件名）。确认 docs/seo/amap-page-spec.md 和 docs/seo/amap-shots/1.png 到 18.png 都在

任务：按 docs/seo/amap-page-spec.md 改版 /amap-english-mode-guide-2026/。截图在 docs/seo/amap-shots/，1.png 到 18.png（19、20 是可选的，现在没有，跳过那两个位置）。

1. title、meta description、H1、署名行、Quick answer、CTA 卡片按第 5 节替换
2. 正文按第 5 节的结构、顺序和英文文案重写。文案已经定稿，直接用，不要改写、不要扩写。按第 5 节加锚点 id：switch、english-grayed-out、search、sign-in、taxi、metro、hi-china、menu-translation、offline、troubleshooting。旧的三张重复表格换成第 5 节那一张排查表；FAQ 换成第 5 节的 8 个，页面如果有 FAQ 结构化数据，同步更新；"Useful Chinese map phrases" 那 5 句保留不动
3. LOCAL NOTE 做成和正文区分开的提示框，文案用第 5 节的英文原文
4. 截图转 WebP，宽度不超过 1080px，放进项目图片目录，插到 [截图 N] 标注的位置。每张写英文 alt，描述画面内容；图下加一行小字：Screenshot from my iPhone, Dongguan, October 2026。写上 width 和 height；除第一张外加 loading="lazy"。docs/seo/amap-shots/ 里的原始 PNG 不要提交进 git
5. 删掉 "Convert my address into an Amap-ready search" 这个按钮；文末 LinBox 不动
6. 官方来源列表按第 5 节整体替换
7. 按第 7 节，在那几个页面的正文里加指向本页的链接
8. 本页 lastmod 和 "Last reviewed" 改成今天；其他页面只加了链接、内容没变的，日期不动

验收：合回 main 并部署，然后对正式站跑：
- curl 确认本页返回 200，title、meta description、H1 和第 5 节一致
- 所有截图返回 200，每张都有 alt
- 页面不再出现 "Convert my address"；Fiverr 链接是 https://www.fiverr.com/s/p3dZbQR；LinBox 和 lin@chinaeasebuddy.com 还在
- 第 2 条列出的 10 个锚点 id 都存在
- 第 7 节每个页面都能找到指向本页的链接
- 全站没有内部链接指向被 301 的网址
把结果贴给我
```

---

## 10. 上线后

1. 部署后，GSC「网址检查」提交本页，请求编入索引；Bing 的 URL Inspection 也提交一次
2. 用第 8 节的模板，这周在 Reddit 回 2-3 个相关帖子
3. 11-06 中期检查：看第 2 节的那几个词有没有往前走
4. 11-20 判定：对照第 2 节的目标
