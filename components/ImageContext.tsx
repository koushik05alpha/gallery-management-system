'use client'

import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { LOCAL_IMAGES, nameFromSrc } from '@/lib/images'
import type { GalleryImage } from '@/lib/images'

interface ImageContextValue {
  images: GalleryImage[]
  activeImages: GalleryImage[]
  deletedImages: GalleryImage[]
  categories: string[]
  loaded: boolean
  addImage: (src: string, name?: string, type?: string) => GalleryImage
  uploadFile: (file: File) => Promise<GalleryImage>
  addLink: (url: string) => GalleryImage
  deleteImage: (id: string) => void
  restoreImage: (id: string) => void
  emptyRecycleBin: () => void
  renameImage: (id: string, newName: string) => void
  addTag: (id: string, tag: string) => void
  removeTag: (id: string, tag: string) => void
  setCategory: (id: string, category: string) => void
  addCategory: (name: string) => void
}

const ImageContext = createContext<ImageContextValue | null>(null)

const localInitial: GalleryImage[] = LOCAL_IMAGES.map((src, i) => ({
  id: `img_${Date.now()}_${i}`,
  src,
  name: nameFromSrc(src),
  tags: [],
  category: 'Uncategorized',
  deleted: false,
  deletedAt: null,
  type: 'local',
  createdAt: Date.now() - i * 60000,
}))

export function ImageProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useState<GalleryImage[]>(localInitial)
  const [categories, setCategories] = useState<string[]>(['Uncategorized', 'Nature', 'Travel', 'People', 'Art'])
  const [loaded, setLoaded] = useState(false)

  const imagesRef = useRef<GalleryImage[]>(images)
  const categoriesRef = useRef<string[]>(categories)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { imagesRef.current = images }, [images])
  useEffect(() => { categoriesRef.current = categories }, [categories])

  useEffect(() => {
    fetch('/api/data')
      .then(res => {
        if (!res.ok) throw new Error('No data yet')
        return res.json()
      })
      .then((data: { images?: GalleryImage[]; categories?: string[] }) => {
        if (Array.isArray(data.images)) setImages(data.images)
        if (Array.isArray(data.categories)) setCategories(data.categories)
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  const saveToGitHub = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      try {
        await fetch('/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            images: imagesRef.current,
            categories: categoriesRef.current,
          }),
        })
      } catch (err) {
        console.error('Save failed:', err)
      }
    }, 500)
  }, [])

  const addImage = useCallback((src: string, name?: string, type = 'uploaded'): GalleryImage => {
    const newImg: GalleryImage = {
      id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      src,
      name: name || 'Untitled',
      tags: [],
      category: 'Uncategorized',
      deleted: false,
      deletedAt: null,
      type,
      createdAt: Date.now(),
    }
    setImages(prev => [newImg, ...prev])
    setTimeout(saveToGitHub, 0)
    return newImg
  }, [saveToGitHub])

  const uploadFile = useCallback((file: File): Promise<GalleryImage> => {
    const reader = new FileReader()
    return new Promise((resolve, reject) => {
      reader.onload = async (e) => {
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: e.target?.result }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Upload failed')
          const newImg = addImage(data.url, file.name.replace(/\.[^/.]+$/, ''), 'uploaded')
          resolve(newImg)
        } catch (err) {
          reject(err)
        }
      }
      reader.readAsDataURL(file)
    })
  }, [addImage])

  const addLink = useCallback((url: string): GalleryImage => {
    const name = url.split('/').pop()?.split('?')[0] || 'Link'
    return addImage(url, name, 'link')
  }, [addImage])

  const deleteImage = useCallback((id: string) => {
    setImages(prev => prev.map(img =>
      img.id === id ? { ...img, deleted: true, deletedAt: Date.now() } : img
    ))
    setTimeout(saveToGitHub, 0)
  }, [saveToGitHub])

  const restoreImage = useCallback((id: string) => {
    setImages(prev => prev.map(img =>
      img.id === id ? { ...img, deleted: false, deletedAt: null } : img
    ))
    setTimeout(saveToGitHub, 0)
  }, [saveToGitHub])

  const emptyRecycleBin = useCallback(() => {
    setImages(prev => prev.filter(img => !img.deleted))
    setTimeout(saveToGitHub, 0)
  }, [saveToGitHub])

  const renameImage = useCallback((id: string, newName: string) => {
    const n = newName.trim()
    if (!n) return
    setImages(prev => prev.map(img =>
      img.id === id ? { ...img, name: n } : img
    ))
    setTimeout(saveToGitHub, 0)
  }, [saveToGitHub])

  const addTag = useCallback((id: string, tag: string) => {
    const t = tag.trim()
    if (!t) return
    setImages(prev => prev.map(img =>
      img.id === id && !img.tags.includes(t)
        ? { ...img, tags: [...img.tags, t] }
        : img
    ))
    setTimeout(saveToGitHub, 0)
  }, [saveToGitHub])

  const removeTag = useCallback((id: string, tag: string) => {
    setImages(prev => prev.map(img =>
      img.id === id
        ? { ...img, tags: img.tags.filter(t => t !== tag) }
        : img
    ))
    setTimeout(saveToGitHub, 0)
  }, [saveToGitHub])

  const setCategory = useCallback((id: string, category: string) => {
    setImages(prev => prev.map(img =>
      img.id === id ? { ...img, category } : img
    ))
    setTimeout(saveToGitHub, 0)
  }, [saveToGitHub])

  const addCategory = useCallback((name: string) => {
    const c = name.trim()
    if (!c) return
    setCategories(prev => prev.includes(c) ? prev : [...prev, c])
    setTimeout(saveToGitHub, 0)
  }, [saveToGitHub])

  const activeImages = useMemo(() => images.filter(img => !img.deleted), [images])
  const deletedImages = useMemo(() => images.filter(img => img.deleted), [images])

  return (
    <ImageContext.Provider value={{
      images, activeImages, deletedImages, categories, loaded,
      addImage, uploadFile, addLink, deleteImage, restoreImage, emptyRecycleBin,
      renameImage, addTag, removeTag, setCategory, addCategory,
    }}>
      {children}
    </ImageContext.Provider>
  )
}

export function useImages() {
  const ctx = useContext(ImageContext)
  if (!ctx) throw new Error('useImages must be used within ImageProvider')
  return ctx
}
