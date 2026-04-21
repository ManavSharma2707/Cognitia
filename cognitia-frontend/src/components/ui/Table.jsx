import { motion } from 'framer-motion'
import EmptyState from './EmptyState'
import { fadeInUp, staggerContainer } from '../../utils/animations'

function SkeletonRows({ count = 5, columns = 1 }) {
  return Array.from({ length: count }).map((_, rowIdx) => (
    <motion.tr
      key={`skeleton-${rowIdx}`}
      className="border-t border-cognitia-border"
      variants={fadeInUp}
    >
      {Array.from({ length: columns }).map((__, colIdx) => (
        <td key={`skeleton-cell-${rowIdx}-${colIdx}`} className="px-4 py-3">
          <div className="h-3.5 rounded bg-gray-200 animate-pulse" />
        </td>
      ))}
    </motion.tr>
  ))
}

export default function Table({ columns = [], data = [], loading = false, emptyMessage = 'No records found.' }) {
  if (!loading && (!data || data.length === 0)) {
    return (
      <div className="bg-white rounded-2xl overflow-hidden p-4">
        <EmptyState title="No records yet" description={emptyMessage} />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="bg-gray-50 text-xs font-semibold text-cognitia-muted uppercase tracking-wide">
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <motion.tbody variants={staggerContainer} initial="initial" animate="animate">
            {loading ? (
              <SkeletonRows count={5} columns={columns.length || 1} />
            ) : (
              data.map((row, rowIndex) => (
                <motion.tr
                  key={row.record_id ?? row.attendance_id ?? row.id ?? `row-${rowIndex}`}
                  className="border-t border-cognitia-border hover:bg-gray-50 transition-colors"
                  variants={fadeInUp}
                >
                  {columns.map((column) => (
                    <td key={`${column.key}-${rowIndex}`} className="px-4 py-3 text-cognitia-dark">
                      {column.render ? column.render(row, rowIndex) : row[column.key]}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </motion.tbody>
        </table>
      </div>
    </div>
  )
}
