import { clsx } from 'clsx'

/**
 * Input
 * Props: label, type, name, value, onChange, error, placeholder, required, ...rest
 */
export default function Input({
  label,
  type = 'text',
  name,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  className = '',
  ...rest
}) {
  const inputId = name ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-cognitia-dark"
        >
          {label}
          {required && <span className="text-cognitia-weak ml-0.5">*</span>}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={clsx(
          'rounded-lg border px-4 py-2.5 w-full text-sm outline-none transition-colors',
          'bg-white text-cognitia-dark placeholder:text-cognitia-light',
          error
            ? 'border-cognitia-weak focus:border-cognitia-weak focus:ring-1 focus:ring-cognitia-weak'
            : 'border-cognitia-border focus:border-cognitia-teal focus:ring-1 focus:ring-cognitia-teal',
          className,
        )}
        {...rest}
      />
      {error && (
        <p className="text-xs text-cognitia-weak mt-0.5">{error}</p>
      )}
    </div>
  )
}
