import { useState } from 'react'

export const demoAccount = { username: 'admin', password: 'Admin123' }
const sessionKey = 'finance-demo-user'

export function useDemoSession() {
  const [loggedIn, setLoggedIn] = useState(
    () => sessionStorage.getItem(sessionKey) === demoAccount.username,
  )

  function login(username, password) {
    if (username.trim() !== demoAccount.username || password !== demoAccount.password) {
      return false
    }
    sessionStorage.setItem(sessionKey, demoAccount.username)
    setLoggedIn(true)
    return true
  }

  function logout() {
    sessionStorage.removeItem(sessionKey)
    setLoggedIn(false)
  }

  return { loggedIn, login, logout }
}
