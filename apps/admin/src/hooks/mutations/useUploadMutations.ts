import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { deleteFileFromR2, uploadFileToR2 } from '@/lib/upload'

import { useNotification } from '@/providers'

/**
 * Upload a file to R2. Returns the R2 object path on success.
 */
export function useUploadImage() {
  const { t } = useTranslation()
  const notification = useNotification()
  return useMutation({
    mutationFn: ({ file, folder }: { file: File; folder: string }) => uploadFileToR2(file, folder),
    onError: () => notification.error({ message: t('common.uploadFailed') })
  })
}

/**
 * Delete a file from R2 by its object path.
 */
export function useDeleteImage() {
  const { t } = useTranslation()
  const notification = useNotification()
  return useMutation({
    mutationFn: (path: string) => deleteFileFromR2(path),
    onError: () => notification.error({ message: t('common.deleteFailed') })
  })
}
