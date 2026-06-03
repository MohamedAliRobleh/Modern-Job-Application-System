// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mockPut = vi.fn()
vi.mock('@vercel/blob', () => ({ put: mockPut }))

vi.mock('busboy', () => {
  const { EventEmitter } = require('events')
  return {
    default: vi.fn(() => {
      const bb = new EventEmitter()
      bb.end = vi.fn()
      return bb
    }),
  }
})

const { default: handler } = await import('../upload.js')

describe('POST /api/upload', () => {
  beforeEach(() => {
    process.env.BLOB_READ_WRITE_TOKEN = 'test-token'
    mockPut.mockReset()
  })

  it('returns 405 for non-POST methods', async () => {
    const req = { method: 'GET' }
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn(), end: vi.fn() }
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(405)
  })
})
