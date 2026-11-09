import { useEffect, useRef, useState } from 'react'
import { fieldChoices, fieldLabels, lineSchemas, parseField } from '../../../features/finance/api/fields.js'
import { useReferences } from '../../../features/finance/api/useReferences.js'
import Icon from '../../../shared/ui/Icon.jsx'
import '../../../shared/ui/ApiDialog.css'
import './OperationDialog.css'

function Fields({ specs, values, onChange, references, operationFileTypes }) {
  return specs.map((spec) => {
    const { key, optional, kind } = parseField(spec)
    const value = values[key] ?? ''
    const label = fieldLabels[key] || key
    if (lineSchemas[kind]) {
      const rows = Array.isArray(value) ? value : [{}]
      return <fieldset className="line-editor" key={key}>
        <legend>{label}</legend>
        {rows.map((line, index) => <div className="line-item" key={index}>
          <div className="operation-fields"><Fields specs={lineSchemas[kind].split(' ')} values={line} references={references} operationFileTypes={operationFileTypes} onChange={(field, next) => onChange(key, rows.map((current, i) => i === index ? { ...current, [field]: next } : current))} /></div>
          <button className="text-button" type="button" disabled={rows.length === 1} onClick={() => onChange(key, rows.filter((_, i) => i !== index))}>删除此行</button>
        </div>)}
        <button className="button secondary" type="button" onClick={() => onChange(key, [...rows, {}])}>添加一行</button>
      </fieldset>
    }
    const choices = references[key] || fieldChoices[key]?.map((option) => ({ value: option, label: option }))
    let input
    if (kind === 'boolean') input = <input type="checkbox" checked={value === true} onChange={(event) => onChange(key, event.target.checked)} />
    else if (key === 'file') input = <input type="file" accept={operationFileTypes} required onChange={(event) => onChange(key, event.target.files[0])} />
    else if (choices) input = <select value={value} required={!optional} onChange={(event) => onChange(key, event.target.value)}><option value="">请选择</option>{choices.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
    else input = <input
      type={key === 'password' ? 'password' : key.includes('date') || ['settled_on', 'reversed_on', 'issued_on'].includes(key) ? 'date' : key === 'period_code' ? 'month' : 'text'}
      minLength={key === 'password' ? 12 : undefined}
      value={kind === 'numbers' && Array.isArray(value) ? value.join(',') : value}
      required={!optional}
      onChange={(event) => onChange(key, event.target.value)}
    />
    return <label className="filter-field" key={key}><span>{label}{optional ? '（选填）' : ' *'}</span>{input}</label>
  })
}

export function ResultView({ data }) {
  if (data == null) return <p>操作完成</p>
  if (typeof data !== 'object') return <span>{String(data)}</span>
  if (Array.isArray(data)) return <div>{data.length ? data.map((item, index) => <div className="result-item" key={index}><ResultView data={item} /></div>) : '无记录'}</div>
  return <dl className="result-list">{Object.entries(data).map(([key, value]) => <div key={key}><dt>{fieldLabels[key] || key}</dt><dd><ResultView data={value} /></dd></div>)}</dl>
}

export default function OperationDialog({ title, operation, initial = {}, onSubmit, onClose }) {
  const ref = useRef(null)
  const specs = (operation.fields || '').split(' ').filter(Boolean)
  const keys = specs.flatMap((spec) => {
    const field = parseField(spec)
    return [field.key, ...(lineSchemas[field.kind]?.split(' ').map((item) => parseField(item).key) || [])]
  })
  const references = useReferences(keys, operation.resource || '')
  const [values, setValues] = useState(() => {
    const defaults = { ...initial, ...operation.defaults }
    if (specs.includes('request_key')) defaults.request_key = crypto.randomUUID()
    for (const spec of specs) {
      const { key, kind, optional } = parseField(spec)
      if (!optional && !defaults[key] && (key.includes('date') || ['settled_on', 'reversed_on', 'issued_on'].includes(key))) defaults[key] = new Date().toLocaleDateString('sv-SE')
      if (key === 'period_code' && !defaults[key]) defaults[key] = new Date().toLocaleDateString('sv-SE').slice(0, 7)
      if (lineSchemas[kind] && !defaults[key]) defaults[key] = [{}]
    }
    return defaults
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(undefined)
  useEffect(() => {
    const dialog = ref.current
    dialog.showModal()
    return () => dialog.close()
  }, [])

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const body = { ...operation.defaults }
      for (const spec of specs) {
        const { key, kind } = parseField(spec)
        if (values[key] === '' || values[key] == null) continue
        if (lineSchemas[kind]) {
          body[key] = values[key].map((line) => Object.fromEntries(lineSchemas[kind].split(' ').map((item) => {
            const field = parseField(item)
            return [field.key, field.kind === 'boolean' ? line[field.key] === true : line[field.key]]
          })))
        } else {
          body[key] = kind === 'numbers' ? String(values[key]).split(',').map(Number) : values[key]
        }
      }
      const clean = (value) => Array.isArray(value) ? value.map(clean) : value && typeof value === 'object' && !(value instanceof File) ? Object.fromEntries(Object.entries(value).filter(([, item]) => item !== '' && item != null).map(([key, item]) => [key, clean(item)])) : value
      setResult((await onSubmit(clean(body))) ?? { success: true })
    } catch (failure) {
      setError(failure.message)
    } finally { setBusy(false) }
  }

  return <dialog ref={ref} className="api-dialog operation-dialog" aria-labelledby="operation-title" onCancel={(event) => { event.preventDefault(); if (!busy) onClose() }}>
    <div className="dialog-body">
      <div className="dialog-header"><h2 id="operation-title">{title}</h2><button className="icon-button" type="button" aria-label="关闭弹窗" onClick={onClose} disabled={busy}><Icon name="close" /></button></div>
      {operation.unsupported ? <p>{operation.unsupported}</p> : result !== undefined ? <><p role="status">操作成功</p><ResultView data={result} /></> : <form onSubmit={submit}>
        {specs.length ? <div className="operation-fields"><Fields specs={specs} values={values} references={references} operationFileTypes={operation.attachment ? 'image/png,image/jpeg,application/pdf' : '.csv'} onChange={(key, value) => setValues((current) => ({ ...current, [key]: value }))} /></div> : <p>确认执行「{title}」？</p>}
        {error && <p className="request-error" role="alert">{error}</p>}
        <div className="dialog-footer"><button className="button primary" type="submit" disabled={busy}>{busy ? '处理中…' : operation.method === 'GET' ? '查询' : '确认提交'}</button></div>
      </form>}
    </div>
  </dialog>
}
