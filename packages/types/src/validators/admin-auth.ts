import { z } from 'zod'

import { createApiResponseValidator } from './shared'

// Input validators
export const AdminLoginInputValidator = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
  })
})

// Output validators
export const AdminLoginOutputValidator = createApiResponseValidator(
  z.object({ token: z.string() })
)

export const AdminMeOutputValidator = createApiResponseValidator(
  z.object({ email: z.string() })
)

// JWT payload validator
export const AdminJwtPayloadSchema = z.object({
  email: z.string(),
  role: z.string(),
})

export type AdminJwtPayload = z.infer<typeof AdminJwtPayloadSchema>

// Input types
export type AdminLoginInput = z.infer<typeof AdminLoginInputValidator>

// Output types
export type AdminLoginOutput = z.infer<typeof AdminLoginOutputValidator>
export type AdminMeOutput = z.infer<typeof AdminMeOutputValidator>
