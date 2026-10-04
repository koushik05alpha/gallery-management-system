'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthContext'
import { useImages } from '@/components/ImageContext'
import type { GalleryImage } from '@/lib/images'

const links = [
  { label: 'Dashboard', icon: '📊', id: 'overview' },
  { label: 'Gallery', icon: '🖼️', id: 'gallery' },
  { label: 'Upload', icon: '📤', id: 'upload' },
  { label: 'Recycle Bin', icon: '🗑️', id: 'recycle' },
  { label: 'Settings', icon: '⚙️', id: 'settings' },
]

export default function Dashboard() {
  const [active, setActive] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { logout } = useAuth()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} transition-all duration-300 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0`}>
        <div className="h-14 flex items-center px-4 border-b border-gray-800">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white cursor-pointer text-xl">{sidebarOpen ? '◀' : '▶'}</button>
          {sidebarOpen && <span className="ml-3 font-semibold">Menu</span>}
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {links.map(link => (
            <button key={link.id} onClick={() => setActive(link.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${active === link.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              <span className="text-lg">{link.icon}</span>
              {sidebarOpen && <span>{link.label}</span>}
            </button>
          ))}
        </nav>
        <div className="px-2 pb-4 border-t border-gray-800 pt-4 space-y-1">
          <button onClick={() => router.push('/')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer">
            <span className="text-lg">🏠</span>
            {sidebarOpen && <span>Home</span>}
          </button>
          <button onClick={() => { logout(); router.replace('/login') }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 transition-colors cursor-pointer">
            <span className="text-lg">🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
          <h1 className="text-lg font-bold capitalize">{active === 'recycle' ? 'Recycle Bin' : active}</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {active === 'overview' && <OverviewSection />}
          {active === 'gallery' && <GallerySection />}
          {active === 'upload' && <UploadSection />}
          {active === 'recycle' && <RecycleSection />}
          {active === 'settings' && <SettingsSection />}
        </main>
      </div>
    </div>
  )
}

function OverviewSection() {
  const { activeImages, deletedImages } = useImages()
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Images" value={activeImages.length + deletedImages.length} />
        <StatCard label="Active Images" value={activeImages.length} />
        <StatCard label="Recycle Bin" value={deletedImages.length} />
        <StatCard label="Status" value="Active" />
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-gray-800 p-6">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}

function GallerySection() {
  const { activeImages, categories, renameImage, deleteImage, addTag, removeTag, setCategory } = useImages()
  const [selected, setSelected] = useState<GalleryImage | null>(null)
  const [filter, setFilter] = useState('All')
  const [renameVal, setRenameVal] = useState('')
  const [tagVal, setTagVal] = useState('')
  const [renaming, setRenaming] = useState(false)
  const [tagging, setTagging] = useState(false)

  const filtered = filter === 'All' ? activeImages : activeImages.filter(img => img.category === filter)

  const select = (img: GalleryImage) => {
    setSelected(img)
    setRenameVal(img.name)
    setTagVal('')
    setRenaming(false)
    setTagging(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {['All', ...categories].map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${filter === c ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          >{c}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-gray-800 p-12 text-center text-gray-500">
          <p className="text-lg">No images found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map(img => (
            <button key={img.id} onClick={() => select(img)}
              className={`relative group rounded-lg overflow-hidden border-2 transition-colors cursor-pointer ${selected?.id === img.id ? 'border-blue-500' : 'border-transparent'}`}
            >
              <img src={img.src} alt={img.name} className="w-full aspect-square object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <p className="text-xs truncate">{img.name}</p>
                {img.tags.length > 0 && <p className="text-[10px] text-gray-300 truncate">{img.tags.join(', ')}</p>}
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setSelected(null)}>
          <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="font-semibold truncate">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white text-xl leading-none cursor-pointer">&times;</button>
            </div>
            <div className="p-4 space-y-4">
              <img src={selected.src} alt={selected.name} className="w-full rounded-lg max-h-64 object-contain bg-black/40" />

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-gray-400">Name</label>
                  <button onClick={() => setRenaming(!renaming)} className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer">{renaming ? 'Cancel' : 'Rename'}</button>
                </div>
                {renaming ? (
                  <div className="flex gap-2">
                    <input value={renameVal} onChange={e => setRenameVal(e.target.value)} className="flex-1 px-3 py-1.5 rounded bg-gray-800 border border-gray-600 text-sm text-white focus:outline-none focus:border-blue-500" autoFocus />
                    <button onClick={() => { renameImage(selected.id, renameVal); setRenaming(false) }} className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-sm cursor-pointer">Save</button>
                  </div>
                ) : <p className="text-sm">{selected.name}</p>}
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Category</label>
                <select value={selected.category} onChange={e => setCategory(selected.id, e.target.value)} className="w-full px-3 py-1.5 rounded bg-gray-800 border border-gray-600 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer">
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-gray-400">Tags</label>
                  <button onClick={() => setTagging(!tagging)} className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer">{tagging ? 'Cancel' : 'Add Tag'}</button>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {selected.tags.length === 0 && <span className="text-xs text-gray-500">No tags</span>}
                  {selected.tags.map(t => (
                    <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-800 text-xs text-gray-200">
                      {t}
                      <button onClick={() => removeTag(selected.id, t)} className="text-gray-500 hover:text-red-400 cursor-pointer">&times;</button>
                    </span>
                  ))}
                </div>
                {tagging && (
                  <div className="flex gap-2">
                    <input value={tagVal} onChange={e => setTagVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { addTag(selected.id, tagVal); setTagVal('') } }} placeholder="Enter tag..." className="flex-1 px-3 py-1.5 rounded bg-gray-800 border border-gray-600 text-sm text-white focus:outline-none focus:border-blue-500" autoFocus />
                    <button onClick={() => { addTag(selected.id, tagVal); setTagVal('') }} className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-sm cursor-pointer">Add</button>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-700">
                <button onClick={() => { deleteImage(selected.id); setSelected(null) }} className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-sm font-medium transition-colors cursor-pointer">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function UploadSection() {
  const { uploadFile, addLink } = useImages()
  const fileRef = useRef<HTMLInputElement>(null)
  const [linkVal, setLinkVal] = useState('')
  const [status, setStatus] = useState('')

  const handleFile = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setStatus('Uploading...')
    let count = 0
    for (const file of files) {
      try {
        await uploadFile(file)
        count++
      } catch (err) {
        console.error('Upload failed:', err)
      }
    }
    setStatus(`${count} file(s) uploaded`)
    setTimeout(() => setStatus(''), 3000)
  }

  const handleLink = () => {
    const url = linkVal.trim()
    if (!url) return
    addLink(url)
    setLinkVal('')
    setStatus('Link added')
    setTimeout(() => setStatus(''), 3000)
  }

  return (
    <div className="max-w-xl space-y-8">
      <div className="rounded-xl border-2 border-dashed border-gray-700 p-12 text-center hover:border-blue-500 transition-colors cursor-pointer"
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files) }}
      >
        <div className="text-4xl mb-3">📤</div>
        <p className="text-gray-300 font-medium">Click or drag & drop to upload</p>
        <p className="text-sm text-gray-500 mt-1">JPG, PNG, GIF, WebP</p>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFile(e.target.files)} />
      </div>

      <div className="rounded-xl border border-gray-800 p-6">
        <label className="text-sm text-gray-400 block mb-2">Upload from link</label>
        <div className="flex gap-2">
          <input value={linkVal} onChange={e => setLinkVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLink()} placeholder="https://example.com/image.jpg" className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
          <button onClick={handleLink} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium transition-colors cursor-pointer">Add</button>
        </div>
      </div>

      {status && <div className="rounded-lg bg-green-900/50 border border-green-700 px-4 py-3 text-sm text-green-300">{status}</div>}
    </div>
  )
}

function RecycleSection() {
  const { deletedImages, restoreImage, emptyRecycleBin } = useImages()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{deletedImages.length} image(s) in recycle bin</p>
        {deletedImages.length > 0 && (
          <button onClick={emptyRecycleBin} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-sm font-medium transition-colors cursor-pointer">Empty Recycle Bin</button>
        )}
      </div>

      {deletedImages.length === 0 ? (
        <div className="rounded-lg border border-gray-800 p-12 text-center text-gray-500">
          <p className="text-4xl mb-3">🗑️</p>
          <p className="text-lg">Recycle bin is empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {deletedImages.map(img => (
            <div key={img.id} className="relative group rounded-lg overflow-hidden border border-gray-800">
              <img src={img.src} alt={img.name} className="w-full aspect-square object-cover opacity-60" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                <button onClick={() => restoreImage(img.id)} className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-sm font-medium transition-colors cursor-pointer">Restore</button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <p className="text-xs truncate">{img.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SettingsSection() {
  const { categories, addCategory } = useImages()
  const [newCat, setNewCat] = useState('')

  return (
    <div className="max-w-xl space-y-6">
      <div className="rounded-lg border border-gray-800 p-6">
        <h2 className="text-lg font-semibold mb-4">Categories</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map(c => <span key={c} className="px-3 py-1 rounded-full bg-gray-800 text-sm text-gray-200">{c}</span>)}
        </div>
        <div className="flex gap-2">
          <input value={newCat} onChange={e => setNewCat(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { addCategory(newCat); setNewCat('') } }} placeholder="New category name" className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
          <button onClick={() => { addCategory(newCat); setNewCat('') }} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium transition-colors cursor-pointer">Add</button>
        </div>
      </div>
    </div>
  )
}
