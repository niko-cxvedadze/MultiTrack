import { z } from 'zod'

import { SLUG_PATTERN } from '../constants'

// Shared slug validator — reuse everywhere slugs are accepted
export const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .max(300)
  .regex(SLUG_PATTERN, 'Slug must contain only lowercase English letters, numbers, and hyphens')

// Georgian phone number validation (with or without +995 prefix)
export const phoneNumberValidator = z
  .string()
  .min(9)
  .max(13)
  .transform((val) => val.replace(/^(\+?995)?/, ''))
  .refine((val) => /^5[0-9]{8}$/.test(val), {
    message: 'Invalid Georgian mobile number. Must start with 5 and be 9 digits.'
  })

export const emailValidator = z.string().email('Invalid email address').min(1)

export const otpCodeValidator = z
  .string()
  .length(6, 'Verification code must be 6 digits')
  .regex(/^\d{6}$/, 'Verification code must contain only digits')

// Pagination
const DEFAULT_PAGE_LIMIT = 20
const MAX_PAGE_LIMIT = 100

export const PaginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_LIMIT).default(DEFAULT_PAGE_LIMIT),
  offset: z.coerce.number().int().min(0).default(0)
})

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>

export const createPaginatedResponseValidator = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    success: z.boolean(),
    responseObject: z.object({
      items: z.array(itemSchema),
      total: z.number(),
      limit: z.number(),
      offset: z.number()
    }),
    statusCode: z.number()
  })

export type PaginatedResponse<T> = {
  items: T[]
  total: number
  limit: number
  offset: number
}

// API response wrapper
export const createApiResponseValidator = <T extends z.ZodTypeAny>(responseObjectSchema: T) =>
  z.object({
    success: z.boolean(),
    message: z.string(),
    responseObject: responseObjectSchema.nullable(),
    statusCode: z.number()
  })
