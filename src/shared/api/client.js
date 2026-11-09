import { normalizeApiData } from './dates.js'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function queryString(params = {}) {
  return new URLSearchParams(Object.entries(params).filter(([, value]) => value !== '' && value != null)).toString()
}

export async function request(path, { method = 'GET', body, signal, download = false } = {}) {
  const response = await fetch('/api' + path, {
    method,
    credentials: 'same-origin',
    signal,
    headers: body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : undefined,
    body: body instanceof FormData ? body : body == null ? undefined : JSON.stringify(body),
  })
  if (response.status === 401 && path !== '/auth/login') {
    window.dispatchEvent(new Event('session-expired'))
  }
  if (download && response.ok) {
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const filename = response.headers.get('Content-Disposition')?.match(/filename\*=UTF-8''([^;]+)/i)?.[1]
    link.download = filename ? decodeURIComponent(filename) : path.split('/').at(-2) + '.xlsx'
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    return null
  }
  const payload = await response.json().catch(() => null)
  if (!response.ok) throw new ApiError(payload?.message || '服务请求失败，请稍后重试', response.status)
  if (!payload || payload.code >= 400) throw new ApiError(payload?.message || '服务器返回格式错误', response.status)
  return normalizeApiData(payload.data)
}
