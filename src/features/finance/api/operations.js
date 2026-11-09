const create = (fields, defaults = {}) => ({ method: 'POST', fields, defaults })
const row = (action, fields = '', defaults = {}) => ({ method: 'POST', suffix: '/:id/' + action, fields, defaults, row: true })
const get = (suffix, fields = '', needsRow = false) => ({ method: 'GET', suffix, fields, row: needsRow })
const post = (suffix, fields, defaults = {}) => ({ method: 'POST', suffix, fields, defaults })
const trade = 'party_id order_date due_date amount trade_account_id counterpart_account_id currency? exchange_rate? tax_amount? tax_account_id? department_id? project_id?'
const cash = 'bank_account_id counterpart_account_id transaction_date purpose amount party_id? exchange_rate?'
const report = 'name lines:report'
const reportActions = {
  生成报表: { refresh: true },
  配置取数公式: { ...create(report), reportConfig: true },
  新建报表: create(report),
  联查明细账: get('/:report_id/lines/:line_no/ledger', 'report_id line_no period_code'),
  '导出 Excel': { download: true },
  '导出 PDF': { unsupported: '服务端暂未提供 PDF 导出，请使用 Excel 导出。' },
}

export const operations = {
  accounts: {
    新增科目: create('code name category balance_side parent_id? dimensions?'),
    编辑科目: row('edit', 'name dimensions?'),
    停用科目: row('disable'),
    删除科目: row('delete'),
    配置编码规则: post('/code-rule', 'segments:numbers', { segments: [4, 2, 2, 2, 2] }),
    导入模板: post('/import', 'file'),
    '导出 Excel': { download: true },
  },
  vouchers: {
    新增凭证: create('voucher_date summary lines:voucher'),
    查看凭证: get('/:id', '', true),
    编辑凭证: row('edit', 'voucher_date summary lines:voucher'),
    提交审核: row('submit'),
    批量审核: { ...post('/batch/approve', ''), batch: true },
    批量记账: { ...post('/batch/post', ''), batch: true },
    复制凭证: row('copy', 'voucher_date'),
    红字冲销: row('reverse', 'voucher_date reason'),
    作废凭证: row('void'),
    断号检查: get('/periods/:period_id/gaps', 'period_id'),
    凭证模板: { unsupported: '服务端尚未提供凭证模板配置接口。' },
    上传附件: { ...row('attachments', 'file'), attachment: true },
    下载附件: { ...get('/:id/attachments/:attachment_id', 'attachment_id', true), downloadFile: true },
    审核凭证: row('approve'),
    记账: row('post'),
  },
  closing: {
    执行结账检查: get('/:id/check', '', true),
    结转损益: row('transfer-profit', 'profit_account_id'),
    月末结账: row('close'),
    反结账: row('reopen', 'reason'),
    年度结转: row('year-carryover'),
  },
  ledgers: {
    '导出 Excel': { download: true },
    联查凭证: { ...get('/:voucher_id', 'voucher_id'), resource: 'gl/vouchers' },
  },
  receivables: {
    新增应收单: create(trade),
    同步销售单据: post('/sync', trade + ' source_type source_no'),
    审核并生成凭证: row('approve'),
  },
  payables: {
    新增应付单: create(trade),
    同步采购单据: post('/sync', trade + ' source_type source_no'),
    审核并生成凭证: row('approve'),
  },
  collections: {
    登记收款: create(cash.replace('party_id?', 'party_id')),
    手工核销: row('settle', 'trade_id amount settled_on request_key'),
    自动匹配: get('/:id/suggestions', '', true),
    反核销: row('reverse-settlement', 'settlement_id reversed_on'),
    确认收款: { ...row('approve'), resource: 'funds/cash-orders' },
  },
  payments: {
    登记付款: create(cash.replace('party_id?', 'party_id')),
    执行核销: row('settle', 'trade_id amount settled_on request_key'),
    确认付款: { ...row('approve'), resource: 'funds/cash-orders' },
  },
  'ar-aging': { 配置账龄区间: post('/buckets', 'bounds:numbers', { bounds: [30, 60, 90] }), 导出账龄表: { download: true } },
  'ap-aging': { 导出账龄表: { download: true } },
  'bad-debts': Object.fromEntries([['计提坏账准备', '计提'], ['坏账核销', '核销'], ['登记坏账收回', '收回']].map(([title, treatment]) => [title, create('trade_id transaction_date amount allowance_account_id expense_account_id? recovery_account_id? original_id?', { treatment })])),
  notes: {
    登记票据: create('note_no party_id note_type amount issued_on due_date'),
    登记兑付: row('redeem', 'cash_order_id'),
  },
  'bank-accounts': {
    新增账户: create('name account_type bank_name? account_number? ledger_account_id currency? opening_balance?'),
    编辑账户: row('edit', 'name bank_name? account_number? status?'),
  },
  'cash-orders': { 新增收付单: create(cash + ' direction'), 审核收付单: row('approve') },
  reconciliation: {
    导入银行流水: post('/import', 'bank_account_id file'),
    自动匹配: post('/auto-match', 'bank_account_id period_id'),
    手工勾对: row('match', 'cash_order_id'),
    生成余额调节表: get('/adjustment', 'bank_account_id period_id bank_ending_balance'),
    锁定对账期间: post('/lock', 'bank_account_id period_id bank_ending_balance'),
  },
  'cash-plans': {
    编制资金计划: create('bank_account_id cycle start_date end_date planned_receipts planned_payments'),
    生成头寸日报: get('/position', 'date bank_account_id?'),
  },
  claims: {
    上传附件: { ...row('attachments', 'file'), attachment: true },
    下载附件: { ...get('/:id/attachments/:attachment_id', 'attachment_id', true), downloadFile: true },
    新建报销: create('department_id expense_type_id lines:expense loan_id? loan_offset?'),
    提交报销审批: row('submit'),
    维护费用类型: { ...create('code name amount_limit?', { data_type: '费用类型' }), resource: 'system/master-data' },
  },
  loans: {
    申请借款: create('amount purpose due_date loan_account_id'),
    登记还款: row('repay', 'cash_order_id'),
    确认借款: row('approve', 'cash_order_id'),
    发送逾期提醒: { unsupported: '服务端尚未提供邮件或站内信发送接口。' },
  },
  approvals: {
    同意: row('approve', 'opinion?'),
    驳回: row('reject', 'opinion'),
    转交: row('transfer', 'assignee_id'),
    加签: row('add-signer', 'assignee_id'),
  },
  'expense-payments': {
    执行付款: row('pay', 'transaction_date bank_account_id?'),
    导出网银模板: { unsupported: '服务端尚未提供网银批量付款模板接口。' },
  },
  'asset-cards': {
    新增资产: create('code name category department_id acquisition_date original_value method life_months residual_rate asset_account_id expense_account_id depreciation_account_id total_units?'),
    查看资产卡片: get('/:id', '', true),
    分类汇总: get('/summary', 'department_id? category?'),
  },
  depreciation: { 计提折旧: create('asset_id period_id units?'), 调整折旧: row('adjust', 'amount reason') },
  'asset-movements': {
    申请资产变动: create('asset_id movement_type movement_date new_department_id? new_custodian_id? reason'),
    生成盘点单: create('asset_id movement_date reason', { movement_type: '盘点' }),
    录入盘点结果: row('confirm', 'inventory_result? adjustment_account_id?'),
    确认变动: row('confirm'),
  },
  'asset-disposals': {
    申请处置: create('asset_id disposal_type disposal_date proceeds reason'),
    确认处置: row('confirm', 'proceeds_account_id? gain_loss_account_id'),
  },
  'balance-sheet': reportActions,
  'income-statement': reportActions,
  'cash-flow': reportActions,
  'custom-reports': { ...reportActions, 运行报表: get('/:id/run', 'period_code', true), 配置报表: row('configure', report) },
  users: {
    新增用户: create('username name password department_id? role_id'),
    维护角色: { ...create('name description?'), resource: 'system/permissions' },
    重置密码: row('reset-password', 'password'),
    停用用户: row('disable'),
    启用用户: row('enable'),
    分配角色: row('assign-role', 'role_id'),
  },
  permissions: {
    配置权限: row('configure', 'permissions:permissions'),
    新增角色: create('name description?'),
    编辑角色: row('edit', 'name description? status?'),
  },
  workflow: { 新建流程: create('name version department_id? expense_type_id? min_amount? max_amount? steps:workflow'), 发布流程: row('publish') },
  'master-data': { 新增基础数据: create('data_type code name extra_info? rate? effective_date? amount_limit?'), 维护基础数据: row('edit', 'name extra_info? status? rate? effective_date? amount_limit?') },
  periods: { 启用期间: create('period_code start_date end_date') },
  logs: { 查看日志详情: get('/:id', '', true) },
  backups: { 查看恢复流程: { unsupported: '恢复由运维执行，服务端目前仅提供备份记录查询。' } },
}

export function pageActions(page) {
  return Object.entries(operations[page.id]).map(([title, operation]) => [title, '', operation.row ? 'row' : operation.batch ? 'selection' : undefined])
}
