import { clsx } from 'clsx'

/**
 * Spinner
 * Props: size ('sm' | 'md' | 'lg'), color (Tailwind border-color class, default cognitia-teal)
 */
export default function Spinner({ size = 'md', color = 'border-cognitia-teal', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-[3px]',
    lg: 'w-10 h-10 border-4',
  }

  return (
    <span
      role="status"
      aria-label="Loading"
      className={clsx(
        'inline-block rounded-full border-t-transparent animate-spin',
        sizes[size] ?? sizes.md,
        color,
        className,
      )}
    />
  )
}
