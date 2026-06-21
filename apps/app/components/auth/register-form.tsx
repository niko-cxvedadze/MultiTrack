'use client'

import { useState } from 'react'

import { useTranslations } from 'next-intl'

import { zodResolver } from '@hookform/resolvers/zod'
import type { RegisterFormValues } from '@repo/types'
import { OtpPurpose, RegisterFormSchema, getApiErrorMessage } from '@repo/types'
import { Loader2, Mail, Phone, User } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'

import { OtpVerificationForm } from '@/components/auth/otp-verification-form'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText
} from '@/components/ui/input-group'

import { checkExists, registerUser, sendPhoneCode } from '@/data/client/mutations/auth'

enum Step {
  Info = 'info',
  Code = 'code'
}

export function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const t = useTranslations('auth')
  const [step, setStep] = useState(Step.Info)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(true)

  const infoForm = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      termsAccepted: undefined as unknown as true
    }
  })

  async function handleSendCode(data: RegisterFormValues) {
    setServerError('')
    setLoading(true)
    try {
      // Check if phone or email already registered before sending OTP
      const exists = await checkExists(data.phoneNumber, data.email)
      if (exists.phoneExists) {
        setServerError(t('phoneAlreadyRegistered'))
        setLoading(false)
        return
      }
      if (exists.emailExists) {
        setServerError(t('emailAlreadyRegistered'))
        setLoading(false)
        return
      }

      await sendPhoneCode(data.phoneNumber, OtpPurpose.Register)
      setPhoneNumber(data.phoneNumber)
      setEmail(data.email)
      setFirstName(data.firstName)
      setLastName(data.lastName)
      setStep(Step.Code)
    } catch (err) {
      setServerError(getApiErrorMessage(err, t('sendCodeFailed'), t))
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(code: string) {
    setServerError('')
    setLoading(true)
    try {
      await registerUser(phoneNumber, code, email, firstName, lastName, newsletterSubscribed)
      onSuccess()
    } catch (err) {
      setServerError(getApiErrorMessage(err, t('registerFailed'), t))
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setServerError('')
    setLoading(true)
    try {
      await sendPhoneCode(phoneNumber, OtpPurpose.Register)
    } catch (err) {
      setServerError(getApiErrorMessage(err, t('sendCodeFailed'), t))
    } finally {
      setLoading(false)
    }
  }

  if (step === Step.Info) {
    return (
      <form
        key="info"
        onSubmit={infoForm.handleSubmit(handleSendCode)}
        className="flex flex-col gap-3"
      >
        <div className="flex gap-3">
          <Controller
            name="firstName"
            control={infoForm.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined} className="flex-1">
                <FieldLabel className="text-sm">{t('firstName')}</FieldLabel>
                <InputGroup className="h-10">
                  <InputGroupAddon align="inline-start">
                    <InputGroupText>
                      <User className="size-4" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    type="text"
                    placeholder={t('firstNamePlaceholder')}
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                </InputGroup>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Controller
            name="lastName"
            control={infoForm.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined} className="flex-1">
                <FieldLabel className="text-sm">{t('lastName')}</FieldLabel>
                <InputGroup className="h-10">
                  <InputGroupInput
                    type="text"
                    placeholder={t('lastNamePlaceholder')}
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                </InputGroup>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </div>
        <Controller
          name="phoneNumber"
          control={infoForm.control}
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
        <Controller
          name="email"
          control={infoForm.control}
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
        {/* Newsletter opt-in */}
        <div className="flex items-start gap-3 border border-border p-3">
          <div className="flex-1">
            <p className="text-xs leading-relaxed">
              {t('newsletterPrompt')}{' '}
              <a href="/privacy#directMarketing" target="_blank" className="font-bold underline">
                {t('newsletterLearnMore')}
              </a>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 pt-0.5">
            <Button
              type="button"
              variant={newsletterSubscribed ? 'default' : 'outline'}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => setNewsletterSubscribed(true)}
            >
              {t('yes')}
            </Button>
            <Button
              type="button"
              variant={!newsletterSubscribed ? 'default' : 'outline'}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => setNewsletterSubscribed(false)}
            >
              {t('no')}
            </Button>
          </div>
        </div>

        {/* Terms & Conditions agreement */}
        <Controller
          name="termsAccepted"
          control={infoForm.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <div className="flex items-start gap-2.5">
                <Checkbox
                  id="termsAccepted"
                  checked={field.value === true}
                  onCheckedChange={(checked) => field.onChange(checked === true ? true : undefined)}
                  className="mt-0.5"
                />
                <label htmlFor="termsAccepted" className="cursor-pointer text-xs leading-relaxed">
                  {t('termsAgreement')}{' '}
                  <a href="/terms" target="_blank" className="font-bold underline">
                    {t('termsLink')}
                  </a>{' '}
                  {t('termsAnd')}{' '}
                  <a href="/privacy" target="_blank" className="font-bold underline">
                    {t('privacyLink')}
                  </a>
                </label>
              </div>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        {serverError && <p className="text-sm text-destructive">{serverError}</p>}
        <Button type="submit" size="lg" disabled={loading} className="mt-1 w-full">
          {loading && <Loader2 className="size-4 animate-spin" />}
          {t('sendCode')}
        </Button>
      </form>
    )
  }

  return (
    <OtpVerificationForm
      onVerify={handleRegister}
      onResend={handleResend}
      message={t('codeSent')}
      submitLabel={t('register')}
      loading={loading}
      serverError={serverError}
    />
  )
}
