'use client'

import { MantineProvider } from '@mantine/core'
import type { ReactNode } from 'react'
import { AuthProvider } from '@/components/AuthContext'
import { ImageProvider } from '@/components/ImageContext'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MantineProvider defaultColorScheme="dark">
      <AuthProvider>
        <ImageProvider>
          {children}
        </ImageProvider>
      </AuthProvider>
    </MantineProvider>
  )
}
