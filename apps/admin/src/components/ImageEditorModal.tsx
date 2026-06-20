import { useCallback, useEffect, useReducer, useRef } from 'react'

import {
  RotateLeftOutlined,
  RotateRightOutlined,
  SwapOutlined,
  UndoOutlined
} from '@ant-design/icons'
import { MAX_IMAGE_SIZE_MB } from '@repo/types'
import { Button, Modal, Space, Spin, Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop'
import type { Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

import { api } from '@/lib/axios'

// ── Aspect ratio presets ────────────────────────────────────────────────

interface AspectPreset {
  label: string
  /** -1 = original, undefined = free */
  value: number | undefined
}

const ASPECT_PRESETS: AspectPreset[] = [
  { label: 'Original', value: -1 },
  { label: 'Free', value: undefined },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:4', value: 3 / 4 },
  { label: '16:9', value: 16 / 9 },
  { label: '9:16', value: 9 / 16 },
  { label: '3:2', value: 3 / 2 },
  { label: '2:3', value: 2 / 3 }
]

const DEFAULT_PRESET = ASPECT_PRESETS[0]

// ── Types ───────────────────────────────────────────────────────────────

interface ImageEditorModalProps {
  source: string | null
  onSave: (file: File) => void | Promise<void>
  onClose: () => void
  /** Override the default aspect presets */
  presets?: AspectPreset[]
}

export type { AspectPreset }

// ── Editor state & reducer ──────────────────────────────────────────────

interface EditorState {
  crop: Crop | undefined
  completedCrop: PixelCrop | undefined
  aspect: number | undefined
  activePreset: string
  rotation: number
  flipH: boolean
  flipV: boolean
  saving: boolean
  imageLoaded: boolean
}

type EditorAction =
  | { type: 'SET_CROP'; crop: Crop }
  | { type: 'SET_COMPLETED_CROP'; crop: PixelCrop }
  | { type: 'APPLY_PRESET'; preset: string; aspect: number | undefined; crop: Crop }
  | { type: 'ROTATE_LEFT' }
  | { type: 'ROTATE_RIGHT' }
  | { type: 'FLIP_H' }
  | { type: 'FLIP_V' }
  | { type: 'IMAGE_LOADED'; aspect: number | undefined; crop: Crop; preset: string }
  | { type: 'SET_SAVING'; saving: boolean }
  | { type: 'RESET'; crop: Crop; aspect: number | undefined; preset?: string }

const initialState: EditorState = {
  crop: undefined,
  completedCrop: undefined,
  aspect: undefined,
  activePreset: DEFAULT_PRESET.label,
  rotation: 0,
  flipH: false,
  flipV: false,
  saving: false,
  imageLoaded: false
}

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_CROP':
      return { ...state, crop: action.crop }
    case 'SET_COMPLETED_CROP':
      return { ...state, completedCrop: action.crop }
    case 'APPLY_PRESET':
      return { ...state, activePreset: action.preset, aspect: action.aspect, crop: action.crop }
    case 'ROTATE_LEFT':
      return { ...state, rotation: state.rotation - 90 }
    case 'ROTATE_RIGHT':
      return { ...state, rotation: state.rotation + 90 }
    case 'FLIP_H':
      return { ...state, flipH: !state.flipH }
    case 'FLIP_V':
      return { ...state, flipV: !state.flipV }
    case 'IMAGE_LOADED':
      return {
        ...state,
        imageLoaded: true,
        aspect: action.aspect,
        crop: action.crop,
        activePreset: action.preset
      }
    case 'SET_SAVING':
      return { ...state, saving: action.saving }
    case 'RESET':
      return {
        ...initialState,
        imageLoaded: state.imageLoaded,
        aspect: action.aspect,
        crop: action.crop,
        activePreset: action.preset ?? initialState.activePreset
      }
  }
}

// ── Canvas helper ───────────────────────────────────────────────────────

