import { useState } from 'react'
import type { ReactNode } from 'react'

import { DeleteOutlined, EditOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button, Image, Tooltip, Upload } from 'antd'
import type { RcFile } from 'antd/es/upload'
import { useTranslation } from 'react-i18next'

import { getImageUrl } from '@/lib/image'

import { createImageUploadRequest, useUploadImage, validateImageFile } from '@/hooks'
import { useNotification } from '@/providers'

import { ImageEditorModal } from './ImageEditorModal'

interface MultiImageUploadProps {
  /** Array of image objects — only `url` (R2 path) is required */
  images: { id?: string; url: string }[]
  folder: string
  onAdd: (path: string) => void
  onRemove: (index: number) => void
  /** Called when an existing image is replaced via the editor */
  onReplace?: (index: number, newPath: string) => void
  /** Called with indices relative to the full images array (including primary at 0) */
  onReorder?: (fromIndex: number, toIndex: number) => void
  renderActions?: (index: number) => ReactNode
  isHighlighted?: (index: number) => boolean
  /** Index of the primary image that should be locked in place (not draggable) */
  lockedIndex?: number
}

interface ImageCardProps {
  index: number
  url: string
  isHighlighted: boolean
  renderActions?: (index: number) => ReactNode
  onRemove: (index: number) => void
  onEdit: (index: number) => void
}

function ImageOverlay({
  index,
  renderActions,
  onRemove,
  onEdit
}: Omit<ImageCardProps, 'url' | 'isHighlighted'>) {
  return (
    <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1 bg-black/50 py-0.5">
      {renderActions?.(index)}
      <Tooltip title="Edit">
        <Button
          type="text"
          size="small"
          icon={<EditOutlined style={{ color: '#fff' }} />}
          onClick={() => onEdit(index)}
        />
      </Tooltip>
      <Tooltip title="Delete">
        <Button
          type="text"
          size="small"
          danger
          icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
          onClick={() => onRemove(index)}
        />
      </Tooltip>
    </div>
  )
}

/** Non-draggable image (used for primary/locked image) */
function StaticImage({
  index,
  url,
  isHighlighted,
  renderActions,
  onRemove,
  onEdit
}: ImageCardProps) {
  return (
    <div
      className="relative"
      style={{
        width: 104,
        height: 104,
        border: isHighlighted ? '2px solid #4f46e5' : '1px solid #d9d9d9',
        borderRadius: 8,
        overflow: 'hidden'
      }}
    >
      <Image
        src={getImageUrl(url)}
        alt=""
        width={102}
        height={80}
        style={{ objectFit: 'cover' }}
        preview={false}
      />
      <ImageOverlay
        index={index}
        renderActions={renderActions}
        onRemove={onRemove}
        onEdit={onEdit}
      />
    </div>
  )
}

interface SortableImageProps extends ImageCardProps {
  id: string
}

function SortableImage({
  id,
  index,
  url,
  isHighlighted,
  renderActions,
  onRemove,
  onEdit
}: SortableImageProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    width: 104,
    height: 104,
    border: isHighlighted ? '2px solid #4f46e5' : '1px solid #d9d9d9',
    borderRadius: 8,
    overflow: 'hidden' as const,
    cursor: 'grab'
  }

  return (
    <div ref={setNodeRef} style={style} className="relative" {...attributes} {...listeners}>
      <Image
        src={getImageUrl(url)}
        alt=""
        width={102}
        height={80}
        style={{ objectFit: 'cover', pointerEvents: 'none' }}
        preview={false}
      />
      <div onPointerDown={(e) => e.stopPropagation()}>
        <ImageOverlay
          index={index}
          renderActions={renderActions}
          onRemove={onRemove}
          onEdit={onEdit}
        />
      </div>
    </div>
  )
}

/**
 * Generic multi-image upload component with drag-and-drop reordering
 * and built-in image editor (crop, adjust, filters, annotate, resize).
 */
