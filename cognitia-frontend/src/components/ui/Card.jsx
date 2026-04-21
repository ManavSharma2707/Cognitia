import { motion } from 'framer-motion'
import { fadeInUp } from '../../utils/animations'

export default function Card({
  title,
  subtitle,
  children,
  className = '',
  headerAction,
  delay = 0,
  ...props
}) {
  return (
    <motion.section
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      transition={{ ...fadeInUp.transition, ease: 'easeOut', delay }}
      className={`bg-white rounded-2xl shadow-sm p-6 ${className}`}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="text-base font-semibold text-cognitia-dark">{title}</h3>}
            {subtitle && <p className="text-sm text-cognitia-muted mt-1">{subtitle}</p>}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </header>
      )}
      {children}
    </motion.section>
  )
}
