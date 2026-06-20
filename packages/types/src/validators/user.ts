import { z } from 'zod'

import { PaginationQuerySchema, createPaginatedResponseValidator } from './shared'

// Input validators
export const GetUsersInputValidator = z.object({
  query: PaginationQuerySchema,
})

// Output validators
export const GetUsersOutputValidator = createPaginatedResponseValidator(
  z.object({
    id: z.string(),
    email: z.string().optional(),
    phoneNumber: z.string().optional(),
    fullName: z.string().optional(),
    type: z.string().optional(),
    createdAt: z.string().optional(),
  })
)

// Types
export type GetUsersInput = z.infer<typeof GetUsersInputValidator>
export type GetUsersOutput = z.infer<typeof GetUsersOutputValidator>
