import { useState } from 'react'

import { EditOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Tooltip, Upload } from 'antd'
import type { RcFile, UploadFile } from 'antd/es/upload'
import { useTranslation } from 'react-i18next'

import { getImageUrl } from '@/lib/image'

import { useDeleteImage, useUploadImage, validateImageFile } from '@/hooks'
import { useNotification } from '@/providers'

import { ImageEditorModal } from './ImageEditorModal'

interface ImageUploadProps {
  /** R2 object path (e.g. "categories/abc/hash.webp") */
  value?: string | null
  onChange?: (path: string | null) => void
  folder: string
}

/**
 * Single image upload component for Ant Design Form.
 * Value is an R2 object path — full URL is built at display time.
 */
export function ImageUpload({ value, onChange, folder }: ImageUploadProps) {
  const { t } = useTranslation()
  const notification = useNotification()
  const uploadImage = useUploadImage()
  const deleteImage = useDeleteImage()

  const [editorSource, setEditorSource] = useState<string | null>(null)

  const fileList: UploadFile[] = value
    ? [{ uid: '-1', name: 'image', status: 'done', url: getImageUrl(value) }]
    : []

  const handleBeforeUpload = (file: RcFile) => {
    const errorMsg = validateImageFile(file, t)
    if (errorMsg) {
      notification.error({ message: t('common.uploadError'), description: errorMsg })
      return Upload.LIST_IGNORE
    }
    setEditorSource(URL.createObjectURL(file))
    return Upload.LIST_IGNORE
  }

  const handleEditorSave = async (file: File) => {
    const path = await uploadImage.mutateAsync({ file, folder })
    onChange?.(path)
    notification.success({ message: t('common.imageUploaded') })
  }

  const handleRemove = async () => {
    if (value && !value.startsWith('http')) {
      try {
        await deleteImage.mutateAsync(value)
      } catch {
        // Non-critical
      }
    }
    onChange?.(null)
  }

  return (
    <>
      <Upload
        listType="picture-card"
        fileList={fileList}
        beforeUpload={handleBeforeUpload}
        onRemove={handleRemove}
        maxCount={1}
        accept="image/*"
        itemRender={(originNode, file) => (
          <div className="relative" style={{ width: '100%', height: '100%' }}>
            {originNode}
            {file.status === 'done' && value && (
              <Tooltip title="Edit">
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined style={{ color: '#fff' }} />}
                  style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.4)' }}
                  onClick={() => setEditorSource(getImageUrl(value))}
                />
              </Tooltip>
            )}
          </div>
        )}
      >
        {!value && (
          <div>
            {uploadImage.isPending ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>Upload</div>
          </div>
        )}
      </Upload>

      <ImageEditorModal
        source={editorSource}
        onSave={handleEditorSave}
        onClose={() => setEditorSource(null)}
      />
    </>
  )
}
