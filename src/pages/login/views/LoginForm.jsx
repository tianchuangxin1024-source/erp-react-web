import { useState } from 'react'
import Icon from '../../../shared/ui/Icon.jsx'

export default function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try { await onLogin(username, password) }
    catch (failure) { setError(failure.message) }
    finally { setBusy(false) }
  }

  return (
    <div className="login-card">
      <div className="eyebrow">账户登录</div>
      <h2>欢迎回来</h2>
      <p className="muted">请登录以进入财务工作台。</p>
      <form className="login-form" onSubmit={submit}>
        <label htmlFor="username">账号</label>
        <div className="login-input"><Icon name="user" size={18} /><input id="username" name="username" autoComplete="username" placeholder="请输入账号" value={username} onChange={(event) => { setUsername(event.target.value); setError('') }} required /></div>
        <label htmlFor="password">密码</label>
        <div className="login-input"><Icon name="lock" size={18} /><input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="请输入密码" value={password} onChange={(event) => { setPassword(event.target.value); setError('') }} required /><button type="button" className="icon-button" aria-label={showPassword ? '隐藏密码' : '显示密码'} onClick={() => setShowPassword(!showPassword)}><Icon name="eye" size={18} /></button></div>
        {error && <p className="login-error" role="alert">{error}</p>}
        <button type="submit" className="button primary login-submit" disabled={busy}>{busy ? '登录中…' : '登录系统'} <Icon name="arrow" size={18} /></button>
      </form>
    </div>
  )
}
