import {
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
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export default function LineChart({ data = [], title, color = '#00C9B1' }) {
  const labels = data.map((item) => item.label)
  const values = data.map((item) => Number(item.value ?? 0))

  const chartData = {
    labels,
    datasets: [
      {
        label: title || 'Completion Trend',
        data: values,
        borderColor: color,
        backgroundColor: `${color}22`,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 4,
        pointBackgroundColor: color,
        borderWidth: 2,
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
        },
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          color: '#6B7280',
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.2)',
        },
      },
    },
  }

  return (
    <div className="h-[280px]">
      <Line data={chartData} options={options} />
    </div>
  )
}
