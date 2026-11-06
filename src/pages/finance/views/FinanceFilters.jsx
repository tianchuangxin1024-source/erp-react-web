import { selectOptions } from '../../../features/finance/model/filterOptions.js'
import Icon from '../../../shared/ui/Icon.jsx'

function FilterField({ name, value, onChange, options }) {
  const type = name.includes('日期') ? 'date' : name.includes('期间') ? 'month' : name === '会计年度' ? 'number' : 'text'
  return (
    <label className="filter-field">
      <span>{name}</span>
      {options ? (
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          <option value="">全部</option>
          {options.map((option) => <option key={option}>{option}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={type === 'text' ? `输入${name}` : undefined}
        />
      )}
    </label>
  )
}

export default function FinanceFilters({ page, filters, onChange, onReset, onQuery }) {
  const stateColumn = page.columns.findIndex((column) => column.includes('状态'))
  const availableStates = stateColumn < 0 ? [] : [...new Set(page.rows.map((row) => row[stateColumn]))]

  function submit(event) {
    event.preventDefault()
    onQuery()
  }

  return (
    <section className="panel filter-panel" aria-label="查询条件">
      <form onSubmit={submit}>
        <div className="filter-fields">
          {page.filters.map((name) => (
            <FilterField
              key={name}
              name={name}
              value={filters[name] ?? ''}
              onChange={(value) => onChange(name, value)}
              options={name === '状态' && availableStates.length ? availableStates : selectOptions[name]}
            />
          ))}
        </div>
        <div className="filter-buttons">
          <button className="button primary" type="submit"><Icon name="search" size={17} /> 查询</button>
          <button className="button secondary" type="button" onClick={onReset}>重置</button>
        </div>
      </form>
    </section>
  )
}
