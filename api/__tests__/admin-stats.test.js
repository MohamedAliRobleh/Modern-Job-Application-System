// api/__tests__/admin-stats.test.js
// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mockQuery = vi.fn()
vi.mock('@neondatabase/serverless', () => ({ neon: vi.fn(() => mockQuery) }))

const mockVerifyToken = vi.fn()
vi.mock('@clerk/backend', () => ({
  createClerkClient: vi.fn(() => ({ verifyToken: mockVerifyToken })),
}))

const { default: handler } = await import('../admin/stats.js')

describe('GET /api/admin/stats', () => {
  beforeEach(() => {
    process.env.DATABASE_URL = 'postgresql://test'
    process.env.CLERK_SECRET_KEY = 'sk_test'
    mockQuery.mockReset()
    mockVerifyToken.mockReset()
  })

  it('returns 401 when not authenticated', async () => {
    const req = { method: 'GET', headers: {} }
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() }
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('returns stats for authenticated admin', async () => {
    mockVerifyToken.mockResolvedValue({ sub: 'user_123' })
    mockQuery.mockResolvedValue([{ total: '10', new_count: '3', interview_count: '2', this_week: '4' }])

    const req = { method: 'GET', headers: { authorization: 'Bearer valid-token' } }
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() }
    await handler(req, res)

    expect(res.json).toHaveBeenCalledWith({ total: '10', new_count: '3', interview_count: '2', this_week: '4' })
  })
})
