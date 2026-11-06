import LoginForm from './views/LoginForm.jsx'
import LoginHero from './views/LoginHero.jsx'
import './LoginPage.css'

export default function LoginPage({ onLogin, openApi }) {
  return (
    <main className="login-layout">
      <LoginHero />
      <section className="login-main">
        <LoginForm onLogin={onLogin} openApi={openApi} />
        <p className="login-footer">衡账财务管理系统 · V1.0</p>
      </section>
    </main>
  )
}
