import { useState } from 'react'
import { registerAccount } from '../../../features/auth/registrationApi.js'
import { useRegistrationCaptcha } from '../../../features/auth/useRegistrationCaptcha.js'
import Icon from '../../../shared/ui/Icon.jsx'
import CaptchaField from './CaptchaField.jsx'

export default function RegisterForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [captcha, setCaptcha] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [registered, setRegistered] = useState(false)
  const challenge = useRegistrationCaptcha()

  function refreshCaptcha() {
    setCaptcha('')
    challenge.refresh()
  }

  async function submit(event) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    try {
      await registerAccount({ username, password, captcha })
      setPassword('')
      setCaptcha('')
      setRegistered(true)
    } catch (failure) {
      setError(failure.message)
      refreshCaptcha()
    } finally {
      setBusy(false)
    }
  }

  if (registered) {
    return <div className="login-card registration-success">
      <span className="tile-icon mint"><Icon name="check" size={25} /></span>
      <h2>注册成功</h2>
      <p role="status">账号 {username.trim()} 已创建，请使用账号和密码登录。</p>
      <a className="button primary login-submit" href="#/login">前往登录 <Icon name="arrow" size={18} /></a>
    </div>
  }

  return <div className="login-card">
    <div className="eyebrow">账户注册</div>
    <h2>创建账号</h2>
    <p className="muted">设置账号和密码，填写图形验证码后注册。</p>
    <form className="login-form" onSubmit={submit}>
      <label htmlFor="registration-username">账号</label>
      <div className="login-input">
        <Icon name="user" size={18} />
        <input id="registration-username" name="username" autoComplete="username" placeholder="请输入账号" value={username} onChange={(event) => setUsername(event.target.value)} disabled={busy} required />
      </div>
      <label htmlFor="registration-password">密码</label>
      <div className="login-input">
        <Icon name="lock" size={18} />
        <input id="registration-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="请输入密码" value={password} onChange={(event) => setPassword(event.target.value)} disabled={busy} required />
        <button className="icon-button" type="button" aria-label={showPassword ? '隐藏密码' : '显示密码'} onClick={() => setShowPassword(!showPassword)}><Icon name="eye" size={18} /></button>
      </div>
      <CaptchaField image={challenge.image} loading={challenge.loading} error={challenge.error} value={captcha} onChange={setCaptcha} onRefresh={refreshCaptcha} disabled={busy} />
      {error && <p className="login-error" role="alert">{error}</p>}
      <button className="button primary login-submit" type="submit" disabled={busy || challenge.loading || !challenge.image}>{busy ? '注册中…' : '注册'} <Icon name="arrow" size={18} /></button>
    </form>
    <p className="auth-switch">已有账号？ <a className="text-button" href="#/login">立即登录</a></p>
  </div>
}