function getCroppedCanvas(
  image: HTMLImageElement,
  crop: PixelCrop,
  rotation: number,
  flipH: boolean,
  flipV: boolean
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  const radians = (rotation * Math.PI) / 180
  const cos = Math.abs(Math.cos(radians))
  const sin = Math.abs(Math.sin(radians))

  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height

  const cropX = crop.x * scaleX
  const cropY = crop.y * scaleY
  const cropW = crop.width * scaleX
  const cropH = crop.height * scaleY

  const rotatedW = cropW * cos + cropH * sin
  const rotatedH = cropW * sin + cropH * cos

  canvas.width = Math.round(rotatedW)
  canvas.height = Math.round(rotatedH)

  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate(radians)
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
  ctx.drawImage(image, cropX, cropY, cropW, cropH, -cropW / 2, -cropH / 2, cropW, cropH)

  return canvas
}

async function canvasToFile(canvas: HTMLCanvasElement): Promise<File> {
  const maxBytes = MAX_IMAGE_SIZE_MB * 1024 * 1024
  let quality = 0.9

  while (quality >= 0.1) {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', quality)
    )
    if (blob && blob.size <= maxBytes) {
      return new File([blob], 'edited.webp', { type: 'image/webp' })
    }
    quality -= 0.1
  }

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', 0.1)
  )
  return new File([blob!], 'edited.webp', { type: 'image/webp' })
}

// ── Helpers ─────────────────────────────────────────────────────────────

function makeDefaultCrop(width: number, height: number, aspect: number | undefined) {
  return centerCrop(makeAspectCrop({ unit: '%', width: 90 }, aspect!, width, height), width, height)
}

// ── Blob source hook (proxies CDN URLs through backend to bypass CORS) ──

const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL || 'https://cdn.printa.ge'

function useBlobSource(source: string | null) {
  const [state, setState] = useReducer(
    (
      _: { blobUrl: string | null; loading: boolean },
      next: { blobUrl: string | null; loading: boolean }
    ) => next,
    { blobUrl: null, loading: false }
  )

  useEffect(() => {
    if (!source) {
      setState({ blobUrl: null, loading: false })
      return
    }

    if (source.startsWith('blob:')) {
      setState({ blobUrl: source, loading: false })
      return
    }

    // Extract R2 key from CDN URL and proxy through backend API
    const r2Key = source.startsWith(R2_PUBLIC_URL) ? source.slice(R2_PUBLIC_URL.length + 1) : null

    setState({ blobUrl: null, loading: true })
    let cancelled = false

    const fetchImage = r2Key
      ? api
          .get('/admin/upload/proxy', { params: { key: r2Key }, responseType: 'blob' })
          .then((res) => res.data as Blob)
      : fetch(source).then((res) => res.blob())

    fetchImage
      .then((blob) => {
        if (!cancelled) setState({ blobUrl: URL.createObjectURL(blob), loading: false })
      })
      .catch(() => {
        if (!cancelled) setState({ blobUrl: source, loading: false })
      })

    return () => {
      cancelled = true
    }
  }, [source])

  useEffect(() => {
    return () => {
      if (state.blobUrl && state.blobUrl.startsWith('blob:') && state.blobUrl !== source) {
        URL.revokeObjectURL(state.blobUrl)
      }
    }
  }, [state.blobUrl, source])

  return state
}

// ── Component ───────────────────────────────────────────────────────────

