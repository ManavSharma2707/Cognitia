import { clsx } from 'clsx'

const VARIANT_CLASSES = {
  strong: 'bg-green-100 text-green-700',
  moderate: 'bg-yellow-100 text-yellow-700',
  weak: 'bg-red-100 text-red-700',
  risk: 'bg-orange-100 text-orange-700',
  active: 'bg-teal-100 text-teal-700',
  inactive: 'bg-gray-100 text-gray-500',
  student: 'bg-blue-100 text-blue-700',
  faculty: 'bg-purple-100 text-purple-700',
  admin: 'bg-gray-800 text-white',
}

export default function Badge({ variant = 'active', children, className = '' }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full text-xs font-medium px-2.5 py-1',
        VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.active,
        className,
      )}
    >
      {children}
    </span>
  )
}
