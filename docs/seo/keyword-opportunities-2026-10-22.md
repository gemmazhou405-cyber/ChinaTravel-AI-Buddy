# 2026-10-22 关键词机会核对

本轮按“旅游意图 → 需求/曝光 → 同词排名机会 → 竞争页面与具体缺口”筛选。目的仍是强相关自然搜索点击。现有证据不支持把任一候选称为高流量低竞争词，也不支持再选一页反复改写。

## 四组候选与决定

以下数据均来自用户10月21日比较导出，不是本轮修改后的效果。周期标签为最近28天对比此前28天，实际起止日期未提供。页面数据格式：点击 / 展示 / 页面平均排名；查询数据另列且不混用。

| 页面 | 页面基线 | 查询证据与范围 | 公开竞争页面核对 | 本轮决定 |
| --- | --- | --- | --- | --- |
| 240小时计算器 | 0 / 10 / 22.5 | 专属导出只有 `transit through mainland` 1展示/4、`visa free china` 1/193；其余8展示查询未披露。目标计算器词覆盖未知 | HelloChinaTrip已有口岸/日期工具；Visa-Free-China有国籍、路线、口岸、日期及文件确认输入 | 保持用户指定第一优先级；修复一处已确认的静态说明冲突，然后观察。不再改标题或算法 |
| 旅行预算/费用计算器 | 0 / 109 / 27.02 | 全站 `china travel budget` 2/84、`trip to china cost` 2/95.5；不能归给本页 | 已存在城市/旅客/酒店/车辆估算工具及路线/季节/客房/额外费用估算工具 | 本页Oct22刚修改，等待精确页面Queries；不增加未经核实的细分价格 |
| 桂林阳朔三日行程 | 0 / 44 / 59.05 | 全站 `yangshuo itinerary` 14/80.64、`guilin yangshuo itinerary` 12/81；无页面归属证据 | WanderInChina已有多天数、区域、末日行程、天气和轻松方案 | 正式HTML确认Oct19的阳朔方案/车站说明仍在；先补发布核验记录，保留观察 |
| 中国最佳旅游时间 | 0 / 35 / 79.94 | 全站 `best time to visit china` 16/90.12；无页面归属证据 | ChinaTours已有月份/季节/目的地/假期/活动表 | 不能因可见查询展示最多就优先；目前不是已证实的接近前十机会 |

旧费用计算器 `/how-much-does-china-trip-cost-2026-calculator/` 已301到预算主页，其历史行不作为独立现存页面机会。计算器页面平均22.5不等于计算器目标词排名22.5。其两个已披露查询也不证明目标工具词没有覆盖，隐藏数据保持未知。

## 竞争证据来源与边界

10月22日读取以下产品/编辑方公开页面，只记录可见结构与字段，未运行其计算器、核实报价或采用其政策数字/“官方”自称：

- https://hellochinatrip.com/china-240h-visa-free-calculator/
- https://www.visa-free-china.com/
- https://hellochinatrip.com/china-travel-cost-calculator/
- https://www.chinafornewcomers.com/budget.html
- https://www.wanderinchina.com/destinations/guilin/itineraries/
- https://www.chinatours.com/china-travel-insights/the-best-time-to-visit-china/

公开检索样本不等于指定国家/设备的实时Google结果，不能据此填写前十位置、DR、外链或KD。竞品已有专门工具/详细内容，足以否定“没有同类页面”的假设，不能据此量化竞争难度。

Ahrefs的项目列表和关键词概览本轮均返回 `Insufficient plan`，未取得任何数值。尝试US市场的三个工具候选词不代表本站已决定只做美国市场。月搜索量、KD及各国差异继续留未知，不以GSC展示冒充，也不要求用户重复登录或升级套餐。

## 本轮可执行修复与跟踪

计算器原始HTML的“How the calculator works”仍要求输入航班计划抵达时间，React同一位置已使用“预计或记录的入境日期，并核对入境许可”。静态生成改为复用同一共享文案；新增原始HTML审计覆盖并禁止旧句回归。只更新该页实际修改日，保留政策核验日期、数学逻辑和搜索metadata。此项归为发布一致性修复，不称为已证实的排名增长实验。

当前仅能确认四页正式域名HTTP200、精确自引用canonical及对应正文；不代表Google已处理修改。后续记录同页同词排名、相关展示与绝对新增点击。完整7/28天窗口及GSC抓取证据仍遵循复盘政策。

最小证据缺口按原顺序保留：计算器最新URL Inspection报告；预算主页精确Page→Queries比较及实际日期。已收到的全站与计算器基线无需重交。获得新证据再决定下一项增长修改。

机器可读明细见 `keyword-opportunities-2026-10-22.json`。原始GSC文件SHA、数据范围、竞品字段与正式检查时间均已保留。

正式发布补记：计算器一致性修复已由 `6ce91de` 上线，Oct22 07:13:49UTC正式域名核验通过；Cloudflare部署 `6215aa19-cb1b-4ec0-9e3d-a8cff0ce1a2e`。构建、类型/计算测试、原始HTML审计和旧版负例通过。此为技术发布结果，未取得新的Google抓取或关键词/排名/点击结果。

## 后续筛选：张家界三日行程的小范围测试

四组近期候选保持原决定后，另核对尚未修改的 `/3-day-zhangjiajie-itinerary/`：原页15展示、0点击、页面平均28.6；全站 `zhangjiajie trip planner` 3展示/91.67仅作独立主题线索，不能归给本页。月搜索量/KD及精确页面查询仍未知，不称为高需求、低竞争或接近前十机会。

