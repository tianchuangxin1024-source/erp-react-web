## 关联数据下拉选项

[useReferences](src/features/finance/api/useReferences.js) 根据表单字段推导资源，使用 listRecords 读取最多 200 条选项，显示编码、名称和后台 ID。组件卸载时取消请求。某个关联查询失败时，该字段回退为输入框，可以填写 ID；失败不会自动授予任何接口权限。

| 字段 | 数据来源或筛选 |
| --- | --- |
| bank_account_id | funds/bank-accounts |
| *_account_id、parent_id | gl/accounts |
| period_id | system/periods |
| asset_id | fa/asset-cards |
| role_id | system/permissions |
| assignee_id、new_custodian_id | system/users |
| loan_id | expense/loans |
| cash_order_id | funds/cash-orders |
| trade_id | ap 页面查询 ap/payables，其他页面查询 ar/receivables |
| department_id、new_department_id | system/master-data，data_type=部门 |
| project_id | system/master-data，data_type=项目 |
| expense_type_id | system/master-data，data_type=费用类型 |
| party_id | ap 页面查询供应商，其他页面查询客户 |

当前关联选项一次最多读取 200 条，尚未实现远程搜索或无限滚动。party_id 在通用资金单等页面默认读取客户；如需选择供应商，应扩展 referenceResource 的业务上下文判断。

## 独立前端、代理与 Cookie

### 开发环境

[vite.config.js](vite.config.js) 默认把 /api 代理到 http://39.106.106.98:8080。浏览器访问本机 Vite 地址，再由 Vite 在服务端转发 HTTP 请求。request 始终调用相对路径 /api，登录 Cookie 属于浏览器访问的前端主机，后续请求继续携带会话。

创建 .env.local 可以覆写 ERP_API_TARGET。例如本地样例服务使用 http://127.0.0.1:18080。变量仅由 Vite 的配置代码读取，没有 VITE_ 前缀，也没有嵌入前端构建产物。修改后需要重启开发或预览服务。

ERP_API_TARGET 只接受 HTTP/HTTPS 来源，不允许路径、查询参数或账号密码。Vite 同时为 server 与 preview 配置代理，默认监听 127.0.0.1。生产环境由 Nginx 接管 HTTP 请求。

### 生产环境

```text
浏览器 http://39.106.106.98
  ├─ /、/assets/*         → Nginx → /home/web/current
  └─ /api/*              → Nginx → http://127.0.0.1:8080/api/*
```

浏览器的页面和接口使用相同的 scheme、host、port，因此使用现有 credentials:'same-origin' 即可。Nginx 保留 /api 前缀，代理 URI 不以 / 结尾，避免错误地把 /api/auth/login 变成 /auth/login。Cookie 和 Set-Cookie 由代理正常转发。当前后端的 JSESSIONID 未配置固定 Domain，不需要改写 Cookie Domain。

生产模板用 map 仅把配置中的前端 PublicOrigin 改写成 BackendOrigin。其他 Origin 保留原值，交给后端来源校验。Vite 则只改写 Origin.host 与当前请求 Host 相同的请求。没有 Origin 的请求继续省略此头。

Nginx 将 Host 及后端使用的转发来源头设成实际上游地址，保持服务端在启用或关闭转发头处理时的来源判断一致。X-Forwarded-For 和 X-Real-IP 仍保留客户端 IP。当前模板按 HTTP IP 访问生成；配置 HTTPS 域名时应同时调整监听、证书、允许的 PublicOrigin 及 Cookie Secure 设置。

API 代理不缓存响应，上传请求体上限为 11 MB，与现有单文件 10 MB 的业务限制配合。index.html 禁止缓存，带哈希的 assets 可长期缓存。

### 默认部署参数

| 参数 | 默认值 | 作用 |
| --- | --- | --- |
| ServerHost | 39.106.106.98 | SSH/SCP 目标主机 |
| ServerUser | root | SSH 用户 |
| SshPort | 22 | SSH 端口 |
| RemoteDirectory | /home/web | 应用发布根目录 |
| BackendOrigin | http://127.0.0.1:8080 | 服务器本机后端，8080 沿用现有服务端配置 |
| ServerName | 39.106.106.98 | Nginx server_name 与前端公开来源 |
| ListenPort | 80 | 前端 HTTP 端口 |
| NginxConfigPath | /etc/nginx/conf.d/erp-react-web.conf | 本项目 Nginx 配置文件 |
| IdentityFile | 空 | 可选 SSH 私钥路径，由 ssh/scp 使用 |
| SkipInstall | false | 省略 npm ci，使用已有依赖 |
| DryRun | false | 仅本地构建和打包，输出待部署配置，不连接服务器 |

### 编译并上传的入口

```powershell
# 默认执行 npm ci、npm run build、打包、上传和远端激活
npm run deploy

# 先生成本地编译产物、归档和 Nginx 配置供检查
npm run deploy -- -DryRun

# 指定 SSH 私钥
npm run deploy -- -IdentityFile 'C:/Users/your-name/.ssh/id_ed25519'

# 后端端口不同或使用另一个前端监听端口
npm run deploy -- -BackendOrigin 'http://127.0.0.1:8081' -ListenPort 8088
```

