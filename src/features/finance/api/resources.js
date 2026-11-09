import { queryString, request } from '../../../shared/api/client.js'

export const financeRequest = (resource, options) => request('/finance/' + resource, options)
export const listRecords = (resource, params, signal) => financeRequest(resource + '?' + queryString(params), { signal })

// Field order follows each page's visible filters and columns.
export const bindings = {
  accounts: ['q category status', 'code name category balance_side dimensions account_level status'],
  vouchers: ['period_code q status', 'voucher_no voucher_date summary debit_total credit_total maker status'],
  closing: ['period_code status', 'period_code pending_vouchers status'],
  ledgers: ['ledger_type start_period end_period account_level department_id', 'account_code account_name opening_balance debit credit closing_balance'],
  receivables: ['party due_date status', 'order_no party order_date due_date currency amount open_amount status'],
  collections: ['party transaction_date status', 'order_no party account_name transaction_date amount settled_amount status'],
  'ar-aging': ['cutoff_date party_id account_id department_id', 'party currency open_amount not_due bucket_1 bucket_2 bucket_3 bucket_4'],
  'bad-debts': ['period_code party status', 'id party treatment amount period_code status'],
  payables: ['party due_date status', 'order_no party due_date amount tax_amount open_amount status'],
  payments: ['party transaction_date status', 'order_no party account_name transaction_date amount settled_amount status'],
  'ap-aging': ['cutoff_date party_id account_id department_id', 'party currency open_amount not_due bucket_1 bucket_2 bucket_3 bucket_4'],
  notes: ['party note_type due_date', 'note_no party note_type amount due_date status'],
  'bank-accounts': ['name currency account_type', 'name bank_name account_number currency account_type balance status'],
  'cash-orders': ['direction account_name transaction_date', 'order_no direction party account_name amount purpose status'],
  reconciliation: ['account_name period_code match_status', 'transaction_date account_name summary direction amount book_amount match_status'],
  'cash-plans': ['period_code cycle account_name', 'period_code planned_receipts planned_payments actual_receipts actual_payments variance'],
  claims: ['applicant department approval_status', 'claim_no applicant department expense_type amount approval_status payment_status'],
  loans: ['applicant due_date status', 'loan_no applicant purpose amount remaining_amount due_date status'],
  approvals: ['applicant expense_type status', 'claim_no applicant expense_type amount current_node status'],
  'expense-payments': ['applicant department payment_status', 'claim_no applicant department payable_amount paid_amount payment_status'],
  'asset-cards': ['q category department status', 'code name category department original_value accumulated_depreciation net_value status'],
  depreciation: ['period_code category department', 'period_code asset_code asset_name method current_amount adjustment status'],
  'asset-movements': ['asset_code movement_type status', 'movement_no asset_code movement_type old_department new_department movement_date status'],
  'asset-disposals': ['asset_code disposal_type status', 'disposal_no asset_code disposal_type net_value proceeds status'],
  'balance-sheet': ['period_code comparison', 'label line_no current_amount year_opening'],
  'income-statement': ['period_code comparison', 'label line_no current_amount year_to_date'],
  'cash-flow': ['period_code comparison', 'label line_no current_amount year_to_date'],
  'custom-reports': ['name', 'name report_type owner updated_at status'],
  users: ['q department status', 'username name department role status'],
  permissions: ['name', 'name permissions description status'],
  workflow: ['name department status', 'name department min_amount max_amount version status'],
  'master-data': ['data_type q status', 'code name data_type extra_info status'],
  periods: ['fiscal_year status', 'period_code start_date end_date closed_date status'],
  logs: ['operator operation operated_at_from operated_at_to', 'operated_at operator operation resource result'],
  backups: ['backup_at_from backup_at_to status', 'backup_at backup_type retain_until result status'],
}

export function initialFilters(page) {
  const month = new Date().toLocaleDateString('sv-SE').slice(0, 7)
  return Object.fromEntries(page.filters.filter((name) => /期间/.test(name)).map((name) => [name, month]))
}

export function filterParams(page, filters) {
  const keys = bindings[page.id][0].split(' ')
  return Object.fromEntries(page.filters.map((name, index) => [keys[index], filters[name]]).filter(([key, value]) => key && value !== '' && value != null))
}

export function displayPage(page, items, actions, params) {
  let keys = bindings[page.id][1].split(' ')
  let columns = page.columns
  if (page.id === 'closing') columns = ['会计期间', '未记账凭证数', '状态']
  if (page.id.endsWith('-aging')) columns = ['往来单位', '币种', '未核销余额', '未到期', '0–30 天', '31–60 天', '61–90 天', '90 天以上']
  if (page.id === 'permissions') columns = ['角色', '功能权限', '说明', '状态']
  if (page.id === 'workflow') columns = ['流程名称', '适用部门', '最低金额', '最高金额', '版本', '状态']
  if (page.id === 'custom-reports') columns = ['报表名称', '报表类型', '维护人', '更新时间', '状态']
  if (page.id === 'depreciation') columns = ['会计期间', '资产编码', '资产名称', '折旧方法', '本期折旧', '调整金额', '状态']
  if (page.id === 'ledgers' && ['明细账', '多栏账'].includes(params.ledger_type)) {
    keys = ['voucher_no', 'voucher_date', 'account_name', 'summary', 'debit', 'credit']
    columns = ['凭证字号', '凭证日期', '科目名称', '摘要', '借方金额', '贷方金额']
  }
  const rows = items.map((item) => keys.map((key) => {
    const value = item[key]
    return value == null ? '—' : typeof value === 'object' ? JSON.stringify(value) : String(value)
  }))
  return { ...page, columns, rows, actions }
}
