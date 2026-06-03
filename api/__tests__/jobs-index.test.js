// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mockQuery = vi.fn()
vi.mock('@neondatabase/serverless', () => ({ neon: vi.fn(() => mockQuery) }))

const { default: handler } = await import('../jobs/index.js')

describe('GET /api/jobs', () => {
  beforeEach(() => {
    process.env.DATABASE_URL = 'postgresql://test'
    mockQuery.mockReset()
  })

  it('returns active jobs as JSON', async () => {
    const fakeJobs = [{ id: 'uuid-1', title: 'Engineer', department: 'Eng', location: 'Remote', type: 'Full-time' }]
    mockQuery.mockResolvedValue(fakeJobs)

    const req = { method: 'GET' }
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() }

    await handler(req, res)

    expect(res.json).toHaveBeenCalledWith(fakeJobs)
  })

  it('returns 405 for non-GET methods', async () => {
    const req = { method: 'POST' }
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() }

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(405)
  })
})