本机需要 Node.js、npm、PowerShell 7、tar、ssh 和 scp。服务器需要 Bash、Nginx、tar、curl、flock、install、cmp、readlink，并且 Nginx 已启动。/etc/nginx/nginx.conf 的 http 部分需要包含 conf.d/*.conf。脚本使用已有的 SSH 认证机制，首次连接的主机指纹确认由 SSH 处理。

### 服务器目录和发布过程

```text
/home/web/
  .deploy.lock                    防止两次发布同时激活
  .incoming/<releaseId>.*          上传包、配置、激活脚本、检查结果
  releases/<releaseId>/           解压后的完整 dist
  current -> releases/<releaseId>  Nginx 静态根目录
```

scripts/deploy.ps1 的执行顺序为依赖安装、编译、检查 index.html、渲染模板、打包 dist、SCP 上传、SSH 调用 activate.sh。上传内容仅包含静态构建产物及本次激活所需配置和脚本。Java、数据库和前端源码均不需要部署到静态站点目录。

activate.sh 验证参数和工具，取得发布锁，检查旧 current 是否指向本应用 releases 内的目录，备份已有 Nginx 配置，执行旧配置 nginx -t，再解压到新版本目录。静态文件准备好后，使用临时软链接和 mv -Tf 原子切换 current，写入本项目的配置，执行 nginx -t 与 nginx -s reload。

发布根目录和 releases 目录设置为可供 Nginx 遍历的 755 权限，新版本静态文件提供读取权限。激活后通过本机 HTTP 请求读取首页，并与本次 index.html 比对。再请求 /api/auth/session，接受匿名会话的 401 或已登录响应的 200，并检查 JSON code。后端不可用、首页不匹配或 Nginx 检查失败均触发回滚，恢复此前 current 及配置。首次发布失败时撤销本次新增的 current 和配置。解压目录与上传包保留供排查，脚本不自动清理历史版本。

当前目录如果是实际目录而非软链接，脚本会停止并提示处理，避免覆盖现有文件。切换前也会拒绝指向 releases 目录外部的旧链接。

本地构建包保留在 .deploy/<releaseId>，此目录已加入 .gitignore。DryRun 会完成打包并保留配置供审阅，不执行 SSH/SCP。

### 部署验证与故障定位

| 现象 | 检查位置 |
| --- | --- |
| npm ci 失败 | 本机 Node/npm、锁文件和依赖下载 |
| SSH 失败 | IP、22 或自定义端口、账号、密钥或交互密码 |
| Nginx 工具不存在 | 在服务器安装并启动 Nginx 后重试 |
| nginx -t 失败 | 上传的 .incoming 配置与 /etc/nginx 下其他站点配置 |
| API 502 | BackendOrigin、后端是否监听对应端口 |
| 写操作 403 请求来源不匹配 | PublicOrigin 是否与地址栏来源一致，Host/转发头和 Origin 是否匹配当前后端校验 |
| 登录后仍回到登录页 | 浏览器是否收到 JSESSIONID，后续请求是否带 Cookie，后端会话是否失效 |
| 旧页面或资源 404 | 当前软链接指向、index.html 是否禁用缓存、assets 路径 |
| 健康检查失败 | .incoming/<releaseId>.index.html 与 .session.json，激活脚本的回滚日志 |

## 维护与验证

重新生成本文执行 node scripts/generate-architecture.mjs。固定架构说明源文件位于 docs/architecture-intro.md 和 docs/architecture-ending.md，逐页表格从 modules、bindings、operations、fieldLabels 和 lineSchemas 自动生成，便于接口变更后同步。

新增业务页时，在对应模块配置加入 page 定义，在 bindings 中加入筛选与响应字段映射，在 operations 中加入真实动作。特殊参数、枚举和嵌套明细在 fields.js 中定义。专用交互应放入页面的 views，接口请求继续经过统一 client。

建议的修改后检查为 npm run build、npm run lint，并按改动范围执行登录、列表、操作和导出联调。本次部署脚本可以先执行 -DryRun 检查包和参数，再由实际发布在远端运行 nginx -t 与首页/API 健康检查。

## 当前实现范围

- ApiDialog.jsx 是原型阶段保留的接口说明组件，当前 App 未使用；真实业务操作由 OperationDialog 执行，后者复用了 ApiDialog.css 的弹窗样式。
- 金额输入以字符串提交，服务端负责 decimal 运算。前端图表汇总使用 Number，展示精度与服务端财务核算有不同职责。
- 标准报表依赖有效且唯一的模板；样例报表用于演示取数，正式模板由企业配置。
- 尚缺服务端接口的 PDF、凭证模板、网银批量付款模板、提醒和运维恢复入口，只展示明确的支持范围提示。
- 前端已接线不表示所有业务状态组合均经过端到端验证；服务端继续约束制单审核分离、会计期间锁定、余额和授权。
- 静态前端独立发布后，后端样例初始化脚本仍需指向正确的服务 URL 并显式提供样例管理员密码，部署脚本不执行样例初始化。

## 官方参考

Vite 的 server.proxy 与 preview.proxy 分别作用于开发和本地预览。生产环境使用 Nginx proxy_pass 和 proxy_set_header 处理 API 路由及请求头。[Vite Server Options](https://vite.dev/config/server-options)、[Vite Preview Options](https://vite.dev/config/preview-options)、[Nginx Proxy Module](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)
