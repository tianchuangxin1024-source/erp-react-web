import { useEffect, useState } from 'react'
import { listRecords } from '../../features/finance/api/resources.js'
import MetricCards from './views/MetricCards.jsx'
import TaskList from './views/TaskList.jsx'
import QuickLinks from './views/QuickLinks.jsx'
import ActivityFeed from './views/ActivityFeed.jsx'
import CashFlowPanel from './views/CashFlowPanel.jsx'
import './DashboardPage.css'

export default function DashboardPage() {
  const [period, setPeriod] = useState(() => new Date().toLocaleDateString('sv-SE').slice(0, 7))
  const [currency, setCurrency] = useState('CNY')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    listRecords('dashboard', { period_code: period, currency }, controller.signal)
      .then((result) => { setData(result); setError('') })
      .catch((failure) => { if (failure.name !== 'AbortError') setError(failure.message) })
    return () => controller.abort()
  }, [period, currency])
  return <>
    <div className="page-heading dashboard-heading">
      <div><div className="eyebrow">财务工作台</div><h1>财务总览</h1><p>查看资金表现、待办事项与近期财务动态。</p></div>
      <div className="filter-buttons">
        <label className="filter-field">会计期间<input type="month" value={period} onChange={(event) => setPeriod(event.target.value)} required /></label>
        <label className="filter-field">币种<select value={currency} onChange={(event) => setCurrency(event.target.value)}>{['CNY', 'USD', 'EUR', 'HKD'].map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>
    </div>
    {error && <p className="request-error" role="alert">{error}</p>}
    {!data ? <p role="status">正在加载工作台…</p> : <>
      <MetricCards data={data} currency={currency} />
      <div className="dashboard-grid">
        <CashFlowPanel trend={data.trend} period={period} />
        <TaskList tasks={data.tasks} />
        <QuickLinks />
        <ActivityFeed activities={data.activities} />
      </div>
    </>}
  </>
}
