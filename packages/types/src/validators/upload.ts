import { z } from 'zod'

import { createApiResponseValidator } from './shared'

// ============================================================================
// INPUT VALIDATORS
// ============================================================================

const ALLOWED_UPLOAD_FOLDERS = ['uploads', 'avatars'] as const

export const presignedUploadBodySchema = z.object({
  contentType: z.string().min(1),
  folder: z.string().min(1).refine(
    (val) => ALLOWED_UPLOAD_FOLDERS.some((prefix) => val === prefix || val.startsWith(`${prefix}/`)),
    { message: `Folder must start with one of: ${ALLOWED_UPLOAD_FOLDERS.join(', ')}` },
  ),
  fileName: z.string().min(1).optional(),
})

export const PresignedUploadInputValidator = z.object({
  body: presignedUploadBodySchema,
})

export const deleteImageBodySchema = z.object({
  key: z.string().min(1).refine(
    (val) => ALLOWED_UPLOAD_FOLDERS.some((prefix) => val.startsWith(`${prefix}/`)) && !val.includes('..'),
    { message: `Key must start with one of: ${ALLOWED_UPLOAD_FOLDERS.join(', ')} and must not contain ".."` },
  ),
})

export const DeleteImageInputValidator = z.object({
  body: deleteImageBodySchema,
})

// ============================================================================
// OUTPUT VALIDATORS
// ============================================================================

export const PresignedUploadOutputValidator = createApiResponseValidator(
  z.object({ uploadUrl: z.string().url(), key: z.string(), publicUrl: z.string().url() })
)

export const ImageUploadOutputValidator = createApiResponseValidator(
  z.object({ url: z.string().url(), key: z.string() })
)

// ============================================================================
// TYPES
// ============================================================================

export type PresignedUploadBody = z.infer<typeof presignedUploadBodySchema>
export type DeleteImageBody = z.infer<typeof deleteImageBodySchema>
export type PresignedUploadOutput = z.infer<typeof PresignedUploadOutputValidator>
export type ImageUploadOutput = z.infer<typeof ImageUploadOutputValidator>
