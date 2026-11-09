export const fieldLabels = {
  code: '编码', name: '名称', category: '类别', balance_side: '余额方向', parent_id: '上级科目',
  dimensions: '辅助核算维度', voucher_date: '凭证日期', summary: '摘要', lines: '明细',
  account_id: '会计科目', debit: '借方金额', credit: '贷方金额', party_id: '往来单位',
  order_date: '单据日期', due_date: '到期日期', amount: '金额', currency: '币种',
  exchange_rate: '汇率', tax_amount: '税额', tax_account_id: '税额科目', department_id: '部门',
  project_id: '项目', trade_account_id: '往来科目', counterpart_account_id: '对方科目',
  source_type: '来源类型', source_no: '来源编号', bank_account_id: '资金账户',
  ledger_account_id: '资金核算科目', account_type: '账户类型', bank_name: '开户行',
  account_number: '账号', opening_balance: '期初余额', transaction_date: '交易日期',
  purpose: '用途或事由', direction: '收付方向', period_id: '会计期间', period_code: '会计期间',
  trade_id: '往来单据', settled_on: '核销日期', request_key: '核销请求编号',
  settlement_id: '核销记录 ID', reversed_on: '反核销日期', note_no: '票据号', note_type: '票据类型',
  issued_on: '签发日期', cash_order_id: '关联收付款单', bank_ending_balance: '银行期末余额',
  cycle: '计划周期', start_date: '开始日期', end_date: '结束日期', planned_receipts: '预计收款',
  planned_payments: '预计付款', date: '日期', expense_type_id: '费用类型',
  expense_date: '费用日期', loan_id: '关联借款', loan_offset: '借款冲抵金额',
  loan_account_id: '借款核算科目', opinion: '审批意见', assignee_id: '目标审批人',
  asset_id: '资产', acquisition_date: '入账日期', original_value: '资产原值',
  method: '折旧方法', life_months: '使用月数', residual_rate: '残值率（0–1）',
  asset_account_id: '资产科目', expense_account_id: '费用科目', depreciation_account_id: '累计折旧科目',
  total_units: '预计工作量', units: '本期工作量', reason: '原因',
  movement_type: '变动类型', movement_date: '变动日期', new_department_id: '调入部门',
  new_custodian_id: '新使用人', inventory_result: '盘点结果', adjustment_account_id: '盘盈亏科目',
  disposal_type: '处置方式', disposal_date: '处置日期', proceeds: '处置收入',
  proceeds_account_id: '收入科目', gain_loss_account_id: '处置损益科目',
  username: '用户名', password: '密码（至少 12 位）', role_id: '角色',
  description: '说明', permissions: '资源授权', resource: '资源', can_write: '允许写入',
  data_type: '数据类型', extra_info: '补充信息', rate: '汇率', effective_date: '生效日期',
  amount_limit: '费用限额', status: '状态', version: '版本', min_amount: '最低金额',
  max_amount: '最高金额', steps: '审批节点', mode: '审批方式', profit_account_id: '本年利润科目',
  report_id: '报表模板 ID', line_no: '行次', label: '报表项目', metric: '取数规则',
  factor: '系数', segments: '编码分段（逗号分隔）', bounds: '账龄上限（逗号分隔）', file: '上传文件',
  attachment_id: '附件 ID（可从详情查看）', allowance_account_id: '坏账准备科目', recovery_account_id: '收回款项科目', original_id: '原坏账核销记录 ID', id: 'ID', items: '记录', success: '成功', result_id: '生成记录 ID', ready: '可结账',
  pending_vouchers: '待记账凭证', imbalanced_vouchers: '不平衡凭证', missing_depreciation: '待提折旧资产',
  pending_trade: '待审核往来单', profit_and_loss: '待结转损益', voucher_no: '凭证字号', total: '总数',
}
export const lineSchemas = {
  voucher: 'account_id summary? debit? credit? department_id? project_id? party_id?',
  expense: 'expense_type_id account_id expense_date amount purpose project_id?',
  report: 'line_no label account_id metric factor?',
  workflow: 'role_id name mode',
  permissions: 'resource can_write:boolean',
}
export const fieldChoices = {
  balance_side: ['借', '贷'], currency: ['CNY', 'USD', 'EUR', 'HKD'],
  account_type: ['银行账户', '现金账户'], direction: ['收款', '付款'], cycle: ['周度', '月度'],
  note_type: ['商业承兑', '银行承兑'], method: ['平均年限法', '工作量法', '双倍余额递减法'],
  movement_type: ['调拨', '使用人变更', '盘点'], disposal_type: ['报废', '出售'],
  data_type: ['部门', '项目', '客户', '供应商', '费用类型', '币种', '汇率'],
  mode: ['串行', '或签', '会签'], metric: ['期末余额', '借方发生', '贷方发生'],
  status: ['已启用', '已停用'],
}

export function parseField(spec) {
  const [raw, kind] = spec.split(':')
  return { key: raw.replace('?', ''), optional: raw.endsWith('?'), kind }
}
