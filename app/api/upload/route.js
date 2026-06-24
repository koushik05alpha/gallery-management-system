export async function POST(request) {
  const { image } = await request.json()
  if (!image) {
    return Response.json({ error: 'No image provided' }, { status: 400 })
  }

  const base64 = image.includes('base64,') ? image.split('base64,')[1] : image

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
