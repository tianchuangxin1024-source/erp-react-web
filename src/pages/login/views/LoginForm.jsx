import { useState } from 'react'
import Icon from '../../../shared/ui/Icon.jsx'
import { demoAccount } from '../../../features/auth/useDemoSession.js'

export default function LoginForm({ onLogin, openApi }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  function submit(event) {
    event.preventDefault()
    if (!onLogin(username, password)) {
      setError('账号或密码不正确，请使用下方的演示账号。')
    }
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
        <button type="submit" className="button primary login-submit">登录系统 <Icon name="arrow" size={18} /></button>
      </form>
      <div className="demo-credentials"><Icon name="info" size={18} /><div><strong>演示账号</strong><p><code>{demoAccount.username}</code><span> / </span><code>{demoAccount.password}</code></p></div><button className="text-button" type="button" onClick={() => { setUsername(demoAccount.username); setPassword(demoAccount.password); setError('') }}>填入账号</button></div>
      <button className="text-button login-info" type="button" onClick={() => openApi({ title: '登录认证', description: '验证账号与密码、检查用户启用状态，并建立安全会话。返回用户基本信息、角色与菜单权限，所有业务接口按会话校验权限。退出时使会话失效。' })}>查看登录接口说明 <Icon name="chevron" size={14} /></button>
    </div>
  )
}
