// Docs: https://www.instantdb.com/docs/permissions
import type { InstantRules } from '@instantdb/react'

const rules = {
  attrs: {
    allow: {
      $default: 'false'
    }
  },
  $users: {
    allow: {
      view: 'auth.id == data.id',
      create: 'false',
      update: 'false',
      delete: 'false'
    }
  },
  $files: {
    allow: {
      view: 'false',
      create: 'false',
      update: 'false',
      delete: 'false'
    }
  },
  otpCodes: {
    allow: {
      $default: 'false'
    }
  }
} satisfies InstantRules

export default rules
