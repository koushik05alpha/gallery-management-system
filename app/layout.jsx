import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'Gallery',
  description: 'Photo gallery website',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
