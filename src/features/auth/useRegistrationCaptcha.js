import { useEffect, useState } from 'react'
import { getRegistrationCaptcha } from './registrationApi.js'

export function useRegistrationCaptcha() {
  const [image, setImage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    getRegistrationCaptcha(controller.signal)
      .then((data) => { if (!controller.signal.aborted) setImage(data.image) })
      .catch((failure) => { if (!controller.signal.aborted) setError(failure.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [revision])

  function refresh() {
    setImage('')
    setError('')
    setLoading(true)
    setRevision((value) => value + 1)
  }

  return { image, loading, error, refresh }
}
