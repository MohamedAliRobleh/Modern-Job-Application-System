// api/__tests__/admin-applications.test.js
// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mockQuery = vi.fn()
vi.mock('@neondatabase/serverless', () => ({ neon: vi.fn(() => mockQuery) }))

const mockVerifyToken = vi.fn()
vi.mock('@clerk/backend', () => ({
  createClerkClient: vi.fn(() => ({ verifyToken: mockVerifyToken })),
}))

const { default: handler } = await import('../admin/applications/index.js')

describe('GET /api/admin/applications', () => {
  beforeEach(() => {
    process.env.DATABASE_URL = 'postgresql://test'
    process.env.CLERK_SECRET_KEY = 'sk_test'
    mockQuery.mockReset()
    mockVerifyToken.mockReset()
  })

  it('returns 401 when no auth header', async () => {
    const req = { method: 'GET', headers: {}, query: {} }
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() }
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('returns paginated applications for authenticated admin', async () => {
    mockVerifyToken.mockResolvedValue({ sub: 'user_123' })
    mockQuery
      .mockResolvedValueOnce([{ count: '2' }])
      .mockResolvedValueOnce([
        { id: 'app-1', full_name: 'Jane Doe', status: 'New' },
        { id: 'app-2', full_name: 'John Smith', status: 'Reviewing' },
      ])

    const req = { method: 'GET', headers: { authorization: 'Bearer valid-token' }, query: { page: '1', limit: '20' } }
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() }
    await handler(req, res)

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.arrayContaining([expect.objectContaining({ full_name: 'Jane Doe' })]),
      total: 2,
      page: 1,
      totalPages: 1,
    }))
  })
})
