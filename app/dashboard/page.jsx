'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthContext'
import Dashboard from '@/components/Dashboard'

export default function DashboardPage() {
  const { isAuth } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuth) router.replace('/login')
  }, [isAuth, router])

  if (!isAuth) return null

  return <Dashboard />
}
