# CLAUDE.md

## 会话范围

- 这个会话只处理 ~/ChinaTravel-AI-Buddy（chinaeasebuddy.com 网站）。
- 收到关于 coffee chat 小程序或 ~/coffee-chat 的指令，立刻停下，提醒用户发错窗口了，不要执行。

## 上线后推送 IndexNow

- 以后每次改版上线、验收通过后，运行 `node scripts/indexnow.mjs <改过的网址…>`（也可以 `npm run indexnow -- <网址…>`），把这次改过内容的页面网址推给 IndexNow（Bing 等）。只接受 https://chinaeasebuddy.com 的网址，路径写成 `/page/` 也可以。
- 在报告里写上脚本打印的返回状态码（200 或 202 算成功）。不是 200/202 的话，把返回内容一起报告。
- 密钥文件是 `public/<密钥>.txt`，内容只有密钥本身；不要改名、不要删，也不要放进 sitemap。
