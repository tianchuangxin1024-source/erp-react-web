import { useEffect, useRef } from 'react'
import Icon from './Icon.jsx'
import './ApiDialog.css'

export default function ApiDialog({ request, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    const dialog = ref.current
    dialog.showModal()
    return () => dialog.close()
  }, [])

  return (
    <dialog ref={ref} className="api-dialog" aria-labelledby="api-title" onCancel={(event) => { event.preventDefault(); onClose() }} onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div className="dialog-body">
        <div className="dialog-header">
          <span className="tile-icon mint"><Icon name="code" /></span>
          <button className="icon-button" type="button" aria-label="关闭弹窗" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div className="eyebrow">接口功能说明</div>
        <h2 id="api-title">{request.title}</h2>
        <p className="dialog-description">{request.description}</p>
        {request.context?.length > 0 && <div className="dialog-context"><h3>当前操作参数</h3><dl>{request.context.map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl></div>}
        <div className="dialog-note"><Icon name="info" size={17} /> 原型演示 · 此操作尚未连接后端接口</div>
        <div className="dialog-footer"><button className="button primary" type="button" onClick={onClose} autoFocus>我知道了</button></div>
      </div>
    </dialog>
  )
}
