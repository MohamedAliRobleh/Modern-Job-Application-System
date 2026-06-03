// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { EventEmitter } from 'events'

const mockPut = vi.fn()
vi.mock('@vercel/blob', () => ({ put: mockPut }))

const mockBusboyInstance = new EventEmitter()
mockBusboyInstance.end = vi.fn()

vi.mock('busboy', () => ({
  default: vi.fn(() => mockBusboyInstance),
}))

const { default: handler } = await import('../upload.js')

function makeRes() {
  return { status: vi.fn().mockReturnThis(), json: vi.fn(), end: vi.fn(), writableEnded: false }
}

describe('POST /api/upload', () => {
  beforeEach(() => {
    process.env.BLOB_READ_WRITE_TOKEN = 'test-token'
    mockPut.mockReset()
    mockBusboyInstance.removeAllListeners()
  })

  it('returns 405 for non-POST methods', async () => {
    const req = { method: 'GET' }
    const res = makeRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(405)
  })

  it('returns 400 when no file is provided', async () => {
    const req = { method: 'POST', headers: { 'content-type': 'multipart/form-data; boundary=xyz' }, pipe: vi.fn(bb => { bb.emit('finish') }) }
    const res = makeRes()
    const done = handler(req, res)
    await done
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'No file provided' })
  })

  it('returns 400 for disallowed MIME type', async () => {
    const req = {
      method: 'POST',
      headers: { 'content-type': 'multipart/form-data; boundary=xyz' },
      pipe: vi.fn(bb => {
        const stream = new EventEmitter()
        stream.resume = vi.fn()
        bb.emit('file', 'file', stream, { filename: 'test.exe', mimeType: 'application/x-executable' })
        bb.emit('finish')
      }),
    }
    const res = makeRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Only PDF, DOC, and DOCX files are allowed' })
  })
})
