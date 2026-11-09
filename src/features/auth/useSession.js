import { useEffect, useState } from 'react'
import { request } from '../../shared/api/client.js'

export function useSession() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    request('/auth/session', { signal: controller.signal })
      .then(setUser)
      .catch((failure) => {
        if (failure.name !== 'AbortError' && failure.status !== 401) setError(failure.message)
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    const expire = () => setUser(null)
    window.addEventListener('session-expired', expire)
    return () => {
      controller.abort()
      window.removeEventListener('session-expired', expire)
    }
  }, [])

  async function login(username, password) {
    const profile = await request('/auth/login', { method: 'POST', body: { username: username.trim(), password } })
    setError('')
    setUser(profile)
  }

  async function logout() {
    await request('/auth/logout', { method: 'POST', body: {} })
    setUser(null)
  }

  return { user, loading, error, login, logout }
}
