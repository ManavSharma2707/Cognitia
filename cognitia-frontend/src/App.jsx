import { AuthProvider } from './context/AuthContext'
import AppRouter from './router/AppRouter'
import Toast from './components/ui/Toast'

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <Toast />
    </AuthProvider>
  )
}
