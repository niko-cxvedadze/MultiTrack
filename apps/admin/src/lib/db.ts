import { init, id } from '@instantdb/react'
import schema, { type AppSchema } from '../../../../instant.schema'

const appId = import.meta.env.VITE_INSTANT_APP_ID

if (!appId) {
  throw new Error('VITE_INSTANT_APP_ID environment variable is not set')
}

export const db = init<AppSchema>({ appId, schema })

export { id }
