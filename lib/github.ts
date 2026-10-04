import type { GalleryData } from './images'

const GITHUB_API = 'https://api.github.com'
const DATA_PATH = 'data.json'

function getHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  }
}

function getRepoUrl(): string {
  return `${GITHUB_API}/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${DATA_PATH}`
}

export async function readData(): Promise<{ data: GalleryData; sha: string } | null> {
  const res = await fetch(getRepoUrl(), { headers: getHeaders(), cache: 'no-store' })

  if (res.status === 404) return null

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`GitHub read failed: ${res.status} — ${err}`)
  }

  const body = await res.json()
  const decoded = Buffer.from(body.content, 'base64').toString('utf-8')
  return { data: JSON.parse(decoded), sha: body.sha }
}

export async function writeData(json: GalleryData, sha: string | null): Promise<string> {
  const content = Buffer.from(JSON.stringify(json, null, 2)).toString('base64')

  const body: { message: string; content: string; sha?: string } = {
    message: 'Update gallery data',
    content,
  }
  if (sha) body.sha = sha

  const res = await fetch(getRepoUrl(), {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`GitHub write failed: ${res.status} — ${err}`)
  }

  return (await res.json()).content.sha
}
