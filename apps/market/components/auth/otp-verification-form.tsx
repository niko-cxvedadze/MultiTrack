'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { useTranslations } from 'next-intl'

import { zodResolver } from '@hookform/resolvers/zod'
import type { OtpCodeFormValues } from '@repo/types'
import { OtpCodeFormSchema } from '@repo/types'
import { Loader2 } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'

const RESEND_COOLDOWN = 30

interface OtpVerificationFormProps {
  onVerify: (code: string) => Promise<void>
  onResend: () => Promise<void>
  message: string
  submitLabel: string
  loading: boolean
  serverError: string
}

export function OtpVerificationForm({
  onVerify,
  onResend,
  message,
  submitLabel,
  loading,
  serverError
}: OtpVerificationFormProps) {
  const t = useTranslations('auth')
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startTimer = useCallback(() => {
    setCountdown(RESEND_COOLDOWN)
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          intervalRef.current = null
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    intervalRef.current = interval
    return () => {
      clearInterval(interval)
    }
  }, [])

  const codeForm = useForm<OtpCodeFormValues>({
    resolver: zodResolver(OtpCodeFormSchema),
    defaultValues: { code: '' }
  })

  async function handleSubmit(data: OtpCodeFormValues) {
    await onVerify(data.code)
  }

  async function handleResend() {
    await onResend()
    startTimer()
  }

  const canResend = countdown === 0

  return (
    <form onSubmit={codeForm.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Controller
        name="code"
        control={codeForm.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid || undefined}>
            <FieldLabel className="text-sm">{t('verificationCode')}</FieldLabel>
            <InputOTP
              maxLength={6}
              value={field.value}
              onChange={field.onChange}
              aria-invalid={fieldState.invalid}
              containerClassName="w-full"
            >
              <InputOTPGroup className="w-full">
                <InputOTPSlot index={0} className="h-12 flex-1 text-sm" />
                <InputOTPSlot index={1} className="h-12 flex-1 text-sm" />
                <InputOTPSlot index={2} className="h-12 flex-1 text-sm" />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup className="w-full">
                <InputOTPSlot index={3} className="h-12 flex-1 text-sm" />
                <InputOTPSlot index={4} className="h-12 flex-1 text-sm" />
                <InputOTPSlot index={5} className="h-12 flex-1 text-sm" />
              </InputOTPGroup>
            </InputOTP>
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
      <Button type="submit" size="lg" disabled={loading} className="w-full">
        {loading && <Loader2 className="size-4 animate-spin" />}
        {submitLabel}
      </Button>
      <Button type="button" variant="ghost" onClick={handleResend} disabled={loading || !canResend}>
        {canResend ? t('resendCode') : t('resendCodeIn', { seconds: countdown })}
      </Button>
    </form>
  )
}
