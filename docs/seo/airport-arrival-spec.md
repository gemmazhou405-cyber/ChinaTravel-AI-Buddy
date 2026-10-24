# 机场入境页改版方案 · 定稿（官方来源版，不需要实测）

> **页面**：https://chinaeasebuddy.com/china-airport-arrival-guide/（网址不改）
> **日期**：2026-10-24
>
> **你要做的（1 分钟）**
> 1. **先等火车那条指令跑完**（两条同时改同一个仓库会冲突）
> 2. 下载这个文件，用访达拖进 `ChinaTravel-AI-Buddy/docs/seo/`
> 3. 把第 9 节的指令粘给 Claude Code
> 4. 等它报告上线以后：GSC「请求编入索引」，Bing「Request indexing」

---

## 1. 为什么是这一页、这次的角度

- **数据**：5 周 36 次展示，平均排名 11.8，离前 5 不远。
- **它是枢纽页**：每个来中国的人都要经过这一步。今天升级过的页面（滴滴、TenPayGo、地铁刷卡、微信验证）都能从这里链进去，读者落地以后的每一步都有现成的详细页。
- **现在这页的问题**：入境卡、指纹、海关这三块都只写"以官方为准"，没有一条具体规则。海关一节没有现金申报额度，入境一节没有指纹年龄，豁免入境卡的人也没列。
- **这次的角度：把官方规则写成具体数字。** 全部来自国家移民管理局、中国驻外使馆通知、海关总署（经上海市政府英文网发布）：
  - 入境卡：2025-11-20 起可以在线填，免费；4 个填写渠道；7 类人可以免填（例如 24 小时内不出机场的过境旅客）；没提前填也可以在口岸扫码、用自助设备或填纸质卡
  - 指纹：14 岁到 70 岁（含）的外国人入境要留指纹
  - 海关：现金 2 万元人民币或等值 5,000 美元以上要申报；12 度以上的酒 1,500 毫升以上、香烟 400 支以上要申报；非居民留在中国的个人物品价值 2,000 元以上要申报
  - 进城：北京、上海、广州、深圳地铁可以直接刷外国卡（链到支付宝地铁页）；滴滴在机场的上车点和手机尾号（链到滴滴页）
- **署名行**写"按国家移民管理局和中国海关规则核对"，不写"实测"。H1 不改。
- **精准客户**：要设置 eSIM、支付宝和滴滴的人，正好对应 gig 3。

---

## 2. 目标（11-20 判定时看）

| 搜索词 | 现在排名 | 目标 |
|---|---|---|
| 本页平均排名 | 11.8 | 前 5 |
| china airport guide / china airport arrival | 67 / 无数据 | 前 20 |
| china customs cash limit、china arrival fingerprints 这类 | 无数据 | 出现展示 |

---

## 3. 已核实的事实

| 事实 | 来源 |
|---|---|
| 2025-11-20 起可以在线填入境卡；渠道：国家移民管理局网站、国家政务服务平台、"移民局 12367" App、微信或支付宝小程序；没提前填的，到口岸扫码、用自助设备或填纸质卡；7 类人可免填，包括外国人永久居留身份证持有人、团体签证持有人、24 小时内不出口岸限定区域的过境旅客；咨询电话 +86-10-12367 | 中国驻瑞典使馆通知，2025-11-26 |
| 入境卡免费，移民局提醒注意收费的假网站 | 国家移民管理局（现有来源） |
| 14 岁（含）到 70 岁（含）的外国人入境要留指纹；外交护照持有人等可以免；入境要出示护照和签证或其他入境许可；入境卡上的在华住址要如实填，住酒店写具体地址；部分口岸有自助通道，主要给持永久居留证或长期居留许可的外国人 | 国家移民管理局《Welcome to China》 |
| 无申报走绿色通道，有申报走红色通道；人民币现金 2 万元及以上、外币现金折合 5,000 美元及以上要申报；12 度及以上的酒 1,500 毫升及以上、香烟 400 支及以上、雪茄 100 支及以上、烟丝 500 克及以上要申报；非居民留在境内的个人物品价值 2,000 元及以上要申报；来自动植物疫区的水果、茄科蔬菜、活动物（宠物猫狗除外）、动物产品禁止入境 | 海关总署，经上海市政府英文网 |
| 外国人住在酒店以外的地方，要在入住后 24 小时内向当地公安机关登记 | 《出境入境管理法》第三十九条 |

