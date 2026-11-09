import Icon from '../../../shared/ui/Icon.jsx'

const labels = {
  'gl/vouchers': ['book', 'mint', '凭证待审核'],
  'expense/approvals': ['receipt', 'gold', '报销待审批'],
  'ap/payables': ['outcome', 'violet', '应付待处理'],
}
export default function TaskList({ tasks }) {
  return <section className="panel dashboard-panel">
    <div className="panel-heading"><div><h2>待办事项</h2><p>当前用户的财务工作</p></div></div>
    <div className="task-list">{tasks.map((task) => {
      const [icon, color, title] = labels[task.resource] || ['book', 'mint', task.resource]
      return <a key={task.resource} className="task" href={`#/${task.resource}`}>
        <span className={`tile-icon ${color}`}><Icon name={icon} size={18} /></span>
        <strong>{title}</strong><span className="task-count">{task.total}</span><Icon name="chevron" size={15} />
      </a>
    })}</div>
  </section>
}
