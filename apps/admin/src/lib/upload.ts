import { FALLBACK_CONTENT_TYPE, IMMUTABLE_CACHE_CONTROL } from '@repo/types'

import { api } from './axios'

/**
 * Upload a file directly to R2 via presigned URL.
 * Returns the R2 object path (e.g. "categories/abc/hash.webp").
 */
export async function uploadFileToR2(
  file: File,
  folder: string,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const contentType = file.type || FALLBACK_CONTENT_TYPE

  const { data } = await api.post('/admin/upload/presigned', {
    contentType,
    folder,
    ...(file.name ? { fileName: file.name } : {}),
  })

  const { uploadUrl, key } = data.responseObject

  if (onProgress) {
    await uploadWithProgress(uploadUrl, file, contentType, onProgress)
  } else {
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': contentType, 'Cache-Control': IMMUTABLE_CACHE_CONTROL },
    })

    if (!uploadRes.ok) {
      throw new Error(`R2 upload failed: ${uploadRes.status} ${uploadRes.statusText}`)
    }
  }

  return key
}

function uploadWithProgress(url: string, file: File, contentType: string, onProgress: (percent: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Type', contentType)
    xhr.setRequestHeader('Cache-Control', IMMUTABLE_CACHE_CONTROL)

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100)
        resolve()
      } else {
        reject(new Error(`R2 upload failed: ${xhr.status} ${xhr.statusText}`))
      }
    })

    xhr.addEventListener('error', () => reject(new Error('Upload failed')))
    xhr.addEventListener('abort', () => reject(new Error('Upload aborted')))

    xhr.send(file)
  })
}

/**
 * Delete a file from R2 by its object path.
 */
export async function deleteFileFromR2(path: string): Promise<void> {
  await api.delete('/admin/upload/image', { data: { key: path } })
}
