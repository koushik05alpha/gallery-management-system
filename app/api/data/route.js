import { readData, writeData } from '@/lib/github'

export async function GET() {
  try {
    const result = await readData()
    if (!result) {
      return Response.json({ images: [], categories: [] })
    }
    return Response.json(result.data)
  } catch (err) {
    console.error('GET /api/data error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const result = await readData()
    const sha = result?.sha || null
    const newSha = await writeData(body, sha)
    return Response.json({ ok: true, sha: newSha })
  } catch (err) {
    console.error('POST /api/data error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
