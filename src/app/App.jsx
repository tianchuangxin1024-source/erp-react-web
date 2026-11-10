import { useState } from 'react'
import { useSession } from '../features/auth/useSession.js'
import DashboardPage from '../pages/dashboard/DashboardPage.jsx'
import FinancePage from '../pages/finance/FinancePage.jsx'
import LoginPage from '../pages/login/LoginPage.jsx'
import RegisterPage from '../pages/register/RegisterPage.jsx'
import WorkspaceLayout from './layouts/WorkspaceLayout.jsx'
import { getRoute } from './routing/routes.js'
import { useHashRoute } from './routing/useHashRoute.js'
import { canAccess } from '../features/auth/permissions.js'

export default function App() {
  const { user, loading, error, login, logout } = useSession()
  const [logoutError, setLogoutError] = useState('')
  const route = useHashRoute(() => setLogoutError(''))
  const current = getRoute(route)

  async function handleLogout() {
    try {
      await logout()
      window.location.hash = '/'
    } catch (failure) { setLogoutError(failure.message) }
  }

  if (loading) return <main className="page-content" role="status">正在恢复登录会话…</main>
  if (!user) return <>{route === 'register' ? <RegisterPage /> : <LoginPage onLogin={login} />}{error && <p className="request-error" role="alert">{error}</p>}</>

  const resource = current ? current.module.id + '/' + current.page.id : 'dashboard'
  return <WorkspaceLayout route={route} current={current} logout={handleLogout} user={user}>
    {logoutError && <p className="request-error" role="alert">{logoutError}</p>}
    {!canAccess(user, resource) ? <p role="alert">当前角色无权访问此页面。</p> : current ? (
      <FinancePage module={current.module} page={current.page} canWrite={canAccess(user, resource, true)} />
    ) : <DashboardPage />}
  </WorkspaceLayout>
}
