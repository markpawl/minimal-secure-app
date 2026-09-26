import type { NextFunction, Request, Response } from 'express'
import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import { createApp } from './app.js'

const TEST_USER_ID = 'user_test123'

// Real Clerk verification needs a network call to a real project; these
// tests only need to exercise this server's own route logic, so
// clerkMiddleware is replaced with a stand-in that treats a test header as
// the "verified" identity — auth success/failure is Clerk's own concern,
// already covered by Clerk itself.
vi.mock('@clerk/express', () => ({
  clerkMiddleware:
    () => (req: Request & { auth?: () => { userId: string | null } }, _res: Response, next: NextFunction) => {
      req.auth = () => ({
        userId: req.headers['x-test-auth'] === 'valid' ? TEST_USER_ID : null,
      })
      next()
    },
  getAuth: (req: Request & { auth: () => { userId: string | null } }) => req.auth(),
}))

describe('GET /health', () => {
  it('returns ok', async () => {
    const res = await request(createApp()).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })
})

describe('GET /api/me', () => {
  it('requires authentication', async () => {
    const res = await request(createApp()).get('/api/me')
    expect(res.status).toBe(401)
  })

  it('returns the authenticated user id', async () => {
    const res = await request(createApp()).get('/api/me').set('x-test-auth', 'valid')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ userId: TEST_USER_ID })
  })
})

describe('GET /api/splash-images', () => {
  it('requires authentication', async () => {
    const res = await request(createApp()).get('/api/splash-images')
    expect(res.status).toBe(401)
  })

  it('lists available splash images', async () => {
    const res = await request(createApp())
      .get('/api/splash-images')
      .set('x-test-auth', 'valid')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([{ id: 'sun', name: 'Sun' }])
  })
})

describe('GET /api/splash-images/:id', () => {
  it('requires authentication', async () => {
    const res = await request(createApp()).get('/api/splash-images/sun')
    expect(res.status).toBe(401)
  })

  it('returns the image for a known id', async () => {
    const res = await request(createApp())
      .get('/api/splash-images/sun')
      .set('x-test-auth', 'valid')
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toMatch(/^image\/svg\+xml/)
    expect(Buffer.from(res.body).toString('utf8')).toContain('<svg')
  })

  it('returns 404 for an unknown id', async () => {
    const res = await request(createApp())
      .get('/api/splash-images/does-not-exist')
      .set('x-test-auth', 'valid')
    expect(res.status).toBe(404)
  })
})
