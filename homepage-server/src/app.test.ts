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

describe('GET /', () => {
  it('serves the static homepage', async () => {
    const res = await request(createApp()).get('/')
    expect(res.status).toBe(200)
    expect(res.text).toContain('Register')
  })
})
