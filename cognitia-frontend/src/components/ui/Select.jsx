import { clsx } from 'clsx'

export default function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  className = '',
  ...rest
}) {
  const selectId = name ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-cognitia-dark">
          {label}
        </label>
      )}

      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        className={clsx(
          'rounded-lg border px-4 py-2.5 w-full text-sm outline-none transition-colors',
          'bg-white text-cognitia-dark',
          error
            ? 'border-cognitia-weak focus:border-cognitia-weak focus:ring-1 focus:ring-cognitia-weak'
            : 'border-cognitia-border focus:border-cognitia-teal focus:ring-1 focus:ring-cognitia-teal',
          className,
        )}
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && <p className="text-xs text-cognitia-weak mt-0.5">{error}</p>}
    </div>
  )
}
