import { clerkMiddleware, getAuth } from '@clerk/express'
import express, { type NextFunction, type Request, type Response } from 'express'

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

  app.use(express.json())
  app.use(clerkMiddleware())

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  // Example protected route. Real application services (e.g. the
  // splash-image endpoints described in docs/OVERVIEW.md) build on
  // this pattern: wrap the route in requireAuth and read the verified
  // identity via getAuth(req).
  app.get('/api/me', requireAuth, (req, res) => {
    const { userId } = getAuth(req)
    res.json({ userId })
  })

  return app
}
