# Numberlune

免费英文生命灵数网站。独立源码目录 `numberlune`，白色 / 深蓝 / 品牌蓝视觉，统一无衬线字体、图标和组件，首屏为四工具切换、生日计算器与明确标注的结果示例，无运行依赖、无需付费 AI API。直接双击 `index.html` 可以使用。

## 功能

- Life path：出生年月日分开化简，保留 11、22、33，再合并化简；展示计算步骤。
- Personal year：生日月、日和所选公历年，化简为 1–9；采用 1 月至 12 月的年度规则。
- Name number：Pythagorean A–Z 字母值，支持常见拉丁重音归一化，拒绝不支持的字符；展示实际使用的字母和值。
- Two of you：比较两人生命数字，提供沟通提示，无虚构匹配分数。
- 免费下载 1080 × 1350 PNG 解读卡片，不含输入的姓名或生日；复制完整解读会包含计算步骤，请分享前检查。
- 12 个数字解读页：1–9、11、22、33；每页含摘要、工作与关系场景、一周练习、经计算核对的生日实例和 FAQ。
- 方法、年度数字、姓名数字、关系解读、编辑规范、资料来源、关于、隐私、条款和 404。共 23 个英文 HTML 页面。

解读是预先撰写的英文内容，同一数字得到相同核心解读；不是在线 AI 或私人算命服务。数字含义作为娱乐、自我反思话题，不能预测健康、财富或关系结果。

## 本地与部署

不需要 `npm install`。安装 Node.js 后，可运行：

```text
npm run dev
npm test
npm run build
```

本地服务地址：`http://127.0.0.1:4183`。也可不用服务，直接打开首页。

Cloudflare Pages：上传本目录全部源码至独立 GitHub 仓库，框架 None，构建命令 `npm run build`，输出目录 `dist`。如果与其他站共用仓库，根目录填写 `numberlune`。

当前正式域名为 `https://numberlune.luqihang594241.workers.dev/`，记录在 `package.json` 的 `homepage` 中。构建默认使用此域名生成 canonical、og:url、sitemap.xml 和带 Sitemap 声明的 robots.txt；遗漏 `SITE_URL` 也会生成文件。改域名时设置构建环境变量 `SITE_URL=https://新的正式域名`（不含子路径）后重新构建发布，变量优先于 `homepage`。源码根目录也已提供当前域名的 `sitemap.xml` 和 `robots.txt`，支持直接发布；直接发布源码且更换域名时需同步更新两文件和 `homepage`。 构建还会更新结构化数据的绝对网址和 `llms.txt` 链接。

## 内容维护

- `core.js`：计算规则。
- `content.js`：12 个数字的英文解读。
- `depth.js`：工作场景、人际情境和一周练习。
- `scripts/editorial.mjs`：首页参考区、资料来源、编辑规范和核验的生日实例。
- `ads.js`：本站 HilltopAds 横幅和功能按钮弹窗，每次页面加载最多尝试一次弹窗。
- `app.js`：交互、复制和 PNG 卡片导出。
- `styles.css`：独立响应式设计。
- `scripts/generate-pages.mjs`：静态页面生成源码。
- `scripts/home.mjs`：首页布局、表单、样例解读与数字库。
- `scripts/build.mjs`：部署构建。

改解读后，可运行 `npm run pages` 重新生成 HTML。这个命令会覆盖本项目的 HTML 页面，包含手动加入的广告或验证代码；需要同时在生成器维护这些改动。正常 `npm run build` 仅复制当前 HTML 和前端资源，不重新生成页面。

## 统计与广告

全部 23 个 HTML 页面默认包含且仅包含一次：

```html
<meta name="referrer" content="no-referrer-when-downgrade" />
<script src="https://analytics.ahrefs.com/analytics.js" data-key="H9b2GINvE+UAtMw7v33ULA" async></script>
```

首页已接入本次提供的 HilltopAds 广告位：顶部 100% 宽、非悬浮横幅，可用 × 关闭；计算、试用示例、保存卡片或复制解读按钮的首次真实点击会尝试打开广告页，每次页面加载仅一次，原功能继续执行。切换工具、输入、导航和关闭横幅不会触发弹窗。正文指南页不加载广告。广告无填充或加载失败时收起横幅；浏览器可能拦截弹窗。

广告地址在 `ads.js` 维护，首页广告容器和脚本引用在 `scripts/generate-pages.mjs` 维护。`AD_HEAD_START/END`、`AD_BANNER_START/END`、`AD_BODY_START/END` 是集成位置。隐私、关于及编辑规范已同步披露广告。

输入不写入 localStorage、Cookie、查询参数或自定义统计事件。Ahrefs 和托管方的数据处理在隐私页说明。

## 搜索

页面包含可抓取英文正文、直接回答摘要、页面目录、公开计算规则、原创练习、来源及编辑披露、内部链接、FAQ 和 WebApplication/Article 结构化数据。`llms.txt` 作为内容导航补充，并不保证 AI 平台读取或引用。未验证真实关键词搜索量，也不承诺搜索收录、排名、AI 引用或广告收入。

## 搜索引擎站点地图检查

更新 GitHub 并等待 Cloudflare 部署成功后，打开 https://numberlune.luqihang594241.workers.dev/sitemap.xml ，应显示 XML 网址列表，不能是首页或 404。然后在对应 Google Search Console 网站属性的 Sitemaps 中提交 `sitemap.xml`，检查状态是否为 Success；也可向 Bing Webmaster Tools 提交同一地址。提交成功提示仅代表接受请求，成功读取也不保证收录、排名或流量。
