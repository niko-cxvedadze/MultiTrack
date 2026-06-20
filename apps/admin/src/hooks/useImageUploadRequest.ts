import { ALLOWED_IMAGE_TYPES, BLOCKED_IMAGE_EXTENSIONS, BLOCKED_IMAGE_TYPES } from '@repo/types'
import type { NotificationInstance } from 'antd/es/notification/interface'
import type { RcFile, UploadProps } from 'antd/es/upload'
import type { TFunction } from 'i18next'

import type { useUploadImage } from '@/hooks'

export function validateImageFile(file: RcFile, t: TFunction): string | null {
  const ext = file.name.toLowerCase()
  const isHeic =
    (BLOCKED_IMAGE_TYPES as readonly string[]).includes(file.type) ||
    BLOCKED_IMAGE_EXTENSIONS.some((e) => ext.endsWith(e))
  if (isHeic) return t('common.imageHeicNotSupported')

  const isAllowed = (ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)
  if (!isAllowed) return t('common.imageTypeNotAllowed')

  return null
}

export function createImageUploadRequest({
  t,
  notification,
  uploadImage,
  folder,
  onDone
}: {
  t: TFunction
  notification: NotificationInstance
  uploadImage: ReturnType<typeof useUploadImage>
  folder: string
  onDone: (path: string) => void
}): UploadProps['customRequest'] {
  return async (options) => {
    const { file, onSuccess, onError } = options
    const errorMsg = validateImageFile(file as RcFile, t)
    if (errorMsg) {
      notification.error({ message: t('common.uploadError'), description: errorMsg })
      onError?.(new Error(errorMsg))
      return
    }

    try {
      const path = await uploadImage.mutateAsync({ file: file as RcFile, folder })
      onDone(path)
      onSuccess?.(path)
      notification.success({ message: t('common.imageUploaded') })
    } catch (err) {
      onError?.(err as Error)
    }
  }
}
