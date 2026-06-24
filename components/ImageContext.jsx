'use client'

import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { LOCAL_IMAGES, nameFromSrc } from '@/lib/images'

const ImageContext = createContext(null)

const localInitial = LOCAL_IMAGES.map((src, i) => ({
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

export function ImageProvider({ children }) {
  const [images, setImages] = useState(localInitial)
  const [categories, setCategories] = useState(['Uncategorized', 'Nature', 'Travel', 'People', 'Art'])
  const [loaded, setLoaded] = useState(false)

  const imagesRef = useRef(images)
  const categoriesRef = useRef(categories)
  const saveTimer = useRef(null)

  useEffect(() => { imagesRef.current = images }, [images])
  useEffect(() => { categoriesRef.current = categories }, [categories])

  useEffect(() => {
    fetch('/api/data')
      .then(res => {
        if (!res.ok) throw new Error('No data yet')
        return res.json()
      })
      .then(data => {
        if (data.images?.length > 0) setImages(data.images)
        if (data.categories?.length > 0) setCategories(data.categories)
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
        console.error('GitHub save failed:', err)
      }
    }, 500)
  }, [])

  const addImage = useCallback((src, name, type = 'uploaded') => {
    const newImg = {
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

  const uploadFile = useCallback(async (file) => {
    const reader = new FileReader()
    return new Promise((resolve, reject) => {
      reader.onload = async (e) => {
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: e.target.result }),
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

  const addLink = useCallback((url) => {
    const name = url.split('/').pop()?.split('?')[0] || 'Link'
    return addImage(url, name, 'link')
  }, [addImage])

  const deleteImage = useCallback((id) => {
    setImages(prev => prev.map(img =>
      img.id === id ? { ...img, deleted: true, deletedAt: Date.now() } : img
    ))
    setTimeout(saveToGitHub, 0)
  }, [saveToGitHub])

  const restoreImage = useCallback((id) => {
    setImages(prev => prev.map(img =>
      img.id === id ? { ...img, deleted: false, deletedAt: null } : img
    ))
    setTimeout(saveToGitHub, 0)
  }, [saveToGitHub])

  const emptyRecycleBin = useCallback(() => {
    setImages(prev => prev.filter(img => !img.deleted))
    setTimeout(saveToGitHub, 0)
  }, [saveToGitHub])

  const renameImage = useCallback((id, newName) => {
    setImages(prev => prev.map(img =>
      img.id === id ? { ...img, name: newName } : img
    ))
    setTimeout(saveToGitHub, 0)
  }, [saveToGitHub])

  const addTag = useCallback((id, tag) => {
    const t = tag.trim()
    if (!t) return
    setImages(prev => prev.map(img =>
      img.id === id && !img.tags.includes(t)
        ? { ...img, tags: [...img.tags, t] }
        : img
    ))
    setTimeout(saveToGitHub, 0)
  }, [saveToGitHub])

  const removeTag = useCallback((id, tag) => {
    setImages(prev => prev.map(img =>
      img.id === id
        ? { ...img, tags: img.tags.filter(t => t !== tag) }
        : img
    ))
    setTimeout(saveToGitHub, 0)
  }, [saveToGitHub])

  const setCategory = useCallback((id, category) => {
    setImages(prev => prev.map(img =>
      img.id === id ? { ...img, category } : img
    ))
    setTimeout(saveToGitHub, 0)
  }, [saveToGitHub])

  const addCategory = useCallback((name) => {
    setCategories(prev => prev.includes(name) ? prev : [...prev, name])
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
