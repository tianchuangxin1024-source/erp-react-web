// JDBC DATE values are serialized as midnight timestamps by the current server.
export function normalizeApiData(value) {
  if (Array.isArray(value)) return value.map(normalizeApiData)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.entries(value).map(([key, item]) => {
    if ((key === 'date' || /(_date|_on)$/.test(key)) && typeof item === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(item)) {
      return [key, new Date(item).toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' })]
    }
    return [key, normalizeApiData(item)]
  }))
}
