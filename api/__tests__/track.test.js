// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mockQuery = vi.fn()
vi.mock('@neondatabase/serverless', () => ({ neon: vi.fn(() => mockQuery) }))

const { default: handler } = await import('../track/[token].js')

describe('GET /api/track/:token', () => {
  beforeEach(() => {
    process.env.DATABASE_URL = 'postgresql://test'
    mockQuery.mockReset()
  })

  it('returns 405 for non-GET methods', async () => {
    const req = { method: 'POST', query: { token: 'abc' } }
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() }
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(405)
  })

  it('returns application status for valid token', async () => {
    mockQuery.mockResolvedValue([{
      status: 'Interview', job_title: 'Engineer',
      full_name: 'Jane Doe', created_at: '2026-06-04T00:00:00Z',
    }])
    const req = { method: 'GET', query: { token: 'valid-uuid' } }
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() }
    await handler(req, res)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'Interview', full_name: 'Jane Doe' }))
  })

  it('returns 404 for unknown token', async () => {
    mockQuery.mockResolvedValue([])
    const req = { method: 'GET', query: { token: 'bad-uuid' } }
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() }
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(404)
  })
})
