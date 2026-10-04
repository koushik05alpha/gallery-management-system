export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const { image } = (await request.json()) as { image?: string }
  if (!image) {
    return Response.json({ error: 'No image provided' }, { status: 400 })
  }

  // Mock mode: no IMGBB key configured — echo the data URL back so the image still renders
  if (!process.env.IMGBB_KEY) {
    return Response.json({ url: image, mocked: true })
  }

  const base64 = image.includes('base64,') ? image.split('base64,')[1] ?? image : image

  const formData = new FormData()
  formData.append('image', base64)

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_KEY}`, {
    method: 'POST',
    body: formData,
  })

  const data = await res.json()

  if (!data.success) {
    return Response.json({ error: data.error?.message || 'imgBB upload failed' }, { status: 502 })
  }

  return Response.json({ url: data.data.url })
}
