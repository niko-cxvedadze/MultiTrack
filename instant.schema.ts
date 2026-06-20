// Docs: https://www.instantdb.com/docs/modeling-data
import { i } from '@instantdb/react'

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string()
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      phoneNumber: i.string().unique().indexed().optional(),
      fullName: i.string().optional(),
      type: i.string().indexed().optional(), // system field
      newsletterSubscribed: i.boolean().indexed().optional()
    }),
    otpCodes: i.entity({
      attempts: i.number(),
      code: i.string(),
      expiresAt: i.number().indexed(),
      identifier: i.string().unique().indexed(),
      // Purpose of the OTP: "login" or "register"
      purpose: i.string().indexed()
    })
  },
  links: {
    // Guest users linked to a primary authenticated user account
    // user.linkedPrimaryUser → the main account | user.linkedGuestUsers → guest sessions
    $usersLinkedPrimaryUser: {
      forward: {
        on: '$users',
        has: 'one',
        label: 'linkedPrimaryUser',
        onDelete: 'cascade'
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'linkedGuestUsers'
      }
    }
  },
  rooms: {}
})

// This helps TypeScript display nicer intellisense
type _AppSchema = typeof _schema
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema

export type { AppSchema }
export default schema
