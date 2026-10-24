# 微信好友验证页改版方案 · 定稿（官方来源版，不需要实测）

> **页面**：https://chinaeasebuddy.com/wechat-verification-without-friend-qr-2026/（网址不改）
> **日期**：2026-10-24
>
> **你要做的（1 分钟）**
> 1. 下载这个文件，用访达拖进 `ChinaTravel-AI-Buddy/docs/seo/`
> 2. 把第 9 节的指令粘给 Claude Code
> 3. 等它报告上线以后：GSC「网址检查 → 请求编入索引」，Bing「URL Inspection → Request indexing」

---

## 1. 为什么是这一页、这次的角度

- **数据**：5 周 63 次展示，平均排名 7.2，还有 1 次点击。还没升级的页面里，它离前 5 最近，而且展示量最大。"wechat verification without friend 2026" 排第 9.25。
- **原来排在最后的原因**：要境外手机号才能实测注册。这次不实测，改用官方来源：微信帮助中心的 3 篇文章，加上深圳市的英文城市门户 Eye Shenzhen 写明的帮忙验证规则。
- **现在这页的问题**：
  - 通篇是"以你屏幕上显示的为准""不保证"，读者最想知道的"谁能帮我验证"一条具体规则都没写
  - 唯一的官方来源只链到帮助中心首页，没有具体文章
  - 有个按钮叫 "Review my WeChat verification options"，点进去却是首页，跟原来支付宝地铁页那个假按钮一样
  - 标题约 70 个字符，搜索结果里会被截断
- **这次的角度：写清楚规则和退路。**
  - 帮忙验证的人要满足的 4 条：注册满 6 个月；过去一个月没帮别人验证过（一年最多 3 个）；过去一个月没被封过；在中国境内的话要开通微信支付
  - 没人帮的话：屏幕上有别的选项就用（验证银行卡、开通微信支付）；账号被限制时，帮助中心列了"好友辅助"和"身份证件验证"两个选项；用帮助中心的反馈表联系客服
  - 退路：不注册微信也能在微信支付的店里付款，TenPayGo 只要邮箱就能注册（我们 10-24 实测过）
  - 微信支付绑外卡要做的身份验证，和注册时的好友验证是两回事
- **署名行**写"按微信帮助中心和 Eye Shenzhen 核对"，不写"实测"。H1 不改。
- **精准客户**：卡在微信注册的人，正好对应 gig 3（App 和支付设置）。

---

## 2. 目标（11-20 判定时看）

| 搜索词 | 现在排名 | 目标 |
|---|---|---|
| wechat verification without friend 2026 | 9.25 | 前 5 |
| 本页平均排名 | 7.2 | 前 5 |
| wechat verification without friend | 18 | 前 10 |
| wechat qr code verification | 14 | 前 10 |
| who can verify wechat、wechat helper requirements 这类 | 无数据 | 出现展示 |

---

## 3. 已核实的事实

| 事实 | 来源 |
|---|---|
| 三种注册方式：手机号（选国家或地区代码、填号码、设密码）、Facebook、Apple（只限 iPhone）；验证码可能用自动语音电话发；要确认手机没屏蔽国际号码 | 微信帮助中心：Step-by-step guidance to create a WeChat Account |
| 账号被限制时：按屏幕提示选一个验证方式完成，选项包括 "Verify via asking friends to assist" 和 "Verify via ID check"；没有提示就去 WeChat Team 对话里点限制通知；失败就用反馈表，附完整截图或录屏 | 微信帮助中心：Step by step guidance to remove account restrictions |
| 帮忙的人：注册满 6 个月；在中国境内的话已开通微信支付；过去一个月没验证过别人（一年最多 3 个）；过去一个月没被封；满足这些也不保证通过；建议找中国境内的人；别把二维码公开发出去；也可以验证银行卡，或者在提供的情况下开通微信支付 | Eye Shenzhen，2024 年 10 月 |
| 微信支付绑外卡：我 → 服务 → 钱包 → 银行卡；填身份信息，用护照的话要上传复印件；手机号不一定要 +86，能收短信就行；单笔 200 元以下免手续费，200 元以上收 3%；外卡不能发红包、不能转账 | 微信帮助中心：How to Set Up International Cards for Weixin Pay |
| TenPayGo 只要邮箱加验证码就能注册，能在收微信支付的店里付款 | 本站 10-24 实测 |

