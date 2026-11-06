import Icon from '../../../shared/ui/Icon.jsx'
import { metrics } from '../dashboardData.js'

export default function MetricCards({ openApi }) {
  return (
    <div className="metrics-grid">
      {metrics.map((metric, index) => <button type="button" className="metric panel" key={metric.title} onClick={() => openApi({ title: metric.action, description: metric.description })}>
        <span className="metric-top"><span className={`tile-icon ${metric.color}`}><Icon name={metric.icon} size={19} /></span><Icon name="chevron" size={16} /></span>
        <span className="metric-title">{metric.title}</span>
        <strong>{index < 3 && <small>¥</small>}{metric.value}{index === 3 && <small> 项</small>}</strong>
        <span className="muted">{metric.hint}</span>
      </button>)}
    </div>
  )
}
