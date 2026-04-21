import { InboxIcon } from '@heroicons/react/24/outline'

export default function EmptyState({
  title = 'Nothing here yet',
  description = 'No data available.',
  actionLabel,
  onAction,
  icon: Icon = InboxIcon,
}) {
  return (
    <div className="py-12 flex flex-col items-center justify-center text-center">
      <span className="h-12 w-12 rounded-full bg-cognitia-bg text-cognitia-muted flex items-center justify-center">
        <Icon className="h-6 w-6" />
      </span>
      <h4 className="mt-4 text-base font-semibold text-cognitia-dark">{title}</h4>
      <p className="mt-1 text-sm text-cognitia-muted max-w-md">{description}</p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-cognitia-teal px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
