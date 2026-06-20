import type { OtpPurpose } from '@repo/types'

import { api } from '../axios'
import { db } from '../db'

export async function checkExists(phoneNumber?: string, email?: string) {
  const { data } = await api.post('/auth/check-exists', { phoneNumber, email })
  return data.responseObject as { phoneExists: boolean; emailExists: boolean }
}

export async function sendPhoneCode(phoneNumber: string, purpose: OtpPurpose) {
  const { data } = await api.post('/auth/send-code', { phoneNumber, purpose })
  return data
}

export async function verifyPhoneCode(phoneNumber: string, code: string) {
  const { data } = await api.post('/auth/verify-code', { phoneNumber, code })
  await db.auth.signInWithToken(data.responseObject.token)
  return data
}

export async function sendEmailCode(email: string) {
  const { data } = await api.post('/auth/send-email-code', { email })
  return data
}

export async function verifyEmailCode(email: string, code: string) {
  const { data } = await api.post('/auth/verify-email-code', { email, code })
  await db.auth.signInWithToken(data.responseObject.token)
  return data
}

export async function registerUser(
  phoneNumber: string,
  code: string,
  email: string,
  firstName: string,
  lastName: string,
  newsletterSubscribed?: boolean
) {
  const { data } = await api.post('/auth/register', { phoneNumber, code, email, firstName, lastName, newsletterSubscribed })
  await db.auth.signInWithToken(data.responseObject.token)
  return data
}

export async function signOut() {
  db.auth.signOut()
}