export function ImageEditorModal({ source, onSave, onClose, presets }: ImageEditorModalProps) {
  const { t } = useTranslation()
  const { blobUrl, loading: loadingSource } = useBlobSource(source)
  const activePresets = presets ?? ASPECT_PRESETS
  const defaultPreset = activePresets[0]
  const [state, dispatch] = useReducer(editorReducer, {
    ...initialState,
    activePreset: defaultPreset.label
  })
  const imgRef = useRef<HTMLImageElement | null>(null)
  const originalAspectRef = useRef<number>(1)

  const applyCrop = useCallback(
    (preset: AspectPreset) => {
      if (!imgRef.current) return
      const { width, height } = imgRef.current
      const resolved = preset.value === -1 ? originalAspectRef.current : preset.value
      dispatch({
        type: 'APPLY_PRESET',
        preset: preset.label,
        aspect: resolved,
        crop: resolved ? makeDefaultCrop(width, height, resolved) : state.crop!
      })
    },
    [state.crop]
  )

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height, naturalWidth, naturalHeight } = e.currentTarget
      imgRef.current = e.currentTarget
      const origAspect = naturalWidth / naturalHeight
      originalAspectRef.current = origAspect

      const initAspect = defaultPreset.value === -1 ? origAspect : defaultPreset.value
      dispatch({
        type: 'IMAGE_LOADED',
        aspect: initAspect,
        crop: makeDefaultCrop(width, height, initAspect),
        preset: defaultPreset.label
      })
    },
    [defaultPreset]
  )

  const handleSave = async () => {
    if (!imgRef.current || !state.completedCrop?.width || !state.completedCrop?.height) return
    dispatch({ type: 'SET_SAVING', saving: true })
    try {
      const canvas = getCroppedCanvas(
        imgRef.current,
        state.completedCrop,
        state.rotation,
        state.flipH,
        state.flipV
      )
      const file = await canvasToFile(canvas)
      await onSave(file)
      onClose()
    } finally {
      dispatch({ type: 'SET_SAVING', saving: false })
    }
  }

  const handleReset = useCallback(() => {
    if (!imgRef.current) return
    const { width, height } = imgRef.current
    const resetAspect = defaultPreset.value === -1 ? originalAspectRef.current : defaultPreset.value
    dispatch({
      type: 'RESET',
      aspect: resetAspect,
      crop: makeDefaultCrop(width, height, resetAspect),
      preset: defaultPreset.label
    })
  }, [defaultPreset])

  // Reset when source changes
  useEffect(() => {
    dispatch({
      type: 'RESET',
      aspect: undefined,
      crop: undefined!,
      preset: defaultPreset.label
    })
    imgRef.current = null
  }, [source, defaultPreset.label])

  if (!source) return null

  return (
    <Modal
      open
      onCancel={onClose}
      width="90vw"
      style={{ top: 20, maxWidth: 1000 }}
      styles={{ body: { padding: '16px 16px 0' } }}
      destroyOnHidden
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Button
              icon={<RotateLeftOutlined />}
              onClick={() => dispatch({ type: 'ROTATE_LEFT' })}
            />
            <Button
              icon={<RotateRightOutlined />}
              onClick={() => dispatch({ type: 'ROTATE_RIGHT' })}
            />
            <Button icon={<SwapOutlined />} onClick={() => dispatch({ type: 'FLIP_H' })}>
              Flip H
            </Button>
            <Button
              icon={<SwapOutlined style={{ transform: 'rotate(90deg)' }} />}
              onClick={() => dispatch({ type: 'FLIP_V' })}
            >
              Flip V
            </Button>
            <Button icon={<UndoOutlined />} onClick={handleReset}>
              Reset
            </Button>
          </Space>
          <Space>
            <Button onClick={onClose}>{t('common.cancel')}</Button>
            <Button
              type="primary"
              onClick={handleSave}
              loading={state.saving}
              disabled={!state.imageLoaded}
            >
              {t('common.save')}
            </Button>
          </Space>
        </div>
      }
    >
      {/* Aspect ratio presets */}
      <div style={{ marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {activePresets.map((preset) => (
          <Tag.CheckableTag
            key={preset.label}
            checked={state.activePreset === preset.label}
            onChange={() => applyCrop(preset)}
          >
            {preset.label}
          </Tag.CheckableTag>
        ))}
      </div>

      {/* Image + crop area */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 200,
          maxHeight: '65vh',
          overflow: 'auto'
        }}
      >
        {loadingSource || !blobUrl ? (
          <Spin size="large" />
        ) : (
          <ReactCrop
            crop={state.crop}
            onChange={(c) => dispatch({ type: 'SET_CROP', crop: c })}
            onComplete={(c) => dispatch({ type: 'SET_COMPLETED_CROP', crop: c })}
            aspect={state.aspect}
            ruleOfThirds
            keepSelection
          >
            <img
              src={blobUrl}
              onLoad={onImageLoad}
              alt="Edit"
              style={{
                maxHeight: '60vh',
                maxWidth: '100%',
                transform: `rotate(${state.rotation}deg) scaleX(${state.flipH ? -1 : 1}) scaleY(${state.flipV ? -1 : 1})`
              }}
            />
          </ReactCrop>
        )}
      </div>
    </Modal>
  )
}