本页已有静态正文，原版本审核/修改日为Sept22；正式HTML在Oct22 07:27:54UTC核验。公开运营公告提供了原页缺少的具体时效答案。现有目的地同类指南内容充分，未据此推断竞品排名、外链或量化竞争；选择的依据是直接旅游规划意图、已有曝光与可验证的答案缺口。实施范围仅一节日期化说明、两条FAQ及相应来源链接和提示，保留搜索metadata，不做整页重写或新增页面。

此为探索性内容测试，仍须等待修改后抓取、同页同词数据和相关点击；不能把“有新内容”当作排名已改善。详见 `zhangjiajie-itinerary-ranking-tracking.json`，包含来源边界及后续时效检查。已有计算器与预算数据请求仍优先，不再为每个新动作立即追加导出要求。

张家界补记：`ad0580b`已上线，Oct22 07:38:53UTC正式域名核验通过；源码/静态一致、原搜索metadata与内链保留、76URL sitemap不扩页。目标词覆盖和排名/点击仍待验证，首个完整7天暂定Oct23–29。详细发布与时效复核规则保留在独立跟踪记录中。


## 后续筛选：7天行程的天数与住宿晚数

`/7-day-china-itinerary/`历史基线为0点击、6展示、页面平均31.5；全站`china itinerary 7 days`和`china travel 7 day itinerary`各1展示，不能归给本页。精确页面查询、月搜索量、KD及国家/设备排名未知。正式原页首段给出3+2+2=7晚，但日程第7天离境，六晚与七晚口径冲突已核实。

本轮将7个当地日历日/6晚作为明确口径，以北京3晚+上海3晚为首选；原三城路线保留为3+1+2晚的紧凑替代，写明适用条件。补充换城日、逐晚住宿、周一改排和上下游规划链接。既修正准确性，也作为小范围游客规划内容测试；不称为已证实的关键词排名机会。竞品https://chinatravelroadmap.com/7-day-china-itinerary 已有两城六晚方案，未据此推断竞争难度、Google前十或需求规模。故宫官方Monday说明和12306入口已核实；线路取舍是编辑建议。

标题摘要、网址、CTA和原费用区间保留；最近改动的其他页面保留观察。发布、Google重新抓取、同页同词和相关点击分别记录。详见`seven-day-itinerary-ranking-tracking.json`。已有计算器和预算数据请求仍优先，不立即新增第三项导出要求。

7天行程补记：`d2d6360`已正式生效，Oct22 08:12:21UTC直接HTTP200核验12章节、8FAQ及schema、6晚说明、内链、自引用canonical和搜索metadata；旧7晚句消失。正式sitemap与本地76URL版本一致。Cloudflare部署`c962d7f1-6c5c-42ee-bf55-9c242d60b529`成功。手机视觉QA未完成（缺少浏览器），不声称通过；Google抓取与相关点击/同词排名仍待验证。


## 后续筛选：10天行程的9晚与换城时间

`/10-day-china-itinerary/`历史0点击/9展示/页面平均83.44；全站`china 10 day itinerary`3展示/78.67、`china itinerary 10 days`3/87.67、`10 day china itinerary`2/83、`10 day china trip`1/86，不归属本页，不能称为接近前十的词。月搜索量/KD未知。

直接正式HTTP200确认旧quick answer4+3+3=10晚，却Day10离境；西安至上海换城时间模糊。修正为4+2+3=9晚，Day5/7明确换城，补充4+3+2历史方案及5+4慢行方案和城市/订票/预算入口。14天页4+3+3+3=13晚已一致，不修改；近期7天等版本保留观察。竞品https://chinatrailhead.com/itineraries/10-days-china/已有9晚与换城日安排，不能据此声称低竞争。此为准确性修复及小范围规划内容测试，搜索收益待验证。细节见`ten-day-itinerary-ranking-tracking.json`；计算器和预算证据请求仍优先。

10天行程补记：`2d01e91`已正式生效，Oct22 08:36:32UTC直接HTTP200核验11章节、8FAQ/schema、9晚说明与两次换城日、内链、self-canonical和搜索metadata。正式sitemap精确匹配76URL版本，仅目标lastmod改变。Cloudflare部署`42095696-7c77-4650-9da1-d27a143d7824`成功。手机视觉QA因缺少浏览器未完成。完整7天暂定Oct23–29，28天Oct23–Nov19，收录/修改后抓取/同词排名/相关点击仍待验证。


## 后续筛选：上海三日的场馆与闭馆日

`/3-day-shanghai-itinerary/`历史0点击/10展示/页面平均36.8。全站`3 days in shanghai`、`what to do in shanghai for 3 days`、`shanghai itinerary 3 days`、`shanghai 3 days itinerary`各1展示，平均75/76/79/81，未归属本页，不是接近前十或搜索量证据。月量/KD未知。

正式原页没有周一提醒或两馆对照。原运营方资料确认豫园周一、上博东馆周二、人民广场馆周一的通常闭馆规则与节假日例外；人民广场馆当前展期安排另有日期，常设展应选东馆。补两节日期化规划、周一至三改排、三FAQ和三运营方链接，保留原8节/7FAQ、搜索metadata和内链。旧2025政府摘要与当前运营方门票/时段细节不同，不发布泛化免费/免预约或固定最晚入馆时间。

竞品https://siyechina.com/destinations/shanghai-travel-guide/已有三日路线与东馆，不是空白市场。此为小范围游客规划内容测试，非已证实的低竞争高收益机会。Oct22新7/10天页已有指向本页的链接，后续结果不能单独归因于本文；详见`shanghai-itinerary-ranking-tracking.json`及运营公告复核规则。计算器与预算证据请求仍优先。
