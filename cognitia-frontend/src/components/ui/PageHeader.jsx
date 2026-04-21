import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'

export default function PageHeader({ title, subtitle, actions, backLink }) {
  const navigate = useNavigate()

  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        {backLink && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-0.5 h-9 w-9 rounded-full border border-cognitia-border text-cognitia-muted hover:text-cognitia-dark hover:bg-white transition-colors flex items-center justify-center"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </button>
        )}

        <div>
          <h1 className="text-[22px] leading-tight font-bold text-cognitia-dark">{title}</h1>
          {subtitle && <p className="text-sm text-cognitia-muted mt-1">{subtitle}</p>}
        </div>
      </div>

      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  )
}
