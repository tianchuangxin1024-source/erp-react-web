import { useState } from 'react'
import Icon from '../../shared/ui/Icon.jsx'
import FinanceFilters from './views/FinanceFilters.jsx'
import FinanceRecords from './views/FinanceRecords.jsx'
import './FinancePage.css'

export default function FinancePage({ module, page, openApi }) {
  const [filters, setFilters] = useState({})
  const [selected, setSelected] = useState([])
  const toolbar = page.actions.filter((action) => action[2] !== 'row')
  const rowActions = page.actions.filter((action) => action[2] === 'row')
  const queryContext = Object.entries(filters).filter(([, value]) => value)

  function runAction([title, description, scope], id) {
    const context = [...queryContext]
    if (id) context.push([page.columns[0], id])
    if (scope === 'selection') context.push(['所选凭证', selected.join('、') || '尚未选择，请先勾选要处理的凭证'])
    openApi({ title, description, context })
  }

  return (
    <>
      <div className="page-heading">
        <div><div className="eyebrow"><Icon name={module.icon} size={15} /> {module.title}</div><h1>{page.title}</h1><p>{page.description}</p></div>
        {toolbar[0] && <button className="button primary" type="button" onClick={() => runAction(toolbar[0])}><Icon name={/^(新|登|申请|编制)/.test(toolbar[0][0]) ? 'plus' : 'arrow'} size={18} /> {toolbar[0][0]}</button>}
      </div>
      <FinanceFilters
        page={page}
        filters={filters}
        onChange={(name, value) => setFilters((current) => ({ ...current, [name]: value }))}
        onReset={() => setFilters({})}
        onQuery={() => openApi({ title: `查询${page.title}`, description: page.query, context: queryContext })}
      />
      <FinanceRecords
        page={page}
        actions={toolbar.slice(1)}
        rowActions={rowActions}
        selected={selected}
        onSelectionChange={setSelected}
        onAction={runAction}
      />
      <p className="workspace-note"><Icon name="info" size={15} /> 当前为演示环境，查询与业务操作会显示接口功能说明。</p>
    </>
  )
}
