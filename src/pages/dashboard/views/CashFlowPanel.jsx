export default function CashFlowPanel({ trend, period }) {
  const [year, month] = period.split('-').map(Number)
  const months = Array.from({ length: 6 }, (_, index) => new Date(year, month - 6 + index, 1).toLocaleDateString('sv-SE').slice(0, 7))
  const series = months.map((code) => ({
    code, receipts: trend.filter((row) => row.period_code === code).reduce((sum, row) => sum + Number(row.receipts), 0) / 10000,
    payments: trend.filter((row) => row.period_code === code).reduce((sum, row) => sum + Number(row.payments), 0) / 10000,
  }))
  const max = Math.max(1, ...series.flatMap((row) => [row.receipts, row.payments]))
  return <section className="panel dashboard-panel">
    <div className="panel-heading"><div><h2>资金收付趋势</h2><p>近 6 个月 · 单位 万元</p></div><a className="text-button" href="#/funds/cash-orders">查看流水</a></div>
    <div className="chart-legend"><span><i /> 收款</span><span><i /> 付款</span></div>
    <svg className="cash-chart" role="img" aria-label="近六个月实际资金收付柱状图" viewBox="0 0 650 225">
      {[4, 3, 2, 1, 0].map((tick, index) => <g key={tick}><text x="0" y={27 + index * 42}>{(max * tick / 4).toFixed(1)}</text><line x1="34" x2="645" y1={23 + index * 42} y2={23 + index * 42} stroke="#e9eeeb" /></g>)}
      {series.map((row, index) => {
        const x = 68 + index * 101
        return <g key={row.code}>
          <rect x={x} y={191 - row.receipts / max * 168} width="22" height={row.receipts / max * 168} rx="4" fill="#12836d"><title>{row.code} 收款 {row.receipts} 万元</title></rect>
          <rect x={x + 28} y={191 - row.payments / max * 168} width="22" height={row.payments / max * 168} rx="4" fill="#a9d9cd"><title>{row.code} 付款 {row.payments} 万元</title></rect>
          <text x={x + 25} y="214" textAnchor="middle">{row.code.slice(5)}月</text>
        </g>
      })}
    </svg>
  </section>
}
