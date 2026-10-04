'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthContext'
import { useImages } from '@/components/ImageContext'
import type { GalleryImage } from '@/lib/images'

export default function Gallery() {
  const [selected, setSelected] = useState<GalleryImage | null>(null)
  const { isAuth } = useAuth()
  const router = useRouter()
  const { activeImages } = useImages()

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Gallery</h1>
          {isAuth ? (
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              Dashboard
            </button>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors cursor-pointer"
            >
              Login
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {activeImages.map((img) => (
            <button
              key={img.id}
              onClick={() => setSelected(img)}
              className="break-inside-avoid overflow-hidden rounded-lg cursor-pointer group relative"
            >
              <img
                src={img.src}
                alt={img.name}
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs truncate">{img.name}</p>
              </div>
            </button>
          ))}
        </div>
      </main>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setSelected(null)}>
          <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl leading-none cursor-pointer z-10">&times;</button>
          <button
            onClick={(e) => { e.stopPropagation(); const idx = activeImages.findIndex(img => img.id === selected.id); setSelected(activeImages[(idx - 1 + activeImages.length) % activeImages.length]) }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-4xl cursor-pointer z-10"
          >&#8249;</button>
          <img src={selected.src} alt={selected.name} className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
          <button
            onClick={(e) => { e.stopPropagation(); const idx = activeImages.findIndex(img => img.id === selected.id); setSelected(activeImages[(idx + 1) % activeImages.length]) }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-4xl cursor-pointer z-10"
          >&#8250;</button>
        </div>
      )}
    </div>
  )
}
