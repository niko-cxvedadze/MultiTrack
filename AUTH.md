# Authentication Architecture

## Overview

Auth is handled through a **custom backend** — never directly via InstantDB client SDK auth methods. This prevents InstantDB from auto-creating `$user` records. All auth flows go through `apps/backend/src/api/auth/` and return a token that the client uses with `db.auth.signInWithToken(token)`.

## Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/auth/check-exists` | POST | Check if phone/email is already registered |
| `/auth/send-code` | POST | Send SMS OTP (requires `purpose`: `login` or `register`) |
| `/auth/verify-code` | POST | Verify phone OTP and get auth token (login only) |
| `/auth/register` | POST | Verify phone OTP + create user with phone & email |
| `/auth/send-email-code` | POST | Send email magic code via InstantDB admin SDK (login only) |
| `/auth/verify-email-code` | POST | Verify email magic code and get auth token (login only) |

## Key Rules

1. **Login NEVER creates users.** Both `verifyCodeAndSignIn` (phone) and `verifyEmailCodeAndSignIn` (email) check that the user exists first. If not, they return a 404 error.

2. **OTPs have a `purpose` field** (`login` or `register`). The `send-code` endpoint validates user existence based on purpose:
   - `login` → user must exist, otherwise 404
   - `register` → user must NOT exist, otherwise 409

3. **Email login uses InstantDB admin SDK** (`adminDb.auth.sendMagicCode` / `adminDb.auth.verifyMagicCode`) called from the backend — never from the client. This ensures the backend checks user existence before sending any code.

4. **Phone login uses custom OTP** stored in the `otpCodes` entity (via `otpStore` + `otpService`), sent via SMS through sender.ge (`smsService`).

5. **Registration is phone-only.** Users must register with phone + email through the `/auth/register` endpoint. Email-only registration is not supported.

## OTP Storage (`otpCodes` entity)

| Field | Type | Description |
|---|---|---|
| `identifier` | string (unique, indexed) | Phone number or email |
| `code` | string | 6-digit OTP code |
| `purpose` | string (indexed) | `login` or `register` |
| `expiresAt` | number (indexed) | Expiry timestamp (5 min TTL) |
| `attempts` | number | Failed attempt count (max 3) |

## Frontend Auth Flow

All auth mutations live in `apps/market/api/client/mutations/auth.ts`. The client **never** calls `db.auth.sendMagicCode()` or `db.auth.signInWithMagicCode()` directly. Instead:

```
sendPhoneCode(phone, purpose)    → POST /auth/send-code
verifyPhoneCode(phone, code)     → POST /auth/verify-code     → db.auth.signInWithToken(token)
sendEmailCode(email)             → POST /auth/send-email-code
verifyEmailCode(email, code)     → POST /auth/verify-email-code → db.auth.signInWithToken(token)
registerUser(phone, code, email) → POST /auth/register          → db.auth.signInWithToken(token)
```

## Error Handling

All auth forms use `getApiErrorMessage(err, fallback)` from `@repo/types` to extract the server's error message from Axios errors (e.g., "No account found with this phone number. Please register first.") instead of showing generic "Request failed with status code 400".

## File Map

- **Backend service**: `apps/backend/src/api/auth/authService.ts`
- **Backend controller**: `apps/backend/src/api/auth/authController.ts`
- **Backend routes**: `apps/backend/src/api/auth/authRouter.ts`
- **OTP store**: `apps/backend/src/stores/otpStore.ts`
- **OTP service**: `apps/backend/src/common/services/otpService.ts`
- **SMS service**: `apps/backend/src/common/services/smsService.ts`
- **Frontend mutations**: `apps/market/api/client/mutations/auth.ts`
- **Phone login form**: `apps/market/components/auth/phone-login-form.tsx`
- **Email login form**: `apps/market/components/auth/email-login-form.tsx`
- **Register form**: `apps/market/components/auth/register-form.tsx`
- **Auth modal**: `apps/market/components/auth/auth-modal.tsx`
- **Validators**: `packages/types/src/validators/auth.ts`
- **OtpPurpose enum**: `packages/types/src/constants/index.ts`
- **Error helper**: `packages/types/src/utils/error.ts`
