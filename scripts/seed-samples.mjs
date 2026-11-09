import { normalizeApiData } from '../src/shared/api/dates.js'
import process from 'node:process'
const base = process.env.ERP_API_URL || 'http://127.0.0.1:8080'
const password = process.env.ERP_SAMPLE_PASSWORD
if (!password) throw new Error('Set ERP_SAMPLE_PASSWORD to the local sample administrator password.')

function client() {
  let cookie = ''
  return async (path, method = 'GET', body) => {
    const response = await fetch(base + '/api/' + path, {
      method, headers: { ...(cookie ? { Cookie: cookie } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (response.headers.get('set-cookie')) cookie = response.headers.get('set-cookie').split(';')[0]
    const result = await response.json()
    if (!response.ok) throw new Error(path + ': ' + result.message)
    return normalizeApiData(result.data)
  }
}
const api = client()
await api('auth/login', 'POST', { username: process.env.ERP_SAMPLE_USERNAME || 'admin', password })
const list = async (resource, params = '') => (await api('finance/' + resource + '?size=200' + params)).items
const post = (resource, body) => api('finance/' + resource, 'POST', body)
async function ensure(resource, key, body) {
  const existing = (await list(resource)).find((row) => row[key] === body[key])
  return existing || { ...body, ...await post(resource, body) }
}
const now = new Date()
const month = now.toLocaleDateString('sv-SE').slice(0, 7)
const today = now.toLocaleDateString('sv-SE')
const previousDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
const previous = previousDate.toLocaleDateString('sv-SE').slice(0, 7)
const period = {}
for (const code of [previous, month]) {
  const [year, number] = code.split('-').map(Number)
  period[code] = await ensure('system/periods', 'period_code', {
    period_code: code, start_date: code + '-01', end_date: new Date(year, number, 0).toLocaleDateString('sv-SE'),
  })
}
const masters = {}
for (const [key, data_type, name] of [
  ['DEPT', '部门', '样例·财务部'], ['RD', '部门', '样例·研发部'],
  ['CUSTOMER', '客户', '样例·华东智造'], ['SUPPLIER', '供应商', '样例·恒立设备'],
  ['PROJECT', '项目', '样例·数字化项目'], ['EXPENSE', '费用类型', '样例·差旅费'],
]) masters[key] = await ensure('system/master-data', 'code', { code: 'SAMPLE_' + key, data_type, name })

const account = {}
for (const [code, name, category, balance_side] of [
  ['1001', '库存现金', '资产', '借'], ['1002', '银行存款', '资产', '借'],
  ['1122', '应收账款', '资产', '借'], ['1123', '预付账款', '资产', '借'],
  ['1221', '其他应收款', '资产', '借'], ['1601', '固定资产', '资产', '借'],
  ['1602', '累计折旧', '资产', '贷'], ['2202', '应付账款', '负债', '贷'],
  ['2203', '预收账款', '负债', '贷'], ['4103', '本年利润', '权益', '贷'],
  ['6001', '主营业务收入', '损益', '贷'], ['6602', '管理费用', '损益', '借'],
]) account[code] = await ensure('gl/accounts', 'code', { code, name, category, balance_side })

const role = await ensure('system/permissions', 'name', { name: '样例·会计审核员', description: '本地样例业务审核' })
await post('system/permissions/' + role.id + '/configure', { permissions: ['gl/vouchers', 'ar/receivables', 'ap/payables', 'funds/cash-orders', 'expense/approvals', 'dashboard'].map((resource) => ({ resource, can_write: true })) })
const reviewer = await ensure('system/users', 'username', { username: 'sample_reviewer', name: '样例审核员', password, department_id: masters.DEPT.id, role_id: role.id })
const review = client()
await review('auth/login', 'POST', { username: reviewer.username, password })

const bank = await ensure('funds/bank-accounts', 'name', { name: '样例·招商银行', bank_name: '招商银行', account_number: 'SAMPLE202611000826', account_type: '银行账户', ledger_account_id: account['1002'].id, opening_balance: '100000.00', currency: 'CNY' })
for (const [side, amount, tradeCode, counterpartCode, party] of [
  ['ar/receivables', '58000.00', '1122', '6001', masters.CUSTOMER],
  ['ap/payables', '12000.00', '2202', '6602', masters.SUPPLIER],
]) {
  const trade = await ensure(side, 'order_no', { order_no: 'SAMPLE-' + month + '-' + side.slice(0, 2), party_id: party.id, order_date: today, due_date: month + '-28', amount, currency: 'CNY', trade_account_id: account[tradeCode].id, counterpart_account_id: account[counterpartCode].id })
  if (!trade.status || trade.status === '待审核') await review('finance/' + side + '/' + trade.id + '/approve', 'POST', {})
}
for (const [direction, amount, counterpart, purpose] of [
  ['收款', '36000.00', '6001', '样例·项目服务收款'],
  ['付款', '4200.00', '6602', '样例·办公费用付款'],
]) {
  const cash = await ensure('funds/cash-orders', 'order_no', { order_no: 'SAMPLE-' + month + '-' + direction, bank_account_id: bank.id, counterpart_account_id: account[counterpart].id, transaction_date: today, amount, direction, purpose })
  if (cash.status !== '已确认') await review('finance/funds/cash-orders/' + cash.id + '/approve', 'POST', {})
}
await ensure('expense/loans', 'loan_no', { loan_no: 'SAMPLE-' + month + '-LOAN', amount: '2000.00', purpose: '样例·项目出差备用金', due_date: month + '-28', loan_account_id: account['1221'].id })
const workflow = await ensure('system/workflow', 'name', { name: '样例·费用审批', version: 1, department_id: masters.DEPT.id, expense_type_id: masters.EXPENSE.id, steps: [{ role_id: role.id, name: '会计审核', mode: '串行' }] })
if (workflow.status !== '已启用') await post('system/workflow/' + workflow.id + '/publish', {})
const claim = await ensure('expense/claims', 'claim_no', { claim_no: 'SAMPLE-' + month + '-CLAIM', department_id: masters.DEPT.id, expense_type_id: masters.EXPENSE.id, lines: [{ expense_type_id: masters.EXPENSE.id, account_id: account['6602'].id, expense_date: today, amount: '680.00', purpose: '样例·客户拜访交通费' }] })
if (!claim.approval_status || claim.approval_status === '草稿') await post('expense/claims/' + claim.id + '/submit', {})
const asset = await ensure('fa/asset-cards', 'code', { code: 'SAMPLE-FA-001', name: '样例·研发工作站', category: '电子设备', department_id: masters.RD.id, acquisition_date: previous + '-01', original_value: '24000.00', method: '平均年限法', life_months: 36, residual_rate: '0.05', asset_account_id: account['1601'].id, expense_account_id: account['6602'].id, depreciation_account_id: account['1602'].id })
if (!(await list('fa/depreciation')).some((row) => row.asset_id === asset.id && row.period_id === period[month].id)) await post('fa/depreciation', { asset_id: asset.id, period_id: period[month].id })
if (!(await list('funds/cash-plans')).some((row) => row.bank_account_id === bank.id && row.start_date === month + '-01')) await post('funds/cash-plans', { bank_account_id: bank.id, cycle: '月度', start_date: month + '-01', end_date: period[month].end_date, planned_receipts: '80000.00', planned_payments: '30000.00' })
const statements = await list('funds/reconciliation')
if (!statements.some((row) => row.reference_no === 'SAMPLE-' + month + '-STMT')) await post('funds/reconciliation/import', { bank_account_id: bank.id, lines: [{ transaction_date: today, reference_no: 'SAMPLE-' + month + '-STMT', summary: '样例·项目服务收款', direction: '收款', amount: '36000.00' }] })
await post('funds/reconciliation/auto-match', { bank_account_id: bank.id, period_id: period[month].id })

for (const type of ['balance-sheet', 'income-statement', 'cash-flow', 'custom-reports']) {
  const name = '样例·' + type
  const reportResource = 'reports/' + type
  let exists = false
  if (type === 'custom-reports') exists = (await list(reportResource)).some((row) => row.name === name)
  else {
    try { exists = (await api('finance/' + reportResource + '?period_code=' + month)).report?.name === name } catch { /* Initial template not configured. */ }
  }
  if (!exists) await post(reportResource, { name, lines: [
    { line_no: 1, label: type === 'balance-sheet' ? '银行存款' : '服务收入', account_id: account[type === 'balance-sheet' ? '1002' : '6001'].id, metric: type === 'balance-sheet' ? '期末余额' : '贷方发生', factor: 1 },
    { line_no: 2, label: '管理费用', account_id: account['6602'].id, metric: '借方发生', factor: 1 },
  ] })
}
for (const voucher of (await list('gl/vouchers')).filter((item) => item.summary.includes('SAMPLE-'))) {
  if (voucher.status === '待审核') await (voucher.maker_id === reviewer.id ? api : review)('finance/gl/vouchers/' + voucher.id + '/approve', 'POST', {})
  if (['待审核', '已审核'].includes(voucher.status)) await post('gl/vouchers/' + voucher.id + '/post', {})
}
console.log('Sample data ready in ' + base + ', period ' + month + '. Users: admin, sample_reviewer.')
await api('auth/logout', 'POST', {})
await review('auth/logout', 'POST', {})
