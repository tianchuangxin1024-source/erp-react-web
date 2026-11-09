import Icon from '../../../shared/ui/Icon.jsx'

function statusClass(value) {
  if (/^(已|使用中|进行中)/.test(value)) return 'status positive'
  if (/^(待|部分|有待)/.test(value)) return 'status pending'
  return 'status neutral'
}

function RowActions({ id, actions, onAction }) {
  function selectAction(event) {
    const action = actions.find(([title]) => title === event.target.value)
    if (action) onAction(action, id)
  }

  return (
    <select className="row-action" aria-label={`${id} 的操作`} value="" onChange={selectAction}>
      <option value="">选择操作</option>
      {actions.map(([title]) => <option key={title}>{title}</option>)}
    </select>
  )
}

export default function FinanceRecords({ page, actions, rowActions, rowIds, selected, onSelectionChange, onAction }) {
  const { rows, columns } = page
  const hasSelection = actions.some(([, , scope]) => scope === 'selection')
  const allSelected = rows.length > 0 && selected.length === rows.length

  function toggleSelected(id) {
    onSelectionChange(selected.includes(id) ? selected.filter((value) => value !== id) : [...selected, id])
  }

  return (
    <section className="panel data-panel">
      <div className="data-header">
        <div>
          <h2>{page.title}{page.id === 'ledgers' ? '结果' : '记录'}</h2>
          <p>{rows.length ? `当前页 · 共 ${rows.length} 条` : '按当前条件查询'}</p>
        </div>
        <div className="toolbar">
          {actions.map((action) => (
            <button className="button secondary compact" key={action[0]} type="button" onClick={() => onAction(action)}>
              {action[0]}
            </button>
          ))}
        </div>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {hasSelection && (
                <th className="check-cell">
                  <input
                    type="checkbox"
                    aria-label="全选凭证"
                    checked={allSelected}
                    onChange={(event) => onSelectionChange(event.target.checked ? rowIds : [])}
                  />
                </th>
              )}
              {columns.map((column) => <th key={column}>{column}</th>)}
              {rowActions.length > 0 && <th>操作</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const id = rowIds[index] ?? row[0]
              return (
                <tr key={id}>
                  {hasSelection && (
                    <td className="check-cell">
                      <input
                        type="checkbox"
                        aria-label={`选择 ${id}`}
                        checked={selected.includes(id)}
                        onChange={() => toggleSelected(id)}
                      />
                    </td>
                  )}
                  {row.map((value, index) => (
                    <td key={columns[index]}>
                      {columns[index].includes('状态') ? <span className={statusClass(value)}>{value}</span> : value}
                    </td>
                  ))}
                  {rowActions.length > 0 && <td><RowActions id={id} actions={rowActions} onAction={onAction} /></td>}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <div className="empty-state">
          <span className="tile-icon mint"><Icon name="inbox" size={23} /></span>
          <strong>暂无查询结果</strong>
          <p>请调整查询条件，或新增业务记录。</p>
        </div>
      )}
      {selected.length > 0 && <div className="selection-note">已选中 {selected.length} 条记录</div>}
    </section>
  )
}
