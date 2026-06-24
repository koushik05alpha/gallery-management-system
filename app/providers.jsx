'use client'

import { AuthProvider } from '@/components/AuthContext'
import { ImageProvider } from '@/components/ImageContext'

export function Providers({ children }) {
  return (
    <AuthProvider>
      <ImageProvider>
        {children}
      </ImageProvider>
    </AuthProvider>
  )
}
