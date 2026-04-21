import { createContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export const AuthContext = createContext(null)

const ROLE_HOME = {
  student: '/student',
  faculty: '/faculty',
  admin:   '/admin',
}

export function AuthProvider({ children }) {
  const navigate = useNavigate()

  const [user,      setUser]      = useState(null)
  const [token,     setToken]     = useState(null)
  const [role,      setRole]      = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Hydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('cognitia_token')
    const storedUser  = localStorage.getItem('cognitia_user')
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setToken(storedToken)
        setUser(parsedUser)
        setRole(parsedUser.role ?? null)
      } catch {
        // Corrupted data — clear
        localStorage.removeItem('cognitia_token')
        localStorage.removeItem('cognitia_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback((userData, authToken) => {
    localStorage.setItem('cognitia_token', authToken)
    localStorage.setItem('cognitia_user',  JSON.stringify(userData))
    setToken(authToken)
    setUser(userData)
    setRole(userData.role ?? null)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('cognitia_token')
    localStorage.removeItem('cognitia_user')
    setToken(null)
    setUser(null)
    setRole(null)
    navigate('/login', { replace: true })
  }, [navigate])

  const isAuthenticated = Boolean(token && user)

  const value = {
    user,
    token,
    role,
    isLoading,
    isAuthenticated,
    login,
    logout,
    roleHome: ROLE_HOME,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
