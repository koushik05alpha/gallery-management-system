export interface GalleryImage {
  id: string
  src: string
  name: string
  tags: string[]
  category: string
  deleted: boolean
  deletedAt: number | null
  type: string
  createdAt: number
}

export interface GalleryData {
  images: GalleryImage[]
  categories: string[]
}

export const LOCAL_IMAGES: string[] = [
  'images/157035631_342870333685116_8893923160646760428_n.jpg',
  'images/90148009_1669874699832508_5680159468038389760_o.jpg',
  'images/90456547_763996314007590_3246723563259953152_n.jpg',
  'images/90667268_2558147317761120_7475320682390224896_n.jpg',
  'images/90765416_1671363563016955_7098551269123424256_o.jpg',
  'images/90767526_642360909660597_1979431335873216512_n.jpg',
  'images/130998445_1030877484054561_477297420923881096_o.jpg',
  'images/131131622_2873413139609514_4231247031174971005_n.jpg',
  'images/71t7KCEzAPL._SS500_.jpg',
  'images/119744357_606245123404976_9150630588173553373_o.jpg',
  'images/FN.png',
  'images/ggfncbxn.PNG',
  'images/jkhjkhjkh.PNG',
  'images/ffffffffffffffff.PNG',
  'images/Tomay Hrid Majhare Rakhbo Lyrics (তোমায় হৃদ মাঝারে রাখবো).png',
  'images/Tomay Hrid Majhare Rakhbo Lyrics (তোমায় হৃদ মাঝারে রাখবো) (1).png',
  'images/Untitled design.png',
  'images/Railway-Map-of-Bangladesh.png',
  'images/ride-a-motorcycle-photo-u1.jpg',
  'images/f9be66de8cb5239d70c1500df5d35511_650x.jpg',
  'images/image-20210127171016-3.png',
  'images/image-20210127171016-4.png',
]

export function nameFromSrc(src: string): string {
  const fileName = src.split('/').pop() ?? ''
  const parts = fileName.split('.')
  parts.pop()
  return decodeURIComponent(parts.join('.')) || 'Untitled'
}
