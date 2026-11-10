import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { modules } from '../src/features/finance/model/modules.js'
import { bindings, displayPage } from '../src/features/finance/api/resources.js'
import { operations, pageActions } from '../src/features/finance/api/operations.js'
import { fieldLabels, lineSchemas, parseField } from '../src/features/finance/api/fields.js'

const code = (value) => '`' + value + '`'
const cell = (value) => String(value ?? '').replaceAll('|', ' / ').replaceAll('\n', ' ')
const table = (headers, rows) => [
  '| ' + headers.join(' | ') + ' |',
  '| ' + headers.map(() => '---').join(' | ') + ' |',
  ...rows.map((row) => '| ' + row.map(cell).join(' | ') + ' |'),
].join('\n')
const sourceFiles = {
  gl: 'generalLedger', ar: 'receivables', ap: 'payables', funds: 'funds',
  expense: 'expenses', fa: 'fixedAssets', reports: 'reports', system: 'system',
}
const sections = [readFileSync('docs/architecture-intro.md', 'utf8').replace(/^\uFEFF/, '')]
const indexRows = [["—", '认证', '[登录页面](#登录页面)', '未登录时显示'], ['—', '认证', '[注册页面](#注册页面)', code('#/register')], ['—', '工作台', '[财务总览](#财务总览页面)', code('#/')]]
let indexNumber = 0
for (const module of modules) for (const page of module.pages) {
  indexNumber++
  indexRows.push([indexNumber, module.title, '[' + page.title + '](#' + indexNumber + '-' + page.title + ')', code('#/' + module.id + '/' + page.id)])
}
sections.push(table(['序号', '模块', '页面', '路由'], indexRows))
let count = 0

