import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

function truncateAxisLabel(label = '') {
  return label.length > 12 ? `${label.slice(0, 12)}...` : label
}

export default function BarChart({ data = [], title, yLabel = 'Score (%)', height = 280 }) {
  const labels = data.map((item) => truncateAxisLabel(item.label ?? ''))
  const values = data.map((item) => Number(item.value ?? 0))
  const colors = data.map((item) => item.color ?? '#00C9B1')

  const chartData = {
    labels,
    datasets: [
      {
        type: 'bar',
        data: values,
        backgroundColor: colors,
        borderRadius: 6,
        maxBarThickness: 38,
      },
      {
        type: 'line',
        data: labels.map(() => 75),
        borderColor: '#15803d',
        borderWidth: 1,
        pointRadius: 0,
        borderDash: [6, 6],
      },
      {
        type: 'line',
        data: labels.map(() => 50),
        borderColor: '#a16207',
        borderWidth: 1,
        pointRadius: 0,
        borderDash: [6, 6],
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: Boolean(title),
        text: title,
        align: 'start',
        color: '#1A1D23',
        font: { size: 14, weight: '600' },
        padding: { bottom: 10 },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.parsed.y?.toFixed?.(2) ?? ctx.parsed.y}%`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#6B7280',
          maxRotation: 0,
          autoSkip: false,
        },
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 25,
          color: '#6B7280',
        },
        title: {
          display: Boolean(yLabel),
          text: yLabel,
          color: '#6B7280',
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.18)',
        },
      },
    },
  }

  return (
    <div style={{ height }}>
      <Bar data={chartData} options={options} />
    </div>
  )
}
