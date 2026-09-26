import { clerkMiddleware, getAuth } from '@clerk/express'
import cors from 'cors'
import express, { type NextFunction, type Request, type Response } from 'express'
import { findSplashImage, splashImagePath, splashImages } from './splashImages.js'

// @clerk/express's requireAuth() redirects unauthenticated requests to a
// sign-in page, which fits browser apps but not a JSON API. This server
// is API-only, so unauthenticated requests should get a 401 instead
// (see docs/OVERVIEW.md, sequence 6).
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const { userId } = getAuth(req)
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  next()
}

export function createApp() {
  const app = express()

  // webapp-client (a browser app on its own origin) calls this API directly
  // with a JWT in the Authorization header — no cookies involved, so no
  // `credentials: true` needed here.
  const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173').split(',')
  app.use(cors({ origin: allowedOrigins }))

  app.use(express.json())
  app.use(clerkMiddleware())

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  // Example protected route showing the requireAuth + getAuth pattern
  // that the splash-image routes below also use.
  app.get('/api/me', requireAuth, (req, res) => {
    const { userId } = getAuth(req)
    res.json({ userId })
  })

  // Simulates an application service (docs/OVERVIEW.md, sequences 5-6):
  // list available splash images, then fetch one by id.
  app.get('/api/splash-images', requireAuth, (_req, res) => {
    res.json(splashImages.map(({ id, name }) => ({ id, name })))
  })

  app.get('/api/splash-images/:id', requireAuth, (req, res) => {
    const image = findSplashImage(req.params.id as string)
    if (!image) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    res.type(image.contentType).sendFile(splashImagePath(image))
  })

  return app
}
