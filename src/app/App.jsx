import { useState } from 'react'
import { useDemoSession } from '../features/auth/useDemoSession.js'
import DashboardPage from '../pages/dashboard/DashboardPage.jsx'
import FinancePage from '../pages/finance/FinancePage.jsx'
import LoginPage from '../pages/login/LoginPage.jsx'
import ApiDialog from '../shared/ui/ApiDialog.jsx'
import WorkspaceLayout from './layouts/WorkspaceLayout.jsx'
import { getRoute } from './routing/routes.js'
import { useHashRoute } from './routing/useHashRoute.js'

export default function App() {
  const { loggedIn, login, logout } = useDemoSession()
  const [request, setRequest] = useState(null)
  const route = useHashRoute(() => setRequest(null))
  const current = getRoute(route)

  function handleLogout() {
    logout()
    setRequest(null)
    window.location.hash = '/'
  }

  return (
    <>
      {loggedIn ? (
        <WorkspaceLayout route={route} current={current} logout={handleLogout}>
          {current ? (
            <FinancePage module={current.module} page={current.page} openApi={setRequest} />
          ) : (
            <DashboardPage openApi={setRequest} />
          )}
        </WorkspaceLayout>
      ) : (
        <LoginPage onLogin={login} openApi={setRequest} />
      )}
      {request && <ApiDialog request={request} onClose={() => setRequest(null)} />}
    </>
  )
}
