import { readData, writeData } from '@/lib/github'
import { mockStore } from '@/lib/mockdata'
import type { GalleryData } from '@/lib/images'

export const dynamic = 'force-dynamic'

function isGitHubConfigured(): boolean {
  return Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_OWNER && process.env.GITHUB_REPO)
}

// GitHub returns 401/403 when the token is invalid or expired — treat that as
// "not configured" and fall back to mock data instead of failing hard.
function isCredentialsError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : ''
  return msg.includes('401') || msg.includes('403')
}

export async function GET() {
  try {
    if (!isGitHubConfigured()) {
      return Response.json(mockStore.data)
    }
    const result = await readData()
    if (!result) {
      return Response.json({ error: 'No data yet' }, { status: 404 })
    }
    return Response.json(result.data)
  } catch (err) {
    if (isCredentialsError(err)) {
      console.error('GET /api/data: GitHub credentials invalid, serving mock data')
      return Response.json(mockStore.data)
    }
    console.error('GET /api/data error:', err)
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GalleryData
    if (!isGitHubConfigured()) {
      mockStore.data = body
      return Response.json({ ok: true, mocked: true })
    }
    try {
      const result = await readData()
      const sha = result?.sha ?? null
      const newSha = await writeData(body, sha)
      return Response.json({ ok: true, sha: newSha })
    } catch (err) {
      if (isCredentialsError(err)) {
        console.error('POST /api/data: GitHub credentials invalid, using mock store')
        mockStore.data = body
        return Response.json({ ok: true, mocked: true })
      }
      throw err
    }
  } catch (err) {
    console.error('POST /api/data error:', err)
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}