**没核实到的，页面上一律不写**：各机场排队要多久；哪些机场有外国人能用的自助通道；各机场地铁末班车时间。

---

## 4. 截图

这页不放截图。

---

## 5. 新页面（英文定稿）

### Title（56 字符）

```
China Airport Arrival Guide (2026): Arrival Card to Taxi
```

### Meta description（149 字符）

```
Landing in China: the free online arrival card, fingerprints for ages 14-70, customs limits like ¥20,000 in cash, then metro, taxi or DiDi into town.
```

### H1（不改）

```
China Airport Arrival: From Immigration to Your Hotel
```

### 署名行（日期用部署当天，和 "Last reviewed" 一致）

```
Maintained by Lin · Rules checked against China's National Immigration Administration and China Customs, October 25, 2026
```

### Quick answer（框）

> Landing in China takes four steps:
>
> 1. **Arrival card:** fill it in free online before you fly, or at the airport. Some travelers are exempt, including passengers transiting within 24 hours who don't leave the airport.
> 2. **Immigration:** show your passport and your visa or entry permit. If you're 14 to 70, your fingerprints are taken.
> 3. **Customs:** use the green channel unless you're carrying ¥20,000 or more in cash (or US$5,000 or more in foreign currency), 1.5 liters or more of alcohol, 400 or more cigarettes, or goods worth ¥2,000 or more that will stay in China.
> 4. **Into the city:** in Beijing, Shanghai, Guangzhou and Shenzhen you can tap a Visa or Mastercard at the metro gate. Otherwise take the official taxi queue, or a DiDi from the ride-hailing pickup area.
>
> Jump to: [Before you fly](#before) · [Arrival card](#arrival-card) · [Immigration](#immigration) · [Customs](#customs) · [Data and payment](#phone) · [Into the city](#transfer) · [Late arrivals](#late) · [Phrases](#phrases)

### CTA 卡片（紧跟在 Quick answer 下面）

> **Flying soon?** I'll get your eSIM, Alipay and DiDi working on your phone before you fly, so the airport is the easy part.
> [See the app setup service on Fiverr →](https://www.fiverr.com/s/p3dZbQR)

### H2：Before you fly（id="before"）

- Check whether you need a visa or can enter visa-free: [China visa-free travel guide](/china-visa-free-travel-guide/) · [240-hour visa-free transit](/china-240-hour-visa-free-transit-2026/).
- Fill in the arrival card online (next section).
- Install an eSIM or set up roaming before you fly: [eSIM guide](/china-esim-internet-guide/).
- Set up a way to pay: [Alipay](/alipay-for-foreigners/), or [TenPayGo](/tenpaygo-for-tourists/) for shops that take WeChat Pay.
- Save your hotel's address in Chinese and take a screenshot of your booking.

### H2：The arrival card（id="arrival-card"）

Since November 20, 2025, you can fill in China's arrival card online before you travel. It's free; the National Immigration Administration warns about websites that charge for it.

- **Where:** the National Immigration Administration website, the Government Service Platform, the NIA 12367 app, or the WeChat or Alipay mini program.
- **Didn't do it in advance?** At the immigration area you can scan a QR code, use the self-service devices or fill in a paper card.
- **Who's exempt:** seven groups, including holders of a Foreign Permanent Resident ID Card, group visa holders, and passengers transiting within 24 hours who stay inside the airport's restricted area.
- **Questions:** the immigration hotline is +86-10-12367.

Step by step: [how to fill in China's online arrival card](/china-online-arrival-card-2026/).

### H2：Immigration（id="immigration"）

1. Give the officer your passport and your visa or other entry permit.
2. If you're aged 14 to 70, your fingerprints are taken. Holders of diplomatic passports are among those exempt.
3. Your address in China must be accurate. If you're staying in a hotel, use its full address.

Some airports have automatic e-channels, but they're mainly for foreigners with a Chinese permanent residence ID or a long-term residence permit. Most visitors use the staffed counters.

### H2：Baggage and customs（id="customs"）

If your bag is missing or damaged, report it at the airline's baggage desk before you leave the baggage hall.

Then choose a customs channel: **green** if you have nothing to declare, **red** if you're carrying any of these:

| Declare if you're carrying | Limit |
|---|---|
| Chinese yuan in cash | ¥20,000 or more |
| Foreign currency in cash | US$5,000 or more in total |
| Alcoholic drinks of 12% or stronger | 1,500 ml or more |
| Cigarettes / cigars / tobacco | 400 or more / 100 or more / 500 g or more |
| Personal items that will stay in China (non-residents) | Worth ¥2,000 or more |

Fruit, solanaceous vegetables (such as tomatoes, peppers and eggplants), live animals other than pet cats and dogs, and animal products are banned when they come from places with animal or plant disease outbreaks. Leave them at home.

### H2：Before you leave the airport: data and a test payment（id="phone"）

- Switch on your eSIM or roaming and check that you have data.
- Make one small payment, like a bottle of water, to check that Alipay, WeChat Pay or TenPayGo works with your card.
- Keep a physical card and some cash as a backup.

### H2：Getting into the city（id="transfer"）

- **Metro:** in Beijing (including both airport express lines), Shanghai, Guangzhou and Shenzhen you can tap a contactless Visa or Mastercard at the gate; in Shenzhen, use a gate that shows your card's logo. Elsewhere, use Alipay's ride code. [How to pay for the metro](/alipay-metro-qr-transport-code-guide/#card)
- **DiDi:** follow the signs for the ride-hailing pickup area (网约车上车点), check the pickup point in the app, and confirm the last digits of your phone number with the driver. [How to use DiDi](/didi-in-china-for-foreigners/#pickup)
- **Long rides:** an airport ride can cost more than ¥200. Paid through Alipay or WeChat Pay with a foreign card, that may add a 3% fee. [DiDi fees](/didi-payment-for-foreigners/#fees)
- **Taxi:** use the official taxi queue, and ignore anyone who offers you a ride inside the terminal.
- **Beijing:** [Beijing airport to the city: PEK vs PKX](/beijing-airport-to-city-guide/)

### H2：Late arrivals（id="late"）

- Tell your hotel if you'll arrive late.
- Check the last metro or airport train before you land. After that, use the taxi queue or DiDi.
- If you're staying somewhere other than a hotel, such as a friend's home, you must register with the local police within 24 hours of arriving: [how to register your stay online](/nia-12367-online-accommodation-registration-guide/).

### H2：Phrases to show at the airport（id="phrases"）

| English | Show this |
|---|---|
| Where is the metro? | 地铁在哪里？ |
| Where is the taxi queue? | 出租车在哪里排队？ |
| Where is the ride-hailing pickup area? | 网约车上车点在哪里？ |
| Please take me to this address. | 请带我去这个地址。 |
| My luggage hasn't arrived. | 我的行李没有到。 |
| Where can I buy a SIM card? | 哪里可以买电话卡？ |

### H2：FAQ（6 个）

- **Do I need to fill in an arrival card?** Most foreign visitors do. You can do it free online before you fly, or at the airport. Some groups are exempt, such as Foreign Permanent Resident ID Card holders and passengers transiting within 24 hours who stay inside the airport.
- **Is the online arrival card free?** Yes. The National Immigration Administration warns about websites that charge for it.
- **Will my fingerprints be taken?** Yes, if you're aged 14 to 70. There are some exemptions, such as diplomatic passport holders.
- **How much cash can I bring into China?** Declare it at customs if you're carrying ¥20,000 or more in Chinese yuan, or US$5,000 or more in foreign currency.
- **What's the easiest way from the airport to the city?** In Beijing, Shanghai, Guangzhou and Shenzhen, the metro: just tap your card at the gate. Otherwise, the official taxi queue or a DiDi from the ride-hailing pickup area.
- **Should I set up payments before I fly?** Yes. Then make one small test payment at the airport before you leave.

### LinBox 和 Related guides

LinBox 保持现状（里面原有的按钮都不动）。

Related guides（8 个，标签用各页当前的 H1）：
1. /china-online-arrival-card-2026/
2. /china-240-hour-visa-free-transit-2026/
3. /china-esim-internet-guide/
4. /alipay-metro-qr-transport-code-guide/
5. /didi-in-china-for-foreigners/
6. /tenpaygo-for-tourists/
7. /beijing-airport-to-city-guide/
8. /first-trip-to-china/

### Official or primary sources（整体替换）

1. National Immigration Administration: online arrival card form: https://s.nia.gov.cn/ArrivalCardFillingPC/
2. National Immigration Administration: warning about fake arrival card websites: https://en.nia.gov.cn/n147418/n147463/c191530/content.html
3. Chinese Embassy in Sweden: Notice on the online filling of China's arrival card (November 2025): https://se.china-embassy.gov.cn/eng/lsyfw/202511/t20251126_11760567.htm
4. National Immigration Administration: Welcome to China (fingerprints, e-channels, entry documents): https://www.nia.gov.cn/2022en/files/basic-html/page10.html
5. General Administration of Customs, via the Shanghai government: customs clearance guide for inbound passengers: https://english.shanghai.gov.cn/en-CustomsClearance/20231212/9a3c7f512d464e0798be3fc76c8dd6f2.html

删掉：中国驻美使馆页面、海关总署首页、2024 年 gov.cn 那条（标注和网址对不上）。

---

## 6. 转化

- **Quick answer 下方**：gig 3 卡片（新增）
- **文末**：LinBox 不变
- 整页只留这两处 CTA

---

## 7. 内链

| 页面 | 加在哪一段 | 锚文本 | 链到 |
|---|---|---|---|
| /first-trip-to-china/ | 落地或机场那段 | what happens when you land | 本页 |
| /china-travel-checklist/ | 入境或机场那段 | arrival card, immigration and customs | 本页 |
| /china-online-arrival-card-2026/ | 文末 | after the arrival card: immigration, customs and getting into the city | 本页 |
| /beijing-airport-to-city-guide/ | 开头 | arrival card, immigration and customs first | 本页 |

---

## 8. 站外：Facebook 群

"落地以后要做什么"是群里的常见问题。回答模板：

> Four steps: 1) fill in the arrival card online before you fly (it's free; there are fake sites that charge), or do it at the airport; 2) at immigration, show your passport and visa, and expect fingerprints if you're 14 to 70; 3) at customs, use the green channel unless you're carrying ¥20,000+ in cash or US$5,000+ in foreign currency; 4) in Beijing, Shanghai, Guangzhou and Shenzhen, just tap your Visa or Mastercard at the metro gate, or take the taxi queue or a DiDi from the pickup area. Full checklist: [link]

---

## 9. 给 Claude Code 的指令

```
先运行 pwd，确认当前目录是 ~/ChinaTravel-AI-Buddy。不是的话立刻停下，什么都不要改，告诉我。

是的话：git pull origin main，确认 docs/seo/airport-arrival-spec.md 在。

0. 先只读检查，不改任何东西：/china-airport-arrival-guide/ 用到的文件最近 7 天是谁提交的；有没有 10-23 以后还在改这一页、又没合进 main 的分支、worktree 或 stash。有的话立刻停下，告诉我是哪个、谁做的。没有就继续

1. 按 docs/seo/airport-arrival-spec.md 第 5 节改版 /china-airport-arrival-guide/（网址不改）：
   - title、meta description、署名行、Quick answer、CTA 卡片按第 5 节替换。H1 不改。署名行日期用今天，和 "Last reviewed" 一致
   - 正文按第 5 节的结构、顺序和英文文案重写。文案已经定稿，直接用，不要改写、不要扩写。锚点 id：before、arrival-card、immigration、customs、phone、transfer、late、phrases。表格做成正常的 HTML 表格。第 5 节没有的段落全部删掉
   - FAQ 换成第 5 节的 6 个，FAQ 结构化数据同步更新
   - 如果这页现在用的是旧的页面数据文件，改成和前几页同一套渲染
2. 文末 LinBox 不动；Related guides 按第 5 节换成 8 个；官方来源按第 5 节整体替换
3. 按第 7 节，在那几个页面的正文里加指向本页的链接
4. 本页 lastmod 和 "Last reviewed" 改成今天；其他页面只加了链接、内容没变的，日期不动
5. 跑项目自带的 SEO 检查和测试。检查脚本里这一页按旧文案定的规则，按新文案更新

验收：合回 main 并部署，然后用带 ?cb=随机数 的网址检查正式站：
- 本页返回 200，title、meta description、H1、署名行和第 5 节一致
- 8 个锚点 id 都在；5 条官方来源链接都在；FAQ 是 6 个，结构化数据和页面一致
- Fiverr 链接 https://www.fiverr.com/s/p3dZbQR 在；LinBox 和 lin@chinaeasebuddy.com 还在
- 第 7 节每个页面都能找到指向本页的链接
- 全站没有内部链接指向被 301 的网址

最后把第 0 步的结果和验收结果一起贴给我。
```
