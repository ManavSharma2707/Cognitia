import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

const SIZE_MAP = {
  sm: { container: 'w-44 h-44', cutout: '66%' },
  md: { container: 'w-56 h-56', cutout: '70%' },
  lg: { container: 'w-64 h-64', cutout: '74%' },
}

function safeNumber(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0
}

export default function DonutChart({
  completed = 0,
  inProgress = 0,
  notStarted = 0,
  size = 'md',
  centerLabel,
}) {
  const completedCount = safeNumber(completed)
  const inProgressCount = safeNumber(inProgress)
  const notStartedCount = safeNumber(notStarted)
  const total = completedCount + inProgressCount + notStartedCount

  const completionPct = total > 0 ? Math.round((completedCount / total) * 100) : 0
  const label = centerLabel ?? `${completionPct}%`

  const chartData = {
    labels: ['Completed', 'In Progress', 'Not Started'],
    datasets: [
      {
        data: [completedCount, inProgressCount, notStartedCount],
        backgroundColor: ['#00C9B1', '#FF8C42', '#E5E7EB'],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  }

  const sizeConfig = SIZE_MAP[size] ?? SIZE_MAP.md

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const value = ctx.parsed ?? 0
            const pct = total > 0 ? Math.round((value / total) * 100) : 0
            return `${ctx.label}: ${value} (${pct}%)`
          },
        },
      },
    },
  }

  options.cutout = sizeConfig.cutout

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${sizeConfig.container}`}>
        <Doughnut data={chartData} options={options} />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-cognitia-dark">{label}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
        <span className="inline-flex items-center gap-2 text-cognitia-dark">
          <span className="h-2.5 w-2.5 rounded-full bg-cognitia-teal" />
          Completed
        </span>
        <span className="inline-flex items-center gap-2 text-cognitia-dark">
          <span className="h-2.5 w-2.5 rounded-full bg-cognitia-orange" />
          In Progress
        </span>
        <span className="inline-flex items-center gap-2 text-cognitia-dark">
          <span className="h-2.5 w-2.5 rounded-full bg-cognitia-border" />
          Not Started
        </span>
      </div>
    </div>
  )
}