for (const module of modules) {
  sections.push('## ' + module.title + '\n')
  for (const page of module.pages) {
    count++
    const resource = module.id + '/' + page.id
    const source = 'src/features/finance/model/modules/' + sourceFiles[module.id] + '.js'
    const runtime = displayPage(page, [], pageActions(page), {})
    const filterKeys = bindings[page.id][0].split(' ')
    const columnKeys = bindings[page.id][1].split(' ')
    sections.push('### ' + count + '. ' + page.title + '\n\n' + page.description)
    sections.push(table(['项目', '实现'], [
      ['浏览器路由', code('#/' + resource)],
      ['权限资源', code(resource) + '，写操作另外检查 can_write'],
      ['页面容器', '[FinancePage](src/pages/finance/FinancePage.jsx)'],
      ['View 组件', 'FinanceFilters（内部 FilterField）、FinanceRecords（内部 RowActions）、OperationDialog（内部 Fields / ResultView）'],
      ['配置入口', '[' + source + '](' + source + ')'],
      ['接口定义', '[resources.js](src/features/finance/api/resources.js)、[operations.js](src/features/finance/api/operations.js)'],
      ['首次加载及查询', 'FinancePage.useEffect → listRecords(resource, query, signal) → financeRequest → request'],
      ['查询地址', code('GET /api/finance/' + resource)],
      ['响应读取', 'data.items、data.total；常规列表另含 data.page、data.size；displayPage 按字段映射生成展示行'],
    ]))
    sections.push('#### 查询条件\n\n' + table(['页面条件', '请求字段', '说明'], page.filters.map((name, index) => [
      name, filterKeys[index] ? code(filterKeys[index]) : '当前没有接口字段绑定',
      /期间/.test(name) ? '初始值为浏览器当前月份，格式 yyyy-MM' : filterKeys[index] ? '空值在 queryString 中省略' : '此控件目前不参与请求参数',
    ])))
    sections.push('常规分页参数为 ' + code('page=1&size=20') + '。查询按钮调用 search() 并回到第 1 页，重置按钮只恢复输入条件，需要再次点击查询。')
    sections.push('#### 列表字段\n\n' + table(['显示列', '响应字段'], runtime.columns.map((name, index) => [name, code(columnKeys[index])])))
    if (page.id === 'ledgers') sections.push('选择明细账或多栏账时，展示列切换为凭证字号、凭证日期、科目名称、摘要、借方金额和贷方金额，对应 voucher_no、voucher_date、account_name、summary、debit、credit。')
    if (page.id.endsWith('-aging')) sections.push('当前前端列标题固定为 0–30、31–60、61–90 和 90 天以上。后端支持调整 bounds，但前端尚未按响应 bounds 动态修改标题，修改分段后应同步更新列标题。')
    sections.push('#### 操作、调用方法与接口\n\n所有下列操作由 FinancePage.runAction([title], id) 解析定义。需要输入或确认的操作打开 OperationDialog，表单 submit(event) 调用 FinancePage.submit(body)，再调用 financeRequest 与 request。')
    const actionRows = Object.entries(operations[page.id]).map(([title, operation]) => {
      if (operation.unsupported) return [title, '支持范围提示', '不发送请求', operation.unsupported]
      const target = operation.resource || resource
      const suffix = (operation.suffix || '').replace(/:([a-z_]+)/g, '{$1}')
      const endpoint = operation.download ? 'GET /api/finance/' + target + '/export'
        : operation.refresh ? 'GET /api/finance/' + resource
          : operation.reportConfig ? 'POST /api/finance/' + resource + ' 或 /api/finance/' + resource + '/{reportId}/configure'
            : (operation.method || 'GET') + ' /api/finance/' + target + suffix
      const entry = operation.row ? '行操作，使用记录 id' : operation.batch ? '工具栏，先勾选凭证' : operation.download ? '工具栏，直接下载' : operation.refresh ? '工具栏，重新取数' : '工具栏或主按钮'
      const specs = (operation.fields || '').split(' ').filter(Boolean).map((spec) => {
        const field = parseField(spec)
        return code(field.key) + (fieldLabels[field.key] ? '（' + fieldLabels[field.key] + '）' : '') + (field.optional ? '，选填' : '') + (field.kind ? '，结构 ' + field.kind : '')
      })
      const params = operation.batch ? code('{ ids: selected }')
        : operation.download ? '沿用当前筛选，移除 page、size'
          : operation.refresh ? '沿用当前 query'
            : specs.join('；') || '无需输入参数，写请求发送空对象'
      const defaults = Object.keys(operation.defaults || {}).length ? '；固定或默认值 ' + code(JSON.stringify(operation.defaults)) : ''
      return [title, entry, code(endpoint), params + defaults]
    })
    const rowActions = pageActions(page).filter((action) => action[2] === 'row')
    if (!rowActions.some(([title]) => title.startsWith('查看')) && !page.id.endsWith('-aging') && !['ledgers', 'balance-sheet', 'income-statement', 'cash-flow'].includes(page.id)) {
      actionRows.unshift(['查看详情', '通用行操作', code('GET /api/finance/' + resource + '/{id}'), 'FinancePage.runAction 默认使用 GET /:id，FinancePage.submit 发出查询'])
    }
    sections.push(table(['操作', '入口', '请求', '参数与处理'], actionRows))
    if (Object.values(operations[page.id]).some((operation) => operation.reportConfig)) sections.push('标准报表已有 data.report 时，runAction 会逐行调用 GET /{reportId}/lines/{line_no}/ledger?period_code=...，读取 terms 并回填公式。提交到 /{reportId}/configure。尚无模板时，直接 POST 当前报表资源创建模板。')
    if (page.id === 'custom-reports') sections.push('配置报表前先 GET /reports/custom-reports/{id} 读取 lines；运行报表通过 GET /{id}/run 取数，目前结果显示在弹窗 ResultView 中。')
    if (Object.values(operations[page.id]).some((operation) => operation.attachment)) sections.push('上传使用 multipart FormData，file 保持 File 对象，不手动设置 Content-Type。前端限制单文件 10 MB，服务器继续校验类型、归属和附件数量。下载附件时 downloadFile=true 进入 request 的 Blob 分支，附件 ID 可以从详情返回的 attachments 中读取。')
    if (page.id === 'permissions') sections.push('permissions:permissions 是多行授权编辑器，resource 为资源字符串，can_write 为布尔值。未勾选时显式提交 false。服务端整体替换角色授权列表。当前原页面的“部门”条件未绑定到角色查询接口。')
    sections.push('#### 状态与结果\n\nfilters 保存正在编辑的条件，query 保存已提交条件；selected 保存后台记录 id；operation 保存当前操作定义及回填数据。写请求成功后 refresh() 增加 revision，重新查询列表并清空勾选；失败时保留弹窗输入并显示服务端 message。是否允许业务状态迁移最终由服务端校验。')
  }
}
sections.push('## 明细编辑器与关联数据\n')
for (const [name, schema] of Object.entries(lineSchemas)) {
  sections.push('### ' + name + '\n\n' + table(['字段', '名称', '是否必填', '类型'], schema.split(' ').map((spec) => {
    const { key, optional, kind } = parseField(spec)
    return [code(key), fieldLabels[key] || key, optional ? '选填' : '必填', kind || '字符串或关联 ID']
  })))
}
sections.push(readFileSync('docs/architecture-ending.md', 'utf8').replace(/^\uFEFF/, ''))
writeFileSync('ARCHITECTURE.md', sections.join('\n\n').trimEnd() + '\n')
console.log('ARCHITECTURE.md generated for login, registration, dashboard and ' + count + ' business pages.')
