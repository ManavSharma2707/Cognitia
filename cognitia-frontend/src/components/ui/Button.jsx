import { clsx } from 'clsx'
import Spinner from './Spinner'

/**
 * Button
 * Props: children, variant ('primary' | 'secondary' | 'danger'), loading, disabled,
 *        onClick, type, className
 */
export default function Button({
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
}) {
  const base =
    'inline-flex items-center justify-center gap-2 w-full rounded-lg py-2.5 px-4 font-medium text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed'

  const variants = {
    primary:
      'bg-cognitia-teal text-white hover:opacity-90 focus:ring-cognitia-teal',
    secondary:
      'border border-cognitia-border text-cognitia-dark bg-white hover:bg-gray-50 focus:ring-cognitia-border',
    danger:
      'bg-cognitia-weak text-white hover:opacity-90 focus:ring-cognitia-weak',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(base, variants[variant] ?? variants.primary, className)}
    >
      {loading && <Spinner size="sm" color="border-white" />}
      {children}
    </button>
  )
}
