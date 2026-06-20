import type { AppEvent } from '@repo/types'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'

import { userAuth } from '@/common/middleware/userAuth'
import type { AppEnv, Env } from '@/env'
import { handleEvent } from '@/queue/handler'
import { auth } from '@/routes/auth'
import { me } from '@/routes/me'

const app = new Hono<AppEnv>()

// Security headers
app.use(
  '*',
  secureHeaders({
    strictTransportSecurity: 'max-age=31536000; includeSubDomains; preload',
    xFrameOptions: 'DENY',
    xContentTypeOptions: 'nosniff',
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: {
      camera: [],
      microphone: [],
      geolocation: []
    }
  })
)

// CORS
app.use('*', async (c, next) => {
  const origins = c.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  const middleware = cors({ origin: origins, credentials: true })
  return middleware(c, next)
})

// Health check
app.get('/health', (c) => c.json({ status: 'ok', version: '1.0.2', timestamp: Date.now() }))

// Public routes
app.route('/auth', auth)

// User-authenticated routes (InstantDB token) — single middleware for all
const userProtected = new Hono<AppEnv>()
userProtected.use('/me/*', userAuth)
userProtected.route('/me', me)
app.route('/', userProtected)

// 404
app.notFound((c) => c.json({ error: 'Not Found' }, 404))

// Global error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err.message, err.stack)
  return c.json({ error: 'Internal Server Error' }, 500)
})

export default {
  fetch: app.fetch,

  async queue(batch: MessageBatch<AppEvent>, env: Env): Promise<void> {
    for (const msg of batch.messages) {
      try {
        await handleEvent(msg.body, env)
        msg.ack()
      } catch (err) {
        console.error(`Failed to handle event ${msg.body.type}:`, err)
        msg.retry()
      }
    }
  }
}
