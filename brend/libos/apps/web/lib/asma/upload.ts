const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('asma_admin_token')
}

export async function uploadProductImage(file: File): Promise<string> {
  // Backend dan Cloudinary signature olamiz
  const signRes = await fetch(`${API}/upload/sign`, {
    headers: {
      Authorization: `Bearer ${getAdminToken() ?? ''}`,
    },
  })
  if (!signRes.ok) throw new Error('Upload sign failed')
  const { uploadUrl, apiKey, cloudName, timestamp, signature, folder } = await signRes.json()

  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', apiKey)
  formData.append('timestamp', timestamp)
  formData.append('signature', signature)
  formData.append('folder', folder)

  const uploadRes = await fetch(uploadUrl, { method: 'POST', body: formData })
  if (!uploadRes.ok) throw new Error('Upload failed')

  const data = await uploadRes.json()
  return data.secure_url as string
}
