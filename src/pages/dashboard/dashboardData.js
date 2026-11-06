export const metrics = [
  { title: '资金余额', value: '2,492,820.00', hint: '银行账户及库存现金', icon: 'wallet', color: 'mint', action: '查询资金余额', description: '汇总当前账套已启用银行账户与现金账户的余额，按币种返回原币及本位币金额。' },
  { title: '本月收款', value: '684,500.00', hint: '已确认收款合计', icon: 'income', color: 'blue', action: '查询本月收款', description: '按当前会计期间和已确认状态统计收款，返回总额、币种和相关资金流水。' },
  { title: '本月付款', value: '428,300.00', hint: '已确认付款合计', icon: 'outcome', color: 'gold', action: '查询本月付款', description: '按当前会计期间和已确认状态统计付款，返回总额、币种和相关资金流水。' },
  { title: '待办事项', value: '12', hint: '凭证、报销及应付待办', icon: 'receipt', color: 'violet', action: '查询待办事项', description: '按当前用户角色和数据权限统计待审核凭证、待审批报销与待处理应付单。' },
]

export const tasks = [
  ['book', 'mint', '凭证待审核', '检查分录和借贷平衡', '5', 'gl/vouchers'],
  ['receipt', 'gold', '报销待审批', '查看费用单据和审批节点', '4', 'expense/approvals'],
  ['outcome', 'violet', '应付待处理', '审核单据并跟踪付款', '3', 'ap/payables'],
]

export const shortcuts = [
  ['book', 'mint', '凭证管理', 'gl/vouchers'],
  ['wallet', 'blue', '银行对账', 'funds/reconciliation'],
  ['chart', 'violet', '资产负债表', 'reports/balance-sheet'],
  ['asset', 'gold', '资产卡片', 'fa/asset-cards'],
]

export const activities = [
  ['check', 'mint', '供应商付款已完成核销', 'AP-202611-002', '11-06 10:24'],
  ['book', 'blue', '办公设备采购凭证已提交', '记-2026-11-0008', '11-06 09:12'],
  ['receipt', 'gold', '差旅费用报销进入审批', 'BX-202611-014', '11-05 16:35'],
]
