'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Phone } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import type { PhoneFormValues } from '@repo/types'
import { getApiErrorMessage, OtpPurpose, PhoneFormSchema } from '@repo/types'

import { sendPhoneCode, verifyPhoneCode } from '@/data/client/mutations/auth'
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
  Phone = 'phone',
  Code = 'code'
}

export function PhoneLoginForm({ onSuccess }: { onSuccess: () => void }) {
  const t = useTranslations('auth')
  const [step, setStep] = useState(Step.Phone)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(PhoneFormSchema),
    defaultValues: { phoneNumber: '' }
  })

  async function handleSendCode(data: PhoneFormValues) {
    setServerError('')
    setLoading(true)
    try {
      await sendPhoneCode(data.phoneNumber, OtpPurpose.Login)
      setPhoneNumber(data.phoneNumber)
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
      await verifyPhoneCode(phoneNumber, code)
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
      await sendPhoneCode(phoneNumber, OtpPurpose.Login)
    } catch (err) {
      setServerError(getApiErrorMessage(err, t('sendCodeFailed'), t))
    } finally {
      setLoading(false)
    }
  }

  if (step === Step.Phone) {
    return (
      <form onSubmit={phoneForm.handleSubmit(handleSendCode)} className="flex flex-col gap-4">
        <Controller
          name="phoneNumber"
          control={phoneForm.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel className="text-sm">{t('phoneNumber')}</FieldLabel>
              <InputGroup className="h-10">
                <InputGroupAddon align="inline-start">
                  <InputGroupText>
                    <Phone className="size-4" />
                    <span>+995</span>
                  </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  type="tel"
                  placeholder="5XX XXX XXX"
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
      message={t('codeSent')}
      submitLabel={t('verify')}
      loading={loading}
      serverError={serverError}
    />
  )
}
