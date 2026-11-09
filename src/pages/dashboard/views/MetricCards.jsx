import Icon from '../../../shared/ui/Icon.jsx'

export default function MetricCards({ data, currency }) {
  const sum = (rows, key) => rows.reduce((total, row) => total + Number(row[key] || 0), 0)
  const metrics = [
    { title: '资金余额', value: sum(data.balances, 'balance'), icon: 'wallet', color: 'mint', route: 'funds/bank-accounts' },
    { title: '本月收款', value: sum(data.monthly, 'receipts'), icon: 'income', color: 'blue', route: 'funds/cash-orders' },
    { title: '本月付款', value: sum(data.monthly, 'payments'), icon: 'outcome', color: 'gold', route: 'funds/cash-orders' },
    { title: '待办事项', value: sum(data.tasks, 'total'), icon: 'receipt', color: 'violet', route: 'gl/vouchers' },
  ]
  return <div className="metrics-grid">
    {metrics.map((metric, index) => <a className="metric panel" key={metric.title} href={`#/${metric.route}`}>
      <span className="metric-top"><span className={`tile-icon ${metric.color}`}><Icon name={metric.icon} size={19} /></span><Icon name="chevron" size={16} /></span>
      <span className="metric-title">{metric.title}</span>
      <strong>{metric.value.toLocaleString('zh-CN', { minimumFractionDigits: index < 3 ? 2 : 0 })}</strong>
      <span className="muted">{index < 3 ? currency : '当前用户可处理的工作'}</span>
    </a>)}
  </div>
}
