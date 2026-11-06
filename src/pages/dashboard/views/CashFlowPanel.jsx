import Icon from '../../../shared/ui/Icon.jsx'

function CashChart() {
  const months = ['6月', '7月', '8月', '9月', '10月', '11月']
  const incomes = [44, 59, 53, 67, 62, 68.45]
  const outcomes = [27, 36, 30, 49, 36, 42.83]
  return <svg className="cash-chart" role="img" aria-label="6 月至 11 月演示资金收付柱状图，11 月收款 68.45 万元、付款 42.83 万元" viewBox="0 0 650 225">
    {[80, 60, 40, 20, 0].map((value, index) => <g key={value}><text x="0" y={27 + index * 42}>{value}</text><line x1="34" x2="645" y1={23 + index * 42} y2={23 + index * 42} stroke="#e9eeeb" strokeDasharray={value ? '4 4' : undefined} /></g>)}
    {months.map((month, index) => {
      const x = 68 + index * 101
      return <g key={month}>
        <rect x={x} y={191 - incomes[index] * 2.1} width="22" height={incomes[index] * 2.1} rx="4" fill="#12836d"><title>{month}收款 {incomes[index]} 万元</title></rect>
        <rect x={x + 28} y={191 - outcomes[index] * 2.1} width="22" height={outcomes[index] * 2.1} rx="4" fill="#a9d9cd"><title>{month}付款 {outcomes[index]} 万元</title></rect>
        <text x={x + 25} y="214" textAnchor="middle">{month}</text>
      </g>
    })}
  </svg>
}

export default function CashFlowPanel({ openApi }) {
  return (
    <section className="panel dashboard-panel">
      <div className="panel-heading"><div><h2>资金收付趋势</h2><p>近 6 个月 · 单位 万元</p></div><button type="button" className="text-button" onClick={() => openApi({ title: '查询资金收付趋势', description: '按会计期间、账户和币种汇总已确认的收款和付款，返回近 6 个月收款额、付款额及净现金流。' })}>查看统计 <Icon name="chevron" size={14} /></button></div>
      <div className="chart-legend"><span><i /> 收款</span><span><i /> 付款</span></div>
      <CashChart />
    </section>
  )
}
