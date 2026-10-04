import { LOCAL_IMAGES, nameFromSrc } from './images'
import type { GalleryData } from './images'

function buildMockData(): GalleryData {
  const now = Date.now()
  return {
    images: LOCAL_IMAGES.map((src, i) => ({
      id: `mock_${i}`,
      src,
      name: nameFromSrc(src),
      tags: [],
      category: 'Uncategorized',
      deleted: false,
      deletedAt: null,
      type: 'local',
      createdAt: now - i * 60000,
    })),
    categories: ['Uncategorized', 'Nature', 'Travel', 'People', 'Art'],
  }
}

// In-memory store used by the API routes when GITHUB_TOKEN is not configured,
// so the app works without real credentials (data resets on server restart).
export const mockStore: { data: GalleryData } = { data: buildMockData() }
