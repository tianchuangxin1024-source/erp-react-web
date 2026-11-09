import { useEffect, useState } from 'react'
import { displayPage, filterParams, initialFilters, listRecords, financeRequest } from '../../features/finance/api/resources.js'
import { operations, pageActions } from '../../features/finance/api/operations.js'
import { queryString } from '../../shared/api/client.js'
import Icon from '../../shared/ui/Icon.jsx'
import FinanceFilters from './views/FinanceFilters.jsx'
import FinanceRecords from './views/FinanceRecords.jsx'
import OperationDialog from './views/OperationDialog.jsx'
import './FinancePage.css'

export default function FinancePage({ module, page, canWrite }) {
  const resource = module.id + '/' + page.id
  const [filters, setFilters] = useState(() => initialFilters(page))
  const [query, setQuery] = useState(() => ({ ...filterParams(page, initialFilters(page)), page: 1, size: 20 }))
  const [data, setData] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState([])
  const [operation, setOperation] = useState(null)
  const actions = pageActions(page).filter(([title]) => {
    const action = operations[page.id][title]
    return canWrite || action.method === 'GET' || action.download || action.refresh
  })
  const view = displayPage(page, data.items, actions, query)
  const toolbar = actions.filter((action) => action[2] !== 'row')
  const rowActions = actions.filter((action) => action[2] === 'row')
  if (!rowActions.some(([title]) => title.startsWith('查看')) && !page.id.endsWith('-aging') && !['ledgers', 'balance-sheet', 'income-statement', 'cash-flow'].includes(page.id)) rowActions.unshift(['查看详情'])
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    listRecords(resource, query, controller.signal)
      .then((result) => { setData(result); setSelected([]); setError('') })
      .catch((failure) => { if (failure.name !== 'AbortError') { setError(failure.message); setData({ items: [], total: 0 }) } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [resource, query, revision])

  function refresh() { setRevision((value) => value + 1) }

  async function runAction([title], id) {
    setError('')
    const action = operations[page.id][title] || { method: 'GET', suffix: '/:id', row: true }
    if (action.refresh) { refresh(); return }
    if (action.batch && !selected.length) { setError('请先勾选需要处理的凭证。'); return }
    if (action.download) {
      try { await financeRequest(resource + '/export?' + queryString({ ...query, page: undefined, size: undefined }), { download: true }) } catch (failure) { setError(failure.message) }
      return
    }
    let initial = data.items.find((item) => String(item.id) === String(id)) || {}
    try {
      if (action.reportConfig && data.report) {
        id = data.report.id
        const lines = await Promise.all(data.items.map(async (line) => {
          const detail = await financeRequest(resource + '/' + id + '/lines/' + line.line_no + '/ledger?' + queryString({ period_code: query.period_code }))
          return detail.terms.map((term) => ({ ...term, line_no: line.line_no }))
        }))
        initial = { name: data.report.name, lines: lines.flat() }
      }
      if (action.suffix?.endsWith('/edit') || (page.id === 'custom-reports' && action.suffix?.endsWith('/configure'))) initial = await financeRequest(resource + '/' + id)
      setOperation({ ...action, suffix: action.reportConfig && id ? '/:id/configure' : action.suffix, title, id, initial, resource: action.resource || resource })
    } catch (failure) { setError(failure.message) }
  }

  async function submit(body) {
    const params = { ...body }
    let suffix = operation.suffix || ''
    for (const match of suffix.matchAll(/:([a-z_]+)/g)) {
      const key = match[1]
      const value = key === 'id' ? operation.id : params[key]
      if (value == null || value === '') throw new Error('缺少操作所需的记录或期间')
      suffix = suffix.replace(':' + key, encodeURIComponent(value))
      delete params[key]
    }
    let payload = params
    if (operation.batch) payload = { ids: selected }
    if (params.file) {
      if (operation.attachment && params.file.size > 10 * 1024 * 1024) throw new Error('单份附件不能超过 10MB')
      payload = new FormData()
      for (const [key, value] of Object.entries(params)) payload.append(key, value)
    }
    const path = operation.resource + suffix + (operation.method === 'GET' ? '?' + queryString({ ...query, ...params }) : '')
    const result = await financeRequest(path, { method: operation.method, download: operation.downloadFile, body: operation.method === 'GET' ? undefined : payload })
    if (operation.method !== 'GET') refresh()
    return result
  }

  function search() {
    setLoading(true)
    setQuery({ ...filterParams(page, filters), page: 1, size: 20 })
  }

  return <>
    <div className="page-heading">
      <div><div className="eyebrow"><Icon name={module.icon} size={15} /> {module.title}</div><h1>{page.title}</h1><p>{page.description}</p></div>
      {toolbar[0] && <button className="button primary" type="button" onClick={() => runAction(toolbar[0])}>{toolbar[0][0]}</button>}
    </div>
    <FinanceFilters page={{ ...page, rows: [] }} filters={filters} onChange={(name, value) => setFilters((current) => ({ ...current, [name]: value }))} onReset={() => setFilters(initialFilters(page))} onQuery={search} />
    {error && <p className="request-error" role="alert">{error}</p>}
    {loading && <p role="status">正在加载数据…</p>}
    <FinanceRecords page={view} actions={toolbar.slice(1)} rowActions={rowActions} rowIds={data.items.map((item) => item.id)} selected={selected} onSelectionChange={setSelected} onAction={runAction} />
    <div className="pagination">
      <span>共 {data.total} 条</span>
      <button className="button secondary compact" type="button" disabled={loading || query.page <= 1} onClick={() => setQuery({ ...query, page: query.page - 1 })}>上一页</button>
      <span>第 {query.page} 页</span>
      <button className="button secondary compact" type="button" disabled={loading || query.page * query.size >= data.total || data.page == null} onClick={() => setQuery({ ...query, page: query.page + 1 })}>下一页</button>
    </div>
    {operation && <OperationDialog title={operation.title} operation={operation} initial={operation.initial} onSubmit={submit} onClose={() => setOperation(null)} />}
  </>
}
