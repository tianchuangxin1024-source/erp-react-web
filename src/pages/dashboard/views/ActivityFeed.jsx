import Icon from '../../../shared/ui/Icon.jsx'

export default function ActivityFeed({ activities }) {
  return <section className="panel dashboard-panel">
    <div className="panel-heading"><div><h2>近期动态</h2><p>最新财务操作记录</p></div><a className="text-button" href="#/system/logs">操作日志 <Icon name="chevron" size={14} /></a></div>
    <div className="activity-list">{activities.length ? activities.map((item) => <a className="activity" key={item.id} href={`#/${item.resource}`}>
      <span className="tile-icon mint"><Icon name="clock" size={15} /></span>
      <span><strong>{item.operation}</strong><small>{item.resource} · #{item.object_id}</small></span>
      <time>{String(item.operated_at).replace('T', ' ').slice(0, 16)}</time>
    </a>) : <p className="muted">暂无操作记录</p>}</div>
  </section>
}
