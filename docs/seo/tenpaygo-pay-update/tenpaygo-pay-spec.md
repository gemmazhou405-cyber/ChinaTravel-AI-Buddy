# TenPayGo 页补充：在店里付款的实测结果

> **页面**：https://chinaeasebuddy.com/tenpaygo-for-tourists/（网址不改）
> **日期**：2026-10-25
>
> **你要做的（1 分钟）**
> 1. 下载 tenpaygo-pay-update.zip，用访达拖进 `ChinaTravel-AI-Buddy/docs/seo/`
> 2. 把第 4 节的指令粘给 Claude Code
> 3. 等它报告上线以后：GSC 和 Bing 再提交一次这个网址

---

## 1. 这次补什么

10-25 下午在东莞一家店里，用 TenPayGo 出示付款码、绑定的 Monzo Mastercard 付了 ¥4.90：
- 收银员扫码以后，手机上弹出确认页：商户名、金额、"International Card Fee"一行、扣哪张卡，再点 **Pay**
- **International Card Fee 显示 ¥0.00，原价 ¥0.15 被划掉**。¥0.15 正好是 ¥4.90 的 3%，也就是说标准是 3%，这一笔免了
- 付款成功页同样显示 Order Amount ¥4.90、International Card Fee ¥0.00（¥0.15 划掉）

这是竞品都没有的第一手数据：手续费在点 Pay 之前就显示，小额这笔是免的。

**没测的，页面上不写**：¥200 以上的单笔手续费实际收多少；银行账单上显示什么商户名和汇率。

截图（已打码：付款条码、商户名、卡号后四位）：
- 15：付款确认页
- 16：付款成功页

---

## 2. 改动（只改下面这些，其他文案不动）

### Title（56 字符）

```
TenPayGo Review (2026): I Tested Sign-Up, Payment & Fees
```

### Meta description（144 字符）

```
TenPayGo, tested in China: email-only sign-up, a UK Mastercard, a ¥4.90 shop payment with the 3% card fee waived, and the Shenzhen transit card.
```

### 署名行

```
Maintained by Lin · Tested on iPhone 14 (iOS 18.5), TenPayGo 1.1.2, Dongguan, October 24–25, 2026
```

### Quick answer

第一段最后一句 "I set it up on October 24, 2026:" 换成：

```
I set it up on October 24, 2026, and paid at a shop the next day:
```

在 **Cards** 那一条后面加一条：

> - **Paying:** I showed my payment code at a shop and paid ¥4.90. The ¥0.15 international card fee (3%) was crossed out, so I paid no fee.

### #pay

在截图 8、9 那一行后面、"Never send a photo..." 那句前面，加：

> **My test, October 25, 2026:** I paid ¥4.90 at a shop in Dongguan by showing my payment code. After the cashier scanned it, TenPayGo showed a confirmation screen with the shop's name, the amount, an International Card Fee line and the card it would charge. I tapped **Pay** and it went through.

后面放截图 15、16（并排，每张最宽 220px）：

| 编号 | alt |
|---|---|
| 15 | TenPayGo confirmation screen for a ¥4.90 payment, with the International Card Fee shown as ¥0.00 and ¥0.15 crossed out |
| 16 | TenPayGo Payment Successful screen for ¥4.90 with no international card fee |

### #fees

"Paying" 那一条整条换成：

> - **Paying:** on my ¥4.90 payment, the International Card Fee line showed ¥0.00, with ¥0.15 (3%) crossed out, so no fee was charged. TenPayGo runs on Weixin Pay, and for foreign cards Weixin Pay and Alipay generally charge no fee on payments of ¥200 or less; above ¥200, a 3% fee may apply to the whole amount (Shanghai government, September 2026). The fee line appears before you tap Pay, so check it on bigger payments.

### FAQ：第 5 个（Does TenPayGo charge fees?）的回答换成

> On my ¥4.90 test payment, the International Card Fee was ¥0.00, with the usual 3% (¥0.15) crossed out. For foreign cards, Weixin Pay generally charges no fee on payments of ¥200 or less and may charge 3% of the whole amount above that, so check the fee line before you tap Pay.

FAQ 结构化数据同步更新。

---

## 3. 站外：Facebook 群回答模板（替换旧的）

> If WeChat won't let you sign up, try TenPayGo. It's Tencent's own app for visitors. I signed up with just an email, linked a UK Mastercard (my bank's check was ¥0, nothing charged) and paid ¥4.90 at a shop by showing my code: the 3% card fee was crossed out, so I paid nothing extra. It works at shops that take WeChat Pay. In Shenzhen it also has a metro and bus card. Keep Alipay too, for DiDi and metro codes in other cities. Screenshots here: [link]

---

## 4. 给 Claude Code 的指令

```
先运行 pwd，确认当前目录是 ~/ChinaTravel-AI-Buddy。不是的话立刻停下，什么都不要改，告诉我。

是的话：git pull origin main。确认 docs/seo/tenpaygo-pay-update.zip 在，解压到 docs/seo/tenpaygo-pay-update/，里面应该有 tenpaygo-pay-spec.md 和 tenpaygo-shots/15.png、16.png。找不到就停下告诉我。

1. 先只读检查：/tenpaygo-for-tourists/ 用到的文件，10-24 你那次提交以后有没有别人改过；有没有还没合进 main 的分支、worktree 或 stash 在改这一页。有的话停下告诉我
2. 按 tenpaygo-pay-spec.md 第 2 节改 /tenpaygo-for-tourists/：只改第 2 节列出的地方，其他文案不动。FAQ 结构化数据同步更新
3. 截图 15、16 按第 2 节放在 #pay，和 1-14 号用同一套处理：640 宽 WebP，并排每张最宽 220px。截图已经打好码，不要再改图
4. 本页 lastmod 和 "Last reviewed" 改成今天；其他页面不动
5. 跑项目自带的 SEO 检查和测试；检查脚本里这一页的规则按新文案更新

验收：合回 main 并部署，然后用带 ?cb=随机数 的网址检查正式站：
- 本页返回 200，title、meta description、署名行和第 2 节一致
- Quick answer 里有 "Paying" 那一条；#pay 里有 "My test, October 25, 2026"；#fees 里有 "¥0.15 (3%) crossed out"
- 截图 15、16 返回 200、有 alt；原来的 1-14 号截图都还在
- FAQ 是 8 个，结构化数据和页面一致
- 全站没有内部链接指向被 301 的网址

最后把第 1 步的结果和验收结果一起贴给我。
```
