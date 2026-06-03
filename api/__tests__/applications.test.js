// api/__tests__/applications.test.js
// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mockQuery = vi.fn()
vi.mock('@neondatabase/serverless', () => ({ neon: vi.fn(() => mockQuery) }))

const mockSendEmail = vi.fn()
vi.mock('@getbrevo/brevo', () => ({
  TransactionalEmailsApi: vi.fn(() => ({ sendTransacEmail: mockSendEmail })),
  SendSmtpEmail: vi.fn(function(d) { Object.assign(this, d) }),
  ApiClient: { instance: { authentications: { 'api-key': { apiKey: '' } } } },
}))

const { default: handler } = await import('../applications/index.js')

describe('POST /api/applications', () => {
  beforeEach(() => {
    process.env.DATABASE_URL = 'postgresql://test'
    process.env.BREVO_API_KEY = 'test-key'
    process.env.VITE_HR_EMAIL = 'hr@test.com'
    process.env.VITE_ORG_NAME = 'TestOrg'
    mockQuery.mockReset()
    mockSendEmail.mockReset()
  })

  it('returns 405 for non-POST methods', async () => {
    const req = { method: 'GET' }
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() }
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(405)
  })

  it('inserts application and sends two emails', async () => {
    mockQuery.mockResolvedValue([{ id: 'new-uuid' }])
    mockSendEmail.mockResolvedValue({})

    const req = {
      method: 'POST',
      body: {
        job_id: 'job-uuid', job_title: 'Software Engineer',
        full_name: 'Jane Doe', email: 'jane@example.com',
        phone: '613-555-0100', years_experience: '3-5 years',
        availability: 'Immediately', resume_url: 'https://blob.test/resume.pdf',
      },
    }
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() }

    await handler(req, res)

    expect(res.json).toHaveBeenCalledWith({ id: 'new-uuid' })
    expect(mockSendEmail).toHaveBeenCalledTimes(2)
  })

  it('returns 400 when required fields are missing', async () => {
    const req = { method: 'POST', body: { full_name: 'Jane' } }
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() }
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })
})
