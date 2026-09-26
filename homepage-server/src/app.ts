import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function createApp() {
  const app = express()

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  // Exposes only the publishable key (safe for the browser) so the
  // static page's Clerk JS can initialize sign-up/sign-in. The secret
  // key is never sent to the client.
  app.get('/config.json', (_req, res) => {
    res.json({ clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY ?? '' })
  })

  app.use(express.static(path.join(__dirname, '..', 'public')))

  return app
}
