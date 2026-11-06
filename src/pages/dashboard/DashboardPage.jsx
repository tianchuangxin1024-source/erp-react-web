import Icon from '../../shared/ui/Icon.jsx'
import ActivityFeed from './views/ActivityFeed.jsx'
import CashFlowPanel from './views/CashFlowPanel.jsx'
import MetricCards from './views/MetricCards.jsx'
import QuickLinks from './views/QuickLinks.jsx'
import TaskList from './views/TaskList.jsx'
import './DashboardPage.css'

export default function DashboardPage({ openApi }) {
  function showPeriod() {
    openApi({
      title: '查询会计期间',
      description: '返回当前启用的会计期间、开始及结束日期和结账状态，供工作台指标及业务页面选择。',
      context: [['会计期间', '2026-11']],
    })
  }

  return (
    <>
      <div className="page-heading dashboard-heading">
        <div>
          <div className="eyebrow">财务工作台</div>
          <h1>财务总览</h1>
          <p>查看资金表现、待办事项与近期财务动态。</p>
        </div>
        <button type="button" className="button secondary" onClick={showPeriod}>
          <Icon name="calendar" size={17} /> 2026 年 11 月
        </button>
      </div>
      <MetricCards openApi={openApi} />
      <div className="dashboard-grid">
        <CashFlowPanel openApi={openApi} />
        <TaskList />
        <QuickLinks />
        <ActivityFeed />
      </div>
    </>
  )
}
