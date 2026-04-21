import { motion } from 'framer-motion'

export default function ProgressBar({ value = 0, label, color = '#00C9B1', showLabel = true }) {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0
  const pct = Math.max(0, Math.min(100, safeValue))

  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-cognitia-muted">{label}</span>
          <span className="font-medium text-cognitia-dark">{pct.toFixed(2)}%</span>
        </div>
      )}

      <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  )
}
