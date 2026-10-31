# AGENTS.md

这个仓库（chinaeasebuddy.com）有两个 AI 编码工具在改：Codex 和 Claude Code。下面的规则两边都要遵守。

## 开始改之前

- 先 git fetch origin，基于最新的 origin/main 改。main 上有你没见过的新提交，先看完再动手。
- 另一个工具正在改同一批文件（有没合并的分支或 PR）时，先停下问用户。
- 没提交的草稿（例如 docs/launch/*.ts）是用户自己的：不要改、不要提交、不要删除。

## 已定的产品决定

这些是用户定下的，不要改回去。要改先问用户，改完同步更新这个文件。

- 定制行程（Trip Plan）$39，行程审核 from $20。咨询框 src/data/planningHelp.json 和行程邮件 functions/_shared/itinerary-email.js 都用这个价格，不要写 "from $40"。
- 导游：只推荐持证英文导游，客户自己和导游预订、付款。不报价，不经手导游或司机的钱，不提供私人司机。英文文案以 planningHelp.json 里的 paidServices 和 serviceNote 为准。
- 付费咨询走邮件 lin@chinaeasebuddy.com。网站不链 Fiverr。网站上的 Gumroad 链接只用于 Trip Pass 和 Group Pass，不链 Gumroad 上的 Trip Plan 商品。
- Buddy 消息：每天先用免费 10 条，再扣 Pass；Pass 用完或过期后照样有每天免费 10 条。上游超时、说不清 AI 有没有回复时，Pass 那条不退，免费那条退。改额度逻辑后跑 npm run test:pass-chat-quota。
- 7 个 App 设置类页面的卡片是免费路线检查：mailto:lin@chinaeasebuddy.com?subject=My%20China%20route，按钮 "Email Lin your route →"。地图对比、出行清单、机场入境 3 页的卡片链到其他指南。

## 已知情况

- npm run audit:p0-buddy-menu 有 3 项还在查旧的 Firebase 登录 + Firestore 设计（ChatModal 登录接口、Firebase token 校验、usageRequests 防重复），main 上一直失败，不是新改动造成的。CI 不跑它。
