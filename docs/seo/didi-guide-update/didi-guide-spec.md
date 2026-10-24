# 滴滴使用页改版方案 · 定稿（实测版）＋ 滴滴支付页修正

> **页面**：https://chinaeasebuddy.com/didi-in-china-for-foreigners/（网址不改）
> **顺带修正**：https://chinaeasebuddy.com/didi-payment-for-foreigners/（第 11 节）
> **日期**：2026-10-24
>
> **你要做的（2 分钟）**
> 1. 等 TenPayGo 那条指令跑完
> 2. 下载 didi-guide-update.zip，用访达拖进 `ChinaTravel-AI-Buddy/docs/seo/`（里面是这份方案和 7 张截图，首页那张已经打码）
> 3. 把第 9 节的指令粘给 Claude Code
> 4. 等它报告上线以后：两个网址都在 GSC 和 Bing 提交一次

---

## 1. 为什么是这一页、这次的角度

- **数据**：三个滴滴页里展示最多（5 周 147 次），但平均排名 31.5；"didi china"、"didi in china"、"how to use didi in china"、"didi app china" 都排在 70 名左右。这些是大词，往前推一截，展示量涨得最多，对应 11-20 判定第 1 条。
- **现在这页的问题**：没有一张截图；切英文的路径引用的是上海政府的指南，不是实际操作；付款一节只说"看你的预订方式"；整页没有一个具体价格。
- **这次的角度：本地人在东莞实测，用英文界面走一遍。** 都是第一手的：
  - 切英文的实际路径：Account → 右上角齿轮 → Language → English → 完成 → Confirm（语言页的"完成"按钮还是中文）
  - 用英文能搜到地名，但英文地名会翻错：东莞的万达广场显示成 "Wanda Plaza (Beijing Wukesong Branch)"
  - 3.1 公里的真实报价：Economy ¥10、Standard ¥11.1、Priority ¥11.9、Taxi 估价 ¥14.1、Premium ¥20.2；网约车是 "Upfront Fare" 一口价，出租车是 "Est." 估价
  - 叫出租车可以付现金（App 原话：只限出租车，不能用券）
  - App 里能绑的卡：UnionPay、Visa、MasterCard、JCB、Diners；Apple Pay 也在付款方式里
  - 客服先是 AI 助手，让你选 English 或中文，右上角有 Safety Hotline
  - 3 条 LOCAL NOTE：上车点、手机尾号、行驶路线
- **署名行**：Tested on iPhone 14 (iOS 18.5), DiDi 7.2.14, Dongguan, October 24, 2026。没测的（用境外手机号注册、真实乘车、聊天翻译、安全中心）页面上不写成测过。
- **H1 不改**：现在的 "How to Use DiDi in China as a Foreigner" 已经对上主词，不改的话全站 Related guides 的标签也不用动。
- **精准客户**：要打车的人通常也在弄支付宝和微信支付，对应 gig 3。

---

## 2. 目标（11-20 判定时看）

| 搜索词 | 现在排名 | 目标 |
|---|---|---|
| 本页平均排名 | 31.5 | 前 20 |
| how to use didi in china | 79 | 前 30 |
| didi in china / didi china | 76 / 70 | 前 30 |
| didi app china | 70 | 前 30 |
| didi english、didi upfront fare、didi cash 这类 | 无数据 | 出现展示 |

---

## 3. 实测记录

- **时间**：2026-10-24 下午（北京时间 15:51-15:54）
- **设备**：iPhone 14，iOS 18.5，滴滴 7.2.14（有更新提示，没更新），东莞
- **账号**：本人的中国账号，所以境外手机号注册这一步没测，用官方来源（App Store 介绍、北京市政府指南）
- **测了**：切英文；英文搜地名；从东莞万达广场到西平站的报价（3.1 公里、9 分钟，没叫车）；付款方式选择（网上支付或现金）；钱包和付款方式列表；客服页
- **没测**：真实乘车、和司机聊天的翻译、安全中心、境外手机号注册

---

## 4. 截图（在 didi-shots/ 里，2 号已打码，不要再改图）

