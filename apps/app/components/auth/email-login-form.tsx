'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Mail } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import type { EmailFormValues } from '@repo/types'
import { EmailFormSchema, getApiErrorMessage } from '@repo/types'

import { sendEmailCode, verifyEmailCode } from '@/data/client/mutations/auth'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText
} from '@/components/ui/input-group'
import { OtpVerificationForm } from '@/components/auth/otp-verification-form'

enum Step {
  Email = 'email',
  Code = 'code'
}

export function EmailLoginForm({ onSuccess }: { onSuccess: () => void }) {
  const t = useTranslations('auth')
  const [step, setStep] = useState(Step.Email)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(EmailFormSchema),
    defaultValues: { email: '' }
  })

  async function handleSendCode(data: EmailFormValues) {
    setServerError('')
    setLoading(true)
    try {
      await sendEmailCode(data.email)
      setEmail(data.email)
      setStep(Step.Code)
    } catch (err) {
      setServerError(getApiErrorMessage(err, t('sendCodeFailed'), t))
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(code: string) {
    setServerError('')
    setLoading(true)
    try {
      await verifyEmailCode(email, code)
      onSuccess()
    } catch (err) {
      setServerError(getApiErrorMessage(err, t('verifyCodeFailed'), t))
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setServerError('')
    setLoading(true)
    try {
      await sendEmailCode(email)
    } catch (err) {
      setServerError(getApiErrorMessage(err, t('sendCodeFailed'), t))
    } finally {
      setLoading(false)
    }
  }

  if (step === Step.Email) {
    return (
      <form onSubmit={emailForm.handleSubmit(handleSendCode)} className="flex flex-col gap-4">
        <Controller
          name="email"
          control={emailForm.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel className="text-sm">{t('email')}</FieldLabel>
              <InputGroup className="h-10">
                <InputGroupAddon align="inline-start">
                  <InputGroupText>
                    <Mail className="size-4" />
                  </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  type="email"
                  placeholder="you@example.com"
                  aria-invalid={fieldState.invalid}
                  {...field}
                />
              </InputGroup>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        {serverError && <p className="text-sm text-destructive">{serverError}</p>}
        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading && <Loader2 className="size-4 animate-spin" />}
          {t('sendCode')}
        </Button>
      </form>
    )
  }

  return (
    <OtpVerificationForm
      onVerify={handleVerify}
      onResend={handleResend}
      message={t('emailCodeSent')}
      submitLabel={t('verify')}
      loading={loading}
      serverError={serverError}
    />
  )
}
