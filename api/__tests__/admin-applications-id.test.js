// api/__tests__/admin-applications-id.test.js
// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mockQuery = vi.fn()
vi.mock('@neondatabase/serverless', () => ({ neon: vi.fn(() => mockQuery) }))

const mockVerifyToken = vi.fn()
vi.mock('@clerk/backend', () => ({
  createClerkClient: vi.fn(() => ({ verifyToken: mockVerifyToken })),
}))

const { default: handler } = await import('../admin/applications/[id].js')

describe('/api/admin/applications/:id', () => {
  beforeEach(() => {
    process.env.DATABASE_URL = 'postgresql://test'
    process.env.CLERK_SECRET_KEY = 'sk_test'
    mockQuery.mockReset()
    mockVerifyToken.mockReset()
  })

  it('returns 401 when not authenticated', async () => {
    const req = { method: 'PATCH', headers: {}, query: { id: 'app-1' }, body: { status: 'Interview' } }
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn(), end: vi.fn() }
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('updates status via PATCH', async () => {
    mockVerifyToken.mockResolvedValue({ sub: 'user_123' })
    mockQuery.mockResolvedValue([{ id: 'app-1', status: 'Interview' }])

    const req = { method: 'PATCH', headers: { authorization: 'Bearer valid-token' }, query: { id: 'app-1' }, body: { status: 'Interview' } }
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn(), end: vi.fn() }
    await handler(req, res)

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'Interview' }))
  })

  it('deletes via DELETE and returns 204', async () => {
    mockVerifyToken.mockResolvedValue({ sub: 'user_123' })
    mockQuery.mockResolvedValue([])

    const req = { method: 'DELETE', headers: { authorization: 'Bearer valid-token' }, query: { id: 'app-1' }, body: {} }
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn(), end: vi.fn() }
    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(204)
  })
})
