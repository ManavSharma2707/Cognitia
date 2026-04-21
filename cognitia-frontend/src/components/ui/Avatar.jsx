const SIZE_MAP = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-20 w-20 text-2xl',
}

const COLOR_MAP = [
  'bg-teal-100 text-teal-700',
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-orange-100 text-orange-700',
  'bg-green-100 text-green-700',
]

function initialsFromName(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'U'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase()
}

function hashIndex(value = '') {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % COLOR_MAP.length
}

export default function Avatar({ name, size = 'md', src }) {
  const sizeClass = SIZE_MAP[size] ?? SIZE_MAP.md

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'User avatar'}
        className={`${sizeClass} rounded-full object-cover border border-cognitia-border`}
      />
    )
  }

  const colorClass = COLOR_MAP[hashIndex(name || 'user')]

  return (
    <span
      aria-label={name || 'User avatar'}
      className={`${sizeClass} ${colorClass} rounded-full border border-cognitia-border inline-flex items-center justify-center font-semibold select-none`}
    >
      {initialsFromName(name)}
    </span>
  )
}