export function MultiImageUpload({
  images,
  folder,
  onAdd,
  onRemove,
  onReplace,
  onReorder,
  renderActions,
  isHighlighted,
  lockedIndex
}: MultiImageUploadProps) {
  const { t } = useTranslation()
  const notification = useNotification()
  const uploadImage = useUploadImage()

  // Editor state — either a new file (pre-upload) or existing image URL (edit)
  const [editorSource, setEditorSource] = useState<string | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    })
  )

  // Split images: locked (primary) first, then sortable rest
  const lockedImg = lockedIndex !== undefined ? images[lockedIndex] : undefined
  const sortableImages =
    lockedIndex !== undefined ? images.filter((_, i) => i !== lockedIndex) : images

  const sortableIds = sortableImages.map((img, i) => img.id || `new-${i}-${img.url}`)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id || !onReorder) return

    const sortFromIndex = sortableIds.indexOf(active.id as string)
    const sortToIndex = sortableIds.indexOf(over.id as string)
    if (sortFromIndex === -1 || sortToIndex === -1) return

    const offset = lockedIndex !== undefined ? 1 : 0
    onReorder(sortFromIndex + offset, sortToIndex + offset)
  }

  // Pre-upload: file selected → validate → open editor
  const handleBeforeUpload = (file: RcFile) => {
    const errorMsg = validateImageFile(file, t)
    if (errorMsg) {
      notification.error({ message: t('common.uploadError'), description: errorMsg })
      return Upload.LIST_IGNORE
    }
    setEditorSource(URL.createObjectURL(file))
    setEditingIndex(null)
    return Upload.LIST_IGNORE
  }

  // Edit existing image
  const handleEditImage = (index: number) => {
    const img = images[index]
    setEditorSource(getImageUrl(img.url))
    setEditingIndex(index)
  }

  // Editor save: upload the edited file
  const handleEditorSave = async (file: File) => {
    const path = await uploadImage.mutateAsync({ file, folder })
    if (editingIndex !== null && onReplace) {
      onReplace(editingIndex, path)
    } else {
      onAdd(path)
    }
    notification.success({ message: t('common.imageUploaded') })
  }

  const handleEditorClose = () => {
    setEditorSource(null)
    setEditingIndex(null)
  }

  // Direct upload without editor (fallback customRequest for drag-drop)
  const customRequest = createImageUploadRequest({
    t,
    notification,
    uploadImage,
    folder,
    onDone: onAdd
  })

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {lockedImg && (
          <StaticImage
            index={lockedIndex!}
            url={lockedImg.url}
            isHighlighted={isHighlighted?.(lockedIndex!) ?? false}
            renderActions={renderActions}
            onRemove={onRemove}
            onEdit={handleEditImage}
          />
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortableIds} strategy={horizontalListSortingStrategy}>
            {sortableImages.map((img, sortIdx) => {
              const originalIndex = lockedIndex !== undefined ? sortIdx + 1 : sortIdx
              return (
                <SortableImage
                  key={sortableIds[sortIdx]}
                  id={sortableIds[sortIdx]}
                  index={originalIndex}
                  url={img.url}
                  isHighlighted={isHighlighted?.(originalIndex) ?? false}
                  renderActions={renderActions}
                  onRemove={onRemove}
                  onEdit={handleEditImage}
                />
              )
            })}
          </SortableContext>
        </DndContext>

        <Upload
          showUploadList={false}
          beforeUpload={handleBeforeUpload}
          customRequest={customRequest}
          accept="image/*"
        >
          <div
            className="flex cursor-pointer flex-col items-center justify-center"
            style={{
              width: 104,
              height: 104,
              border: '1px dashed #d9d9d9',
              borderRadius: 8
            }}
          >
            {uploadImage.isPending ? <LoadingOutlined /> : <PlusOutlined />}
            <div className="mt-1 text-xs">Upload</div>
          </div>
        </Upload>
      </div>

      <ImageEditorModal
        source={editorSource}
        onSave={handleEditorSave}
        onClose={handleEditorClose}
      />
    </>
  )
}
