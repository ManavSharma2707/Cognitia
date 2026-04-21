/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cognitia: {
          teal:     '#00C9B1',
          orange:   '#FF8C42',
          dark:     '#1A1D23',
          muted:    '#6B7280',
          light:    '#9CA3AF',
          bg:       '#F7F8FC',
          card:     '#FFFFFF',
          border:   '#E5E7EB',
          weak:     '#EF4444',
          moderate: '#F59E0B',
          strong:   '#10B981',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        xl:  '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
}
