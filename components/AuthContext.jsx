'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)
const CORRECT_PIN = '00005'
const STORAGE_KEY = 'gallery_auth'

export function AuthProvider({ children }) {
  const [isAuth, setIsAuth] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setIsAuth(localStorage.getItem(STORAGE_KEY) === 'true')
    setLoaded(true)
  }, [])

  const login = (pin) => {
    if (pin !== CORRECT_PIN) return false
    setIsAuth(true)
    localStorage.setItem(STORAGE_KEY, 'true')
    return true
  }

  const logout = () => {
    setIsAuth(false)
    localStorage.removeItem(STORAGE_KEY)
  }

  if (!loaded) return null

  return (
    <AuthContext.Provider value={{ isAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
