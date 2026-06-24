const GITHUB_API = 'https://api.github.com'
const DATA_PATH = 'data.json'

function getHeaders() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  }
}

export async function readData() {
  const url = `${GITHUB_API}/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${DATA_PATH}`
  const res = await fetch(url, { headers: getHeaders(), next: { revalidate: 0 } })

  if (res.status === 404) return null

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`GitHub read failed: ${res.status} — ${err}`)
  }

  const body = await res.json()
  const decoded = Buffer.from(body.content, 'base64').toString('utf-8')
  return { data: JSON.parse(decoded), sha: body.sha }
}

export async function writeData(json, sha) {
  const url = `${GITHUB_API}/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${DATA_PATH}`
  const content = Buffer.from(JSON.stringify(json, null, 2)).toString('base64')

  const body = {
    message: 'Update gallery data',
    content,
  }
  if (sha) body.sha = sha

  const res = await fetch(url, {
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
