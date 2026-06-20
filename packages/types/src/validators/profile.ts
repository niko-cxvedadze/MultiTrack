import { z } from 'zod'

export const UpdateFullNameInputValidator = z.object({
  body: z.object({
    fullName: z.string().min(1).max(100)
  })
})

export type UpdateFullNameInput = z.infer<typeof UpdateFullNameInputValidator>['body']

export const UpdateNewsletterInputValidator = z.object({
  body: z.object({
    newsletterSubscribed: z.boolean()
  })
})

export type UpdateNewsletterInput = z.infer<typeof UpdateNewsletterInputValidator>['body']
