import Icon from '../../../shared/ui/Icon.jsx'
import { tasks } from '../dashboardData.js'

export default function TaskList() {
  return (
    <section className="panel dashboard-panel">
      <div className="panel-heading">
        <div><h2>待办事项</h2><p>需要跟进的财务工作</p></div>
        <span className="count-label">12 项</span>
      </div>
      <div className="task-list">
        {tasks.map(([icon, color, title, hint, count, link]) => (
          <a key={title} className="task" href={`#/${link}`}>
            <span className={`tile-icon ${color}`}><Icon name={icon} size={18} /></span>
            <span><strong>{title}</strong><small>{hint}</small></span>
            <span className="task-count">{count}</span>
            <Icon name="chevron" size={15} />
          </a>
        ))}
      </div>
    </section>
  )
}