| 编号 | 内容 | 放在哪 | alt |
|---|---|---|---|
| 1 | 语言页，English 已选中 | 本页 #english，单张 | DiDi language settings with English selected, alongside Simplified Chinese, Traditional Chinese and Korean |
| 2 | 英文首页（地图和上车点已打码） | 本页 #book，和 3 并排 | DiDi home screen in English with the Where to? box, map blurred for privacy |
| 3 | 车型和报价（3.1 公里） | 本页 #book，和 2 并排 | DiDi ride options in English with upfront fares for Economy, Standard, Priority and Premium and estimates for taxis |
| 4 | 选择付款方式：Pay Online 或 Cash | 本页 #pay，和 5 并排；支付页 #compare 末尾，单张 | DiDi asking to choose Pay Online or Cash, with cash only for taxi trips |
| 5 | 付款方式列表：Credit / Debit Card（UnionPay/Visa/MasterCard/JCB/Diners）、Apple Pay 等 | 本页 #pay，和 4 并排；支付页 #card，和 7 并排 | DiDi payment methods listing a credit or debit card option for UnionPay, Visa, Mastercard, JCB and Diners, plus Apple Pay and Alipay |
| 6 | 客服：AI 助手，选 English 或中文，Safety Hotline | 本页 #help，单张 | DiDi customer service asking you to choose English or Chinese, with a Safety Hotline button |
| 7 | My Wallet 页 | 支付页 #card，和 5 并排 | DiDi My Wallet page with the Payment Methods entry |

样式和 Amap 页一样：生成 640 宽的 WebP；单张最宽 300px；同一行的几张并排，每张最宽 220px。两个页面共用同一份图片文件。

---

## 5. 新页面（英文定稿）

### Title（59 字符）

```
DiDi in China (2026): How to Use the App in English, Tested
```

### Meta description（149 字符）

```
Tested in Dongguan: switch DiDi to English, compare upfront fares with taxi estimates, check your pickup point and tell the driver your phone digits.
```

### H1（不改）

```
How to Use DiDi in China as a Foreigner
```

### 署名行

```
Maintained by Lin · Tested on iPhone 14 (iOS 18.5), DiDi 7.2.14, Dongguan, October 24, 2026
```

### Quick answer（框）

