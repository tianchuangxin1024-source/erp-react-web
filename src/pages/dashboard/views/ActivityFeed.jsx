import Icon from '../../../shared/ui/Icon.jsx'
import { activities } from '../dashboardData.js'

export default function ActivityFeed() {
  return (
    <section className="panel dashboard-panel">
      <div className="panel-heading">
        <div><h2>近期动态</h2><p>最新财务操作记录</p></div>
        <a className="text-button" href="#/system/logs">操作日志 <Icon name="chevron" size={14} /></a>
      </div>
      <div className="activity-list">
        {activities.map(([icon, color, title, id, date]) => (
          <div className="activity" key={id}>
            <span className={`tile-icon ${color}`}><Icon name={icon} size={15} /></span>
            <span><strong>{title}</strong><small>{id}</small></span>
            <time>{date}</time>
          </div>
        ))}
      </div>
    </section>
  )
}
