import { useEffect, useEffectEvent, useState } from 'react'

const currentRoute = () => window.location.hash.replace(/^#\/?/, '')

export function useHashRoute(onNavigate) {
  const [route, setRoute] = useState(currentRoute)
  const notifyNavigation = useEffectEvent(onNavigate)

  useEffect(() => {
    function handleRoute() {
      setRoute(currentRoute())
      notifyNavigation()
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', handleRoute)
    return () => window.removeEventListener('hashchange', handleRoute)
  }, [])

  return route
}