> Yes, foreigners can use DiDi, and the app works in English. I tested it in Dongguan on October 24, 2026:
>
> - **English:** Account → gear icon → Language → English → 完成 (Done) → Confirm.
> - **Search:** typing place names in English worked. Still check the pin on the map.
> - **Prices:** app rides show an **Upfront Fare**, a fixed price. Taxis show **Est.**, an estimate.
> - **Getting in:** check your pickup point before you set off, and confirm the last digits of your phone number with the driver. The trip may not start without them.
> - **Paying:** online with WeChat Pay, Alipay or a card, or cash on taxi trips. [How to pay for DiDi with a foreign card](/didi-payment-for-foreigners/)
>
> Jump to: [Download](#download) · [English](#english) · [Book](#book) · [Pickup](#pickup) · [During the ride](#ride) · [Pay](#pay) · [Help](#help) · [Phrases](#phrases)

### CTA 卡片（紧跟在 Quick answer 下面）

> **Flying soon?** I'll get DiDi, Alipay and WeChat Pay working on your phone before you fly, so your first ride from the airport just works.
> [See the app setup service on Fiverr →](https://www.fiverr.com/s/p3dZbQR)

### H2：Download the right app（id="download"）

DiDi's app for mainland China is sold by Didi Chuxing (Beijing) Network Platform Technology Co., Ltd. Its name in the App Store changes from country to country (in the US store it's "DiDi China: Ride Hailing"), so check the seller before you download.

DiDi's listing says the app is in English and supports "global mobile number login". You'll need to receive one SMS code to sign up.

Already set up Alipay or WeChat? DiDi also runs inside both as a mini program, so you can book without installing the app.

### H2：Switch DiDi to English（id="english"）

1. Tap **Account** (bottom right), then the **gear icon** (top right).
2. Tap **Language** and choose **English**. The other options are Simplified Chinese, Traditional Chinese and Korean.
3. Tap **完成** (Done) at the top right, then **Confirm**.

[截图 1]

A few things stay in Chinese, including that 完成 button and some coupon names.

### H2：Book a ride step by step（id="book"）

1. Tap **Where to?** and type your destination. Searching in English worked in my test.
2. Check the pickup point (see the next section).
3. Pick a ride type. You can tick several at once to get a car sooner; the bottom bar then shows a price range.
4. If you ticked Taxi, DiDi asks how you'll pay: **Pay Online** or **Cash**.
5. Tap **Confirm**.

[截图 2、3 并排]

What DiDi showed me for a 3.1 km, 9-minute trip in Dongguan:

| Ride type | DiDi's description | Price shown |
|---|---|---|
| Economy | The most affordable rides | Upfront Fare 10 CNY |
| Standard | Everyday rides | Upfront Fare 11.1 CNY |
| Priority | Shorter waiting time | Upfront Fare 11.9 CNY |
| Taxi | — | Est. 14.1 CNY |
| Comfort Taxi | — | Est. 14.1 CNY |
| Premium | High end cars, top drivers | Upfront Fare 20.2 CNY |

An **Upfront Fare** is a fixed price for the trip. **Est.** on taxis is an estimate.

English place names aren't always right. In my test, a mall in Dongguan showed up as "Wanda Plaza (Beijing Wukesong Branch)". Check the pin on the map, not just the name.

### H2：Pickup and getting in（id="pickup"）

> **LOCAL NOTE:** Some roads don't allow cars to stop, so DiDi moves your pickup to the nearest point where you can get in. Check the pickup point before you set off.

> **LOCAL NOTE:** Before you get in, confirm the last digits of your phone number with the driver, or the trip may not start. If you don't speak Chinese, just show the driver the digits on your phone.

Check that the plate number matches the one in the app before you get in. At airports and big railway stations, follow the signs for the ride-hailing pickup area (网约车上车点).

Most drivers only speak Chinese, but DiDi's in-app chat translates between English and Chinese.

### H2：During the ride（id="ride"）

> **LOCAL NOTE:** Once you're in, check that the route matches the one in the app. If it doesn't, ask the driver, or contact DiDi's customer service straight away.

In an emergency, call 110 (police).

### H2：Paying for DiDi（id="pay"）

When you book, DiDi offers two ways to pay:

- **Pay Online:** WeChat Pay, Alipay or a credit or debit card. In the app's payment methods, the card option lists UnionPay, Visa, Mastercard, JCB and Diners. Apple Pay is on the list too.
- **Cash:** only on taxi trips, and coupons can't be used.

[截图 4、5 并排]

Paying with a foreign card, the fees, and what to do if your card is declined: [how to pay for DiDi in China](/didi-payment-for-foreigners/).

### H2：Help, lost items and wrong fares（id="help"）

DiDi's customer service (DiDi Service in the app) starts with an AI assistant and asks whether you want English or 中文. There's a **Safety Hotline** button at the top right, and **Switch Trip** lets you pick the ride you need help with. DiDi says its English customer service runs 24/7.

[截图 6]

For a wrong fare or a lost item, take a screenshot of the trip first, then raise it with customer service.

### H2：Phrases to show your driver（id="phrases"）

| English | Show this |
|---|---|
| The last digits of my phone number are ____ | 我的手机尾号是 ____ |
| I'm at the pickup point. Where are you? | 我在上车点，你在哪里？ |
| I don't speak Chinese. Please send me a message. | 我不会说中文，请发消息给我。 |
| Please follow the route in the app. | 请按导航路线走。 |
| Please stop here. | 请在这里停车。 |
| Could you open the trunk, please? | 麻烦开一下后备箱。 |

### H2：FAQ（8 个）

- **Can foreigners use DiDi in China?** Yes. The app works in English, and DiDi says it supports global mobile number login. You'll need to receive one SMS code to sign up.
- **Which DiDi app should I download?** The one sold by Didi Chuxing (Beijing) Network Platform Technology Co., Ltd. Its name varies by App Store country; in the US store it's "DiDi China: Ride Hailing".
- **How do I change DiDi to English?** Account → gear icon → Language → English → 完成 (Done) → Confirm.
- **Can I search for places in English?** Yes, it worked in my test. English names can be wrong, though, so check the pin on the map.
- **What does "Upfront Fare" mean?** It's the fixed price for an app ride. Taxis show "Est.", an estimate.
- **Can I pay DiDi in cash?** Only on taxi trips: choose Cash when DiDi asks how you'll pay. Coupons can't be used with cash.
- **Why does the driver ask for my phone number?** To check you're the right passenger. Confirm the last digits; the trip may not start without them. If you don't speak Chinese, show the digits on your phone.
- **What if the driver takes a different route?** Ask the driver, or contact DiDi's customer service straight away.

### LinBox 和 Related guides

LinBox 保持现状（里面原有的按钮都不动）。

Related guides（8 个，标签用各页当前的 H1）：
1. /didi-payment-for-foreigners/
2. /amap-english-mode-guide-2026/#taxi
3. /alipay-for-foreigners/
4. /china-airport-arrival-guide/
5. /beijing-airport-to-city-guide/
6. /china-train-booking-foreigners-12306/
7. /china-metro-guide/
8. /first-trip-to-china/

删掉 /china-train-travel-guide/ 和长城一日游，保持 8 个以内。

### Official or primary sources（整体替换）

1. DiDi's official App Store listing (English interface, global mobile number login, in-app translation, international bank cards, 24/7 English customer service): https://apps.apple.com/us/app/didi-china-ride-hailing/id554499054
2. Beijing government: Transportation for new arrivals (foreign numbers work, the last four digits of your phone number, most drivers speak Chinese) (August 2024): https://english.beijing.gov.cn/latest/specials/essentialtipsfornewarrivals/transportation/202408/t20240830_3785706.html
3. Guangzhou Foreign Affairs Office via GDToday: DiDi's English version and the Alipay and WeChat mini programs (April 2025): https://www.newsgd.com/node_5c070fdd03/95a7622cf1.shtml
4. 现有的 Google Play 链接保留

删掉：上海政府指南、滴滴客服页这两条。

---

## 6. 转化

- **Quick answer 下方**：gig 3 卡片
- **文末**：LinBox 不变
- 整页只留这两处 CTA

---

## 7. 内链

| 页面 | 加在哪一段 | 锚文本 | 链到 |
|---|---|---|---|
| /china-airport-arrival-guide/ | 打车或网约车那段 | how to use DiDi in English | 本页 |
| /first-trip-to-china/ | 交通那段 | DiDi in English, step by step | 本页 |
| /3-day-beijing-itinerary/ | 交通那段 | book a DiDi in English | 本页 #book |
| /3-day-shanghai-itinerary/ | 交通那段 | book a DiDi in English | 本页 #book |
| /3-day-guangzhou-itinerary/ | 交通那段 | book a DiDi in English | 本页 #book |
| /3-day-shenzhen-itinerary/ | 交通那段 | book a DiDi in English | 本页 #book |

---

## 8. 站外：Facebook 群

"外国人怎么用滴滴"是群里的常见问题。回答模板：

> DiDi works in English: Account → gear icon → Language → English → tap 完成 → Confirm. When you book, app rides show an "Upfront Fare" (fixed) and taxis show "Est." (an estimate). Two things locals know: check the pickup point before you go, because DiDi moves it if the road doesn't allow stopping, and be ready to tell the driver the last digits of your phone number, because the trip may not start without them. If you don't speak Chinese, just show the digits. Cash only works on taxi trips. Screenshots here: [link]

---

## 9. 给 Claude Code 的指令

```
先运行 pwd，确认当前目录是 ~/ChinaTravel-AI-Buddy。不是的话立刻停下，什么都不要改，告诉我。

是的话：git pull origin main。确认 docs/seo/didi-guide-update.zip 在，解压到 docs/seo/didi-guide-update/，里面应该有 didi-guide-spec.md 和 didi-shots/1.png 到 7.png。

0. 先只读检查，不改任何东西：/didi-in-china-for-foreigners/ 和 /didi-payment-for-foreigners/ 用到的文件最近 7 天是谁提交的；有没有 10-23 以后还在改这两页、又没合进 main 的分支、worktree 或 stash。有的话立刻停下，告诉我是哪个、谁做的。没有就继续

1. 按 didi-guide-spec.md 第 5 节改版 /didi-in-china-for-foreigners/（网址不改）：
   - title、meta description、署名行、Quick answer、CTA 卡片按第 5 节替换。H1 不改
   - 正文按第 5 节的结构、顺序和英文文案重写。文案已经定稿，直接用，不要改写、不要扩写。锚点 id：download、english、book、pickup、ride、pay、help、phrases。表格做成正常的 HTML 表格。LOCAL NOTE 用和 Amap 页一样的样式。第 5 节没有的段落全部删掉
   - FAQ 换成第 5 节的 8 个，FAQ 结构化数据同步更新
   - 如果这页现在用的是旧的页面数据文件，改成和 Amap、支付宝地铁、滴滴支付页同一套渲染
2. 按第 11 节修改 /didi-payment-for-foreigners/
3. 截图按第 4 节的位置和 alt 放，两个页面共用同一份图片文件。和 Amap 页一样生成 640 宽的 WebP；单张最宽 300px；同一行的几张并排，每张最宽 220px。截图已经打好码，不要再改图
4. 滴滴使用页：文末 LinBox 不动；Related guides 按第 5 节换成 8 个；官方来源按第 5 节替换
5. 按第 7 节，在那几个页面的正文里加指向滴滴使用页的链接
6. 两个滴滴页的 lastmod 和 "Last reviewed" 改成今天；其他页面只加了链接、内容没变的，日期不动
7. 跑项目自带的 SEO 检查和测试。检查脚本里这两页按旧文案定的规则，按新文案更新；滴滴支付页原来"旧措辞回来就报错"的规则保留，再加一条："don't plan on cash" 这句回来也报错

验收：合回 main 并部署，然后用带 ?cb=随机数 的网址检查正式站：
- 滴滴使用页返回 200，title、meta description、H1、署名行和第 5 节一致；8 个锚点 id 都在；6 张截图都返回 200、都有 alt；FAQ 是 8 个，结构化数据和页面一致；Fiverr 链接 https://www.fiverr.com/s/p3dZbQR、LinBox 和 lin@chinaeasebuddy.com 都在
- 滴滴支付页：第 11 节的 6 处都改了；页面上不再出现 "don't plan on cash" 和 "doesn't name the card networks"；新加的 3 张截图返回 200、有 alt；FAQ 结构化数据和页面一致
- 第 7 节每个页面都能找到指向滴滴使用页的链接
- 全站没有内部链接指向被 301 的网址

最后把第 0 步的结果和验收结果一起贴给我。
```

---

## 10. 之后可以补

- 下次真打车：截一张和司机的聊天页（看自动翻译），一张上车前核对车牌的页面，发给 Claude 补进 #pickup 和 #ride
- 滴滴提示有新版本（8.x），更新以后如果切英文的路径变了，告诉 Claude

---

## 11. 顺带修正：/didi-payment-for-foreigners/

实测发现两处和这页现在的写法不一样：叫出租车可以付现金；滴滴 App 里能绑的卡写明了是 UnionPay、Visa、MasterCard、JCB、Diners。改 6 处，其他文案不动：

1. **署名行**换成：

```
Maintained by Lin · Checked in the DiDi app (7.2.14) and against official sources, October 24, 2026
```

2. **Quick answer** 第 1 条换成：

> 1. **In the DiDi China app.** Add your card in the app. DiDi's official listing says the app works in English, accepts foreign phone numbers and takes international bank cards. In the app, the card option lists UnionPay, Visa, Mastercard, JCB and Diners.

   Quick answer 最后一段里的 "And don't plan on cash: DiDi rides are paid in the app." 换成：

> Cash only works on taxi trips: DiDi lets you choose Cash when you book a taxi, and coupons can't be used then.

3. **#compare 表格** "Cards" 一行、"DiDi China app" 那一格换成：

> UnionPay, Visa, Mastercard, JCB and Diners, as listed in the app (October 2026)

   在 "My advice" 那段后面加一句，再放截图 4（单张）：

> Booking a taxi? DiDi also lets you pay cash on taxi trips, as long as you don't use a coupon.

4. **#card 第 2 步**换成：

> 2. In **Account**, open **My Wallet**, then **Payment Methods**, and enable **Credit / Debit Card**. The app lists UnionPay, Visa, Mastercard, JCB and Diners. Your bank may ask you to confirm with a code or in its app.

   第 4 步后面放截图 7、5（并排）。

5. **FAQ "Which cards does DiDi accept?"** 的回答换成：

> In the app, the Credit / Debit Card option lists UnionPay, Visa, Mastercard, JCB and Diners (checked October 24, 2026). Through Alipay or WeChat Pay, cards with UnionPay, Visa, Mastercard, American Express, JCB, Diners Club or Discover logos may be accepted.

6. **FAQ "Can I pay the DiDi driver in cash?"** 的回答换成：

> Only on taxi trips. When you book DiDi's Taxi option, the app asks whether you'll pay online or in cash; coupons can't be used with cash. Other ride types are paid online.
