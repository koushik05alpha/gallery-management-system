import './globals.css'
import '@mantine/core/styles.css'
import type { ReactNode } from 'react'
import { Providers } from './providers'

export const metadata = {
  title: 'Gallery',
  description: 'Photo gallery website',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
