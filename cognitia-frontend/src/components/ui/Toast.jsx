import { Toaster } from 'react-hot-toast'

export default function Toast() {
	return (
		<Toaster
			position="top-right"
			toastOptions={{
				duration: 3000,
				style: {
					background: '#1A1D23',
					color: '#F7F8FC',
					borderRadius: '12px',
					fontSize: '14px',
				},
				success: { iconTheme: { primary: '#00C9B1', secondary: '#F7F8FC' } },
				error: { iconTheme: { primary: '#EF4444', secondary: '#F7F8FC' } },
			}}
		/>
	)
}
