import { z } from 'zod'

import { OtpPurpose } from '../constants'
import {
  createApiResponseValidator,
  emailValidator,
  otpCodeValidator,
  phoneNumberValidator
} from './shared'

// OTP purpose validator
const otpPurposeValidator = z.nativeEnum(OtpPurpose)

// Input validators
export const SendCodeInputValidator = z.object({
  body: z.object({
    phoneNumber: phoneNumberValidator,
    purpose: otpPurposeValidator
  })
})

export const VerifyCodeInputValidator = z.object({
  body: z.object({
    phoneNumber: phoneNumberValidator,
    code: otpCodeValidator
  })
})

export const RegisterInputValidator = z.object({
  body: z.object({
    phoneNumber: phoneNumberValidator,
    code: otpCodeValidator,
    email: emailValidator,
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
    newsletterSubscribed: z.boolean().optional()
  })
})

export const SendEmailCodeInputValidator = z.object({
  body: z.object({
    email: emailValidator
  })
})

export const VerifyEmailCodeInputValidator = z.object({
  body: z.object({
    email: emailValidator,
    code: otpCodeValidator
  })
})

export const CheckExistsInputValidator = z.object({
  body: z.object({
    phoneNumber: phoneNumberValidator.optional(),
    email: emailValidator.optional()
  })
})

// Output validators
export const CheckExistsOutputValidator = createApiResponseValidator(
  z.object({ phoneExists: z.boolean(), emailExists: z.boolean() })
)

export const SendCodeOutputValidator = createApiResponseValidator(
  z.object({ message: z.string() })
)

export const VerifyCodeOutputValidator = createApiResponseValidator(
  z.object({ token: z.string() })
)

export const RegisterOutputValidator = createApiResponseValidator(
  z.object({ token: z.string() })
)

export const SendEmailCodeOutputValidator = createApiResponseValidator(
  z.object({ message: z.string() })
)

export const VerifyEmailCodeOutputValidator = createApiResponseValidator(
  z.object({ token: z.string() })
)

// Form schemas (for react-hook-form on the client)
export const PhoneFormSchema = z.object({
  phoneNumber: phoneNumberValidator
})

export const EmailFormSchema = z.object({
  email: emailValidator
})

export const OtpCodeFormSchema = z.object({
  code: otpCodeValidator
})

export const RegisterFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  phoneNumber: phoneNumberValidator,
  email: emailValidator,
  termsAccepted: z.literal(true, {
    message: 'You must accept the Terms & Conditions'
  })
})

// Input types
export type SendCodeInput = z.infer<typeof SendCodeInputValidator>
export type VerifyCodeInput = z.infer<typeof VerifyCodeInputValidator>
export type RegisterInput = z.infer<typeof RegisterInputValidator>

// Form types
export type PhoneFormValues = z.infer<typeof PhoneFormSchema>
export type EmailFormValues = z.infer<typeof EmailFormSchema>
export type OtpCodeFormValues = z.infer<typeof OtpCodeFormSchema>
export type RegisterFormValues = z.infer<typeof RegisterFormSchema>

// Output types
export type SendCodeOutput = z.infer<typeof SendCodeOutputValidator>
export type VerifyCodeOutput = z.infer<typeof VerifyCodeOutputValidator>
export type RegisterOutput = z.infer<typeof RegisterOutputValidator>
