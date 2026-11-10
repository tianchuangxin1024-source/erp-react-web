import LoginHero from '../login/views/LoginHero.jsx'
import RegisterForm from './views/RegisterForm.jsx'
import '../login/LoginPage.css'
import './RegisterPage.css'

export default function RegisterPage() {
  return (
    <main className="login-layout">
      <LoginHero />
      <section className="login-main">
        <RegisterForm />
        <p className="login-footer">衡账财务管理系统 · V1.0</p>
      </section>
    </main>
  )
}
