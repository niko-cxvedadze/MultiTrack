/* eslint-disable @typescript-eslint/ban-types */
import type { InstaQLEntity } from '@instantdb/react'

import type { AppSchema } from '../../../instant.schema'

export type User = InstaQLEntity<AppSchema, '$users'>
export type File = InstaQLEntity<AppSchema, '$files'>
export type OTPCode = InstaQLEntity<AppSchema, 'otpCodes'>
