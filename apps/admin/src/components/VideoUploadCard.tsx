import { DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import { Button, Card, Popconfirm, Progress, Typography, Upload } from 'antd'
import type { RcFile } from 'antd/es/upload'
import { useTranslation } from 'react-i18next'

import { getR2PreviewUrl } from '@/lib/image'

interface VideoUploadCardProps {
  videoUrl: string | null
  uploading: boolean
  progress: number
  onUpload: (file: RcFile) => boolean | Promise<boolean>
  onRemove: () => Promise<void>
}

export function VideoUploadCard({
  videoUrl,
  uploading,
  progress,
  onUpload,
  onRemove
}: VideoUploadCardProps) {
  const { t } = useTranslation()
  const previewUrl = getR2PreviewUrl(videoUrl ?? undefined)

  return (
    <Card title={t('products.video')}>
      {videoUrl && previewUrl ? (
        <div className="flex flex-col gap-3">
          <video
            src={previewUrl}
            controls
            style={{ maxWidth: 480, maxHeight: 320, borderRadius: 4, background: '#000' }}
          />
          <Popconfirm
            title={t('common.delete')}
            description={t('common.deleteConfirm')}
            onConfirm={onRemove}
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />} style={{ alignSelf: 'flex-start' }}>
              {t('products.videoRemove')}
            </Button>
          </Popconfirm>
        </div>
      ) : uploading ? (
        <div className="flex flex-col gap-2" style={{ maxWidth: 400 }}>
          <Progress percent={progress} status="active" />
          <Typography.Text type="secondary">{t('products.videoUpload')}...</Typography.Text>
        </div>
      ) : (
        <Upload
          showUploadList={false}
          beforeUpload={onUpload}
          accept="video/mp4,video/webm,video/quicktime"
        >
          <Button icon={<UploadOutlined />}>{t('products.videoUpload')}</Button>
          <Typography.Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
            {t('products.videoUploadHint')}
          </Typography.Text>
        </Upload>
      )}
    </Card>
  )
}
