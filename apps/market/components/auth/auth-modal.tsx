'use client'

import { useState } from 'react'

import { useTranslations } from 'next-intl'

import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'

import { EmailLoginForm } from './email-login-form'
import { PhoneLoginForm } from './phone-login-form'
import { RegisterForm } from './register-form'

enum AuthView {
  Login = 'login',
  Register = 'register'
}

enum LoginMethod {
  Phone = 'phone',
  Email = 'email'
}

export function AuthModal({
  open,
  onOpenChange
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useTranslations('auth')
  const [view, setView] = useState(AuthView.Login)
  const [loginMethod, setLoginMethod] = useState(LoginMethod.Phone)

  function handleSuccess() {
    toast.success(view === AuthView.Login ? t('loginSuccess') : t('registerSuccess'))
    onOpenChange(false)
    setView(AuthView.Login)
    setLoginMethod(LoginMethod.Phone)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] gap-5 overflow-y-auto p-5 sm:max-w-sm sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base">
            {view === AuthView.Login ? t('login') : t('register')}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {view === AuthView.Login ? t('loginDescription') : t('registerDescription')}
          </DialogDescription>
        </DialogHeader>

        {view === AuthView.Login && (
          <>
            <div className="flex gap-1.5">
              <Button
                variant={loginMethod === LoginMethod.Phone ? 'default' : 'outline'}
                onClick={() => setLoginMethod(LoginMethod.Phone)}
                className="flex-1"
              >
                {t('loginWithPhone')}
              </Button>
              <Button
                variant={loginMethod === LoginMethod.Email ? 'default' : 'outline'}
                onClick={() => setLoginMethod(LoginMethod.Email)}
                className="flex-1"
              >
                {t('loginWithEmail')}
              </Button>
            </div>

            {loginMethod === LoginMethod.Phone ? (
              <PhoneLoginForm onSuccess={handleSuccess} />
            ) : (
              <EmailLoginForm onSuccess={handleSuccess} />
            )}
          </>
        )}

        {view === AuthView.Register && <RegisterForm onSuccess={handleSuccess} />}

        <Separator />

        <p className="text-center text-sm text-muted-foreground">
          {view === AuthView.Login ? t('noAccount') : t('haveAccount')}{' '}
          <button
            type="button"
            className="font-medium text-foreground underline underline-offset-2"
            onClick={() => setView(view === AuthView.Login ? AuthView.Register : AuthView.Login)}
          >
            {view === AuthView.Login ? t('register') : t('login')}
          </button>
        </p>
      </DialogContent>
    </Dialog>
  )
}