**没核实到的，页面上一律不写**：什么情况下一定会触发好友验证；用 Apple 或 Facebook 注册能不能避开好友验证；客服多久回复。

---

## 4. 截图

这页不放截图。

---

## 5. 新页面（英文定稿）

### Title（56 字符）

```
WeChat Verification Without a Friend (2026): What to Try
```

### Meta description（146 字符）

```
No friend to scan your WeChat QR code? See who can verify you (accounts 6+ months old, 3 a year), what else to try, and how to pay without WeChat.
```

### H1（不改）

```
WeChat Verification Without a Friend: Registration & QR Help
```

### 署名行

```
Maintained by Lin · Checked against WeChat's help center and the Eye Shenzhen guide, October 24, 2026
```

### Quick answer（框）

> Not every WeChat sign-up asks for a friend. If yours does, here's what to know:
>
> - **Who can help:** someone whose WeChat account is more than six months old, who hasn't verified anyone in the past month (three accounts a year at most), hasn't been blocked in the past month and, if they're in mainland China, has turned on WeChat Pay. Even then, approval isn't guaranteed.
> - **No helper?** If your screen offers another way, such as verifying a bank card or turning on Weixin Pay, use it. Otherwise, contact WeChat through the feedback form in its help center, with a screenshot of the error.
> - **Still stuck?** You can pay at shops that take WeChat Pay without a WeChat account. [TenPayGo](/tenpaygo-for-tourists/) signs you up with just an email; I tested it.
>
> Jump to: [Sign up](#sign-up) · [Who can help](#helper) · [No helper](#no-helper) · [Pay without WeChat](#plan-b) · [WeChat Pay checks](#wechat-pay)

### CTA 卡片（紧跟在 Quick answer 下面）

> **Flying soon?** I'll help you set up WeChat, Alipay and TenPayGo before you fly, so you're not stuck at a verification screen when you land.
> [See the app setup service on Fiverr →](https://www.fiverr.com/s/p3dZbQR)

### H2：Sign up first: the official routes（id="sign-up"）

WeChat's help center lists three ways to sign up:

- **With a phone number:** tap **Sign up via Mobile**, choose your country or region code, enter your number and set a password. The code may arrive as an automated voice call, so make sure international numbers aren't blocked on your phone.
- **With Facebook:** tap **Sign up via Facebook**.
- **With Apple (iPhone only):** tap **Sign up with Apple**.

If WeChat then shows you a QR code and asks a friend to scan it, that's the friend verification step.

### H2：Who can be your helper（id="helper"）

According to the Eye Shenzhen guide, your helper must:

- have signed up to WeChat more than six months ago
- not have verified another account in the past month (one person can verify at most three accounts a year)
- not have been blocked in the past month
- have turned on WeChat Pay, if they're in mainland China

Even when all four are true, approval isn't guaranteed, and a helper in mainland China is recommended.

**Does your helper need to be with you?** No. Many people send the QR code to their helper as a screenshot through another messaging app, and the helper scans it with WeChat. Only send it to someone you know, and never post it publicly.

### H2：No helper? What else to try（id="no-helper"）

1. **Use another option if your screen offers one.** Some sign-ups let you verify a bank card or turn on Weixin Pay instead of asking a friend.
2. **If your account is restricted later,** WeChat's help center says to follow the on-screen instructions and pick one of the options shown, such as asking friends to assist or an ID check. If there are no instructions, open the WeChat Team chat and tap the restriction notice.
3. **Contact WeChat support** through the feedback form in its help center. Include a full screenshot or a screen recording of the error.
4. **Don't pay a stranger to verify you, and don't buy an account.** You'd be handing your sign-up to someone you don't know.

### H2：Plan B: pay without WeChat（id="plan-b"）

Most visitors want WeChat so they can pay. You can do that without a WeChat account:

- **TenPayGo**, Tencent's app for visitors, pays at shops that take WeChat Pay. I signed up with just an email and a code, and linked a UK Mastercard without being charged. [My TenPayGo test](/tenpaygo-for-tourists/)
- **Alipay** works at most shops too, and also covers DiDi rides and metro ride codes. [Alipay for foreigners](/alipay-for-foreigners/)

### H2：WeChat Pay has its own identity check（id="wechat-pay"）

Friend verification is about your WeChat account. Adding a foreign card to WeChat Pay is a separate step: go to **Me → Pay and Services → Wallet → Bank Cards**, add the card and enter your identity details. If you use a passport, you'll be asked to upload a copy. Your phone number doesn't have to be Chinese, as long as it can receive SMS codes.

WeChat's help center says payments under ¥200 have no transaction fee and payments above ¥200 have a 3% fee. Foreign cards can't be used for red packets or money transfers. More: [WeChat Pay for foreigners](/wechat-pay-for-foreigners/).

### H2：FAQ（7 个）

- **Can I verify WeChat without a friend?** Sometimes. If your sign-up screen offers another way, such as verifying a bank card or turning on Weixin Pay, you can use that. If it only shows a QR code for a friend to scan, you need a helper or WeChat support.
- **Who can verify my WeChat account?** Someone who signed up to WeChat more than six months ago, hasn't verified anyone in the past month, hasn't been blocked in the past month and, if they're in mainland China, has turned on WeChat Pay.
- **How many accounts can one person verify?** At most three a year, and only one in any month, according to the Eye Shenzhen guide.
- **Can a friend verify me from another country?** They don't need to be with you: send the QR code as a screenshot through another app. A helper in mainland China is recommended, though.
- **My helper scanned the code but it failed. Why?** Check the four rules above with your helper: an account under six months old, or one that verified someone in the past month, won't work. Even when everything checks out, approval isn't guaranteed, so try another helper or contact WeChat support.
- **Can I use WeChat Pay without a WeChat account?** Not WeChat Pay itself, but TenPayGo pays at the same shops and signs you up with just an email.
- **Should I pay someone online to verify my account?** No. You'd be handing your sign-up to a stranger.

### LinBox 和 Related guides

LinBox 保持现状（里面原有的按钮都不动）。

Related guides（8 个，标签用各页当前的 H1）：
1. /tenpaygo-for-tourists/
2. /wechat-pay-for-foreigners/
3. /alipay-for-foreigners/
4. /china-payment-guide/
5. /china-travel-apps/（新增）
6. /china-esim-internet-guide/（新增：要一个能收短信的号码）
7. /didi-payment-for-foreigners/
8. /first-trip-to-china/

删掉 /alipay-metro-qr-transport-code-guide/ 和 /china-travel-budget/，保持 8 个以内。

### Official or primary sources（整体替换）

1. WeChat Help Center: Step-by-step guidance to create a WeChat account: https://cs.help.wechat.com/hc/en-us/articles/16403968439055-Step-by-step-guidance-to-create-a-WeChat-Account
2. WeChat Help Center: Step-by-step guidance to remove account restrictions: https://cs.help.wechat.com/hc/en-us/articles/16403894198543-Step-by-step-guidance-to-remove-account-restrictions
3. WeChat Help Center: How to set up international cards for Weixin Pay: https://cs.help.wechat.com/hc/en-us/articles/11975770896271-How-to-Set-Up-International-Cards-for-Weixin-Pay
4. Eye Shenzhen: How to register for a WeChat, Xiaohongshu, Douyin or Weibo account (October 2024): https://www.eyeshenzhen.com/content/2024-10/11/content_31264749.htm

删掉：帮助中心首页那条、清华的 PDF。

---

## 6. 转化

- **Quick answer 下方**：gig 3 卡片
- **文末**：LinBox 不变
- **删掉** "Review my WeChat verification options" 这个按钮（点进去是首页）
- 整页只留这两处 CTA

---

## 7. 内链

| 页面 | 加在哪一段 | 锚文本 | 链到 |
|---|---|---|---|
| /wechat-pay-for-foreigners/ | 注册或开通那一段 | stuck on friend verification | 本页 |
| /china-travel-apps/ | 讲微信的那一段 | who can verify your WeChat account | 本页 #helper |
| /first-trip-to-china/ | 装 App 或支付那一段 | WeChat verification without a friend | 本页 |
| /china-payment-guide/ | 讲微信支付的那一段 | if WeChat asks a friend to verify you | 本页 |

---

## 8. 站外：Facebook 群

"微信要好友验证怎么办"是群里的常见问题。回答模板：

> If WeChat asks a friend to verify you, your helper needs an account that's more than six months old, can't have verified anyone in the past month (three a year at most), and needs WeChat Pay turned on if they're in mainland China. They don't have to be next to you: send them a screenshot of the QR code. If you can't find anyone, you can still pay at WeChat Pay shops with TenPayGo, which signs you up with just an email (I tested it). Details: [link]

---

## 9. 给 Claude Code 的指令

```
先运行 pwd，确认当前目录是 ~/ChinaTravel-AI-Buddy。不是的话立刻停下，什么都不要改，告诉我。

是的话：git pull origin main，确认 docs/seo/wechat-verification-spec.md 在。

0. 先只读检查，不改任何东西：/wechat-verification-without-friend-qr-2026/ 用到的文件最近 7 天是谁提交的；有没有 10-23 以后还在改这一页、又没合进 main 的分支、worktree 或 stash。有的话立刻停下，告诉我是哪个、谁做的。没有就继续

1. 按 docs/seo/wechat-verification-spec.md 第 5 节改版这一页（网址不改）：
   - title、meta description、署名行、Quick answer、CTA 卡片按第 5 节替换。H1 不改
   - 正文按第 5 节的结构、顺序和英文文案重写。文案已经定稿，直接用，不要改写、不要扩写。锚点 id：sign-up、helper、no-helper、plan-b、wechat-pay。第 5 节没有的段落全部删掉，包括两个排查表格、给客服的留言模板、"If registration is unfinished before departure"
   - FAQ 换成第 5 节的 7 个，FAQ 结构化数据同步更新
   - 如果这页现在用的是旧的页面数据文件，改成和 Amap、支付宝地铁、滴滴、TenPayGo 页同一套渲染
2. 删掉 "Review my WeChat verification options" 按钮；文末 LinBox 不动；Related guides 按第 5 节换成 8 个；官方来源按第 5 节整体替换
3. 按第 7 节，在那几个页面的正文里加指向本页的链接
4. 本页 lastmod 和 "Last reviewed" 改成今天；其他页面只加了链接、内容没变的，日期不动
5. 跑项目自带的 SEO 检查和测试。检查脚本里这一页按旧文案定的规则，按新文案更新，并加一条："Review my WeChat verification options" 又出现就报错

验收：合回 main 并部署，然后用带 ?cb=随机数 的网址检查正式站：
- 本页返回 200，title、meta description、H1、署名行和第 5 节一致
- 5 个锚点 id 都在；4 条官方来源链接都在；FAQ 是 7 个，结构化数据和页面一致
- Fiverr 链接 https://www.fiverr.com/s/p3dZbQR 在；LinBox 和 lin@chinaeasebuddy.com 还在；页面不再出现 "Review my WeChat verification options"
- 第 7 节每个页面都能找到指向本页的链接
- 全站没有内部链接指向被 301 的网址

最后把第 0 步的结果和验收结果一起贴给我。
```
