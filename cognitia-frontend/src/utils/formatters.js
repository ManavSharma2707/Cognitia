export function formatDate(isoString) {
  if (!isoString) return '—'
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatPercent(value) {
  const number = Number(value ?? 0)
  return `${number.toFixed(2)}%`
}

export function getPerformanceVariant(level = '') {
  const normalized = String(level).toLowerCase()
  if (normalized === 'strong') return 'strong'
  if (normalized === 'moderate') return 'moderate'
  return 'weak'
}

export function getPerformanceColor(level = '') {
  const normalized = String(level).toLowerCase()
  if (normalized === 'strong') return '#15803d'
  if (normalized === 'moderate') return '#a16207'
  return '#b91c1c'
}

export function truncate(str = '', n = 32) {
  if (str.length <= n) return str
  return `${str.slice(0, Math.max(0, n - 1)).trimEnd()}…`
}

// Backward-compatible aliases used in older pages/components.
export const scoreToPercent = (score, max = 10) => formatPercent((Number(score ?? 0) / Number(max || 1)) * 100)
export const strengthColor = (score) => (score >= 75 ? 'text-cognitia-strong' : score >= 45 ? 'text-cognitia-moderate' : 'text-cognitia-weak')
