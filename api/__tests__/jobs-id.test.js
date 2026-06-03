// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mockQuery = vi.fn()
vi.mock('@neondatabase/serverless', () => ({ neon: vi.fn(() => mockQuery) }))

const { default: handler } = await import('../jobs/[id].js')

describe('GET /api/jobs/:id', () => {
  beforeEach(() => {
    process.env.DATABASE_URL = 'postgresql://test'
    mockQuery.mockReset()
  })

  it('returns a single job by id', async () => {
    const fakeJob = { id: 'uuid-1', title: 'Engineer' }
    mockQuery.mockResolvedValue([fakeJob])

    const req = { method: 'GET', query: { id: 'uuid-1' } }
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() }

    await handler(req, res)

    expect(res.json).toHaveBeenCalledWith(fakeJob)
  })

  it('returns 404 when job not found', async () => {
    mockQuery.mockResolvedValue([])

    const req = { method: 'GET', query: { id: 'nonexistent' } }
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() }

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
  })
})
