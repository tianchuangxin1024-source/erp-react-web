import { useEffect, useState } from 'react'
import { listRecords } from './resources.js'

export function referenceResource(key, resource) {
  if (key === 'bank_account_id') return ['funds/bank-accounts']
  if (key.endsWith('account_id') || key === 'parent_id') return ['gl/accounts']
  if (key === 'period_id') return ['system/periods']
  if (key === 'asset_id') return ['fa/asset-cards']
  if (key === 'role_id') return ['system/permissions']
  if (['assignee_id', 'new_custodian_id'].includes(key)) return ['system/users']
  if (key === 'loan_id') return ['expense/loans']
  if (key === 'cash_order_id') return ['funds/cash-orders']
  if (key === 'trade_id') return [resource.startsWith('ap/') ? 'ap/payables' : 'ar/receivables']
  const type = { department_id: '部门', new_department_id: '部门', project_id: '项目', expense_type_id: '费用类型', party_id: resource.startsWith('ap/') ? '供应商' : '客户' }[key]
  if (type) return ['system/master-data', { data_type: type }]
  return null
}

export function useReferences(keys, resource) {
  const signature = JSON.stringify(keys.map((key) => [key, referenceResource(key, resource)]).filter(([, source]) => source))
  const [references, setReferences] = useState({})
  useEffect(() => {
    const controller = new AbortController()
    Promise.all(JSON.parse(signature).map(async ([key, [path, params]]) => {
      try {
        const data = await listRecords(path, { ...params, size: 200 }, controller.signal)
        return [key, data.items.map((row) => ({ value: row.id, label: [row.code || row.order_no || row.period_code || row.username, row.name || row.party || row.purpose].filter(Boolean).join(' · ') + ' (#' + row.id + ')' }))]
      } catch { return [key, null] }
    })).then((entries) => { if (!controller.signal.aborted) setReferences(Object.fromEntries(entries)) })
    return () => controller.abort()
  }, [signature])
  return references
}
