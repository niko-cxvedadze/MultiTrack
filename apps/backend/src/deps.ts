import { AuthService } from '@/api/auth/authService'
import { ProfileService } from '@/api/profile/profileService'
import { createAdminDb } from '@/common/lib/adminDb'
import { OTPService } from '@/common/services/otpService'
import { SMSService } from '@/common/services/smsService'
import { UploadService } from '@/common/services/uploadService'
import type { Env } from '@/env'
import { OTPStore } from '@/stores/otpStore'
import { UserStore } from '@/stores/userStore'

export function createDeps(env: Env, existingAdminDb?: ReturnType<typeof createAdminDb>) {
  const adminDb = existingAdminDb ?? createAdminDb(env)

  // Stores
  const otpStore = new OTPStore(adminDb)
  const userStore = new UserStore(adminDb)

  // Services
  const uploadService = new UploadService(env)
  const smsService = new SMSService(env.SMS_API_KEY)
  const otpService = new OTPService(otpStore)
  const authService = new AuthService(userStore, otpService, smsService, adminDb)
  const profileService = new ProfileService(adminDb)

  return {
    adminDb,
    authService,
    uploadService,
    smsService,
    otpService,
    userStore,
    profileService
  }
}
