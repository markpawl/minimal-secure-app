import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from './app.js'

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
})
