'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthContext'

export default function Login() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (login(pin)) {
      router.replace('/dashboard')
    } else {
      setError(true)
      setPin('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Login</h1>
          <p className="text-gray-400 mt-1">Enter PIN to access gallery</p>
        </div>
        <input
          type="password"
          inputMode="numeric"
          maxLength={5}
          value={pin}
          onChange={(e) => { setPin(e.target.value); setError(false) }}
          placeholder="PIN"
          className="w-full text-center text-2xl tracking-[0.5em] px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        {error && <p className="text-red-400 text-sm text-center">Invalid PIN. Try again.</p>}
        <button
          type="submit"
          disabled={pin.length !== 5}
          className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium transition-colors cursor-pointer"
        >
          Login
        </button>
      </form>
    </div>
  )
}
