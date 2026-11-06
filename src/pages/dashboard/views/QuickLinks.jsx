import Icon from '../../../shared/ui/Icon.jsx'
import { shortcuts } from '../dashboardData.js'

export default function QuickLinks() {
  return (
    <section className="panel dashboard-panel">
      <div className="panel-heading">
        <div><h2>常用功能</h2><p>快速前往日常业务页面</p></div>
      </div>
      <div className="shortcuts">
        {shortcuts.map(([icon, color, title, link]) => (
          <a key={title} href={`#/${link}`}>
            <span className={`tile-icon ${color}`}><Icon name={icon} size={18} /></span>
            {title}
            <Icon name="chevron" size={14} />
          </a>
        ))}
      </div>
    </section>
  )
}
