# 衡账 · 财务管理系统

独立的 React 与 Vite 财务前端，通过 HTTP API 连接 ERP 服务端的会话认证、财务工作台和 35 个业务资源。

## 运行

先启动本地 `erp-server`，再安装依赖并执行 `npm run dev`。开发和预览环境默认将 `/api` 代理到 `http://127.0.0.1:8080`。浏览器通过前端同源地址访问接口，登录会话 Cookie 也由代理正常转发。

后端端口不同或需要连接远程服务时，可复制 `.env.example` 为 `.env.local` 后设置 `ERP_API_TARGET`，并重启 Vite。也可以在当前终端指定地址。

```powershell
# 本地样例服务
$env:ERP_API_TARGET = 'http://127.0.0.1:18080'
npm run dev

# 远程 ERP 服务
$env:ERP_API_TARGET = 'http://39.106.106.98:8080'
npm run dev
```

终端中的 `ERP_API_TARGET` 优先于 `.env.local`；若此前设置过远程地址，执行 `Remove-Item Env:ERP_API_TARGET -ErrorAction SilentlyContinue` 后再启动即可使用配置文件或本地默认地址。构建命令为 `npm run build`，静态部署时由反向代理把同源 `/api` 转发给服务端。

登录页点击“立即注册”可创建账号。注册设置账号和密码，点击注册时由后端校验图形验证码；验证码可点击刷新。注册成功后使用账号和密码登录。新账号属于“注册用户”普通角色，业务权限由管理员分配。服务端新增接口后需重新启动 erp-server。Cookie 会话支持刷新恢复、退出和失效拦截。角色权限决定可访问的菜单和业务写入入口，服务端继续执行权限校验。

页面查询、分页、详情、业务操作、XLSX 导出、CSV 导入以及凭证与报销附件均调用真实接口。操作表单支持多行凭证、报销明细、审批节点和报表公式。服务器暂未提供的 PDF 导出、网银模板、提醒、凭证模板和恢复入口会显示当前支持范围。

## 样例数据

`scripts/seed-samples.mjs` 通过业务 API 创建科目、部门、项目、客户、供应商、角色、审核员、期间、银行账户、应收应付、收付款、借款、报销审批、固定资产、折旧、流水、资金计划和四类报表模板。样例凭证按服务端规则由不同用户审核、记账。样例模板用于展示取数，正式财务报表需按企业实际科目配置。

脚本按编码或单号识别已有样例，可重复运行。它仅处理带 `SAMPLE-` 标记的样例凭证，不审核其他凭证。密码由环境变量传入。

本次联调数据写入本地 MariaDB 的独立数据库 `erp_finance_demo`。本地样例账号为 `admin` 和 `sample_reviewer`，两者的联调密码均为 `FinanceDemo2026!`。这些账号只存在于样例库。

启动服务端时设置以下环境变量，并使用服务端构建的可执行 JAR 启动。

```powershell
$env:SPRING_DATASOURCE_URL = 'jdbc:mariadb://127.0.0.1:3306/erp_finance_demo'
$env:SERVER_ADDRESS = '127.0.0.1'
$env:SERVER_PORT = '18080'
# 按服务端配置提供数据库账号、密码。
# java -jar <服务端可执行 JAR>
```

连接该样例服务并补充或重建样例时运行以下命令。

```powershell
$env:ERP_API_URL = 'http://127.0.0.1:18080'
$env:ERP_SAMPLE_PASSWORD = 'FinanceDemo2026!'
node scripts/seed-samples.mjs

$env:ERP_API_TARGET = 'http://127.0.0.1:18080'
npm run dev
```

新数据库需先按服务端 FINANCE_API.md 建表，并设置至少 12 位的初始管理员密码。脚本默认使用 admin，可通过 ERP_SAMPLE_USERNAME 指定管理员账号。

## 目录结构

- `src/app` 管理应用入口、路由、访问拦截及工作台布局。
- `src/pages` 按页面组织代码，目录下的 `views` 放表单、表格和图表。
- `src/features/auth` 管理真实会话和权限。
- `src/features/finance/api` 维护字段映射、操作路径、表单定义及关联数据选项。
- `src/features/finance/model/modules` 按业务模块维护页面描述与导航配置。
- `src/shared/api` 统一处理响应、错误、会话失效、文件下载及业务日期。
- `src/shared/ui` 和 `src/shared/styles` 放共享组件及样式。

## 架构文档与生产部署

[ARCHITECTURE.md](ARCHITECTURE.md) 覆盖登录、注册、工作台和全部 35 个业务页，逐页说明 View 组件、状态、调用方法、接口路径、查询条件和操作字段。修改配置后运行 `npm run docs:architecture` 重新生成。

生产环境用 Nginx 提供静态前端，将同源 `/api` 代理到服务器的后端。默认目标为 `root@39.106.106.98`，发布根目录为 `/home/web`，前端使用 80 端口，后端使用 `127.0.0.1:8080`。

```powershell
# 本地编译、打包并检查待发布配置，不连接服务器
npm run deploy -- -DryRun

# 编译并上传，通过 Nginx 配置和健康检查后切换版本
npm run deploy

# 可选 SSH 私钥、后端端口及前端端口
npm run deploy -- -IdentityFile 'C:/Users/your-name/.ssh/id_ed25519' -BackendOrigin 'http://127.0.0.1:8081' -ListenPort 8088
```

入口为 [scripts/deploy.ps1](scripts/deploy.ps1)，服务器激活逻辑为 [deploy/activate.sh](deploy/activate.sh)，Nginx 模板为 [deploy/nginx.conf.template](deploy/nginx.conf.template)。服务器需已安装并启动 Nginx，主配置需包含 `/etc/nginx/conf.d/*.conf`，并已启动相应后端。详细参数、发布目录、回滚和排查步骤见架构文档的部署部分。
