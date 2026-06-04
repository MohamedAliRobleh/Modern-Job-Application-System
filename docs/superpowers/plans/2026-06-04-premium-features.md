# Premium Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add four premium features — multi-step wizard form, application status tracking (no account needed), automatic status-change emails to applicants, and a company culture section on the home page.

**Architecture:** DB gets a `tracking_token` UUID column on `applications`. A new public API `GET /api/track/[token]` returns safe status info. The admin PATCH endpoint gains Brevo email sending when status changes. The Apply page replaces the single-page form with a 3-step wizard. The Home page gains a `CultureSection` component above Open Positions.

**Tech Stack:** React 18 + React Hook Form (`trigger()` for per-step validation), Framer Motion (step slide), Bootstrap 5.3, Neon Postgres, Brevo email, Vitest + RTL.

---

## File Map

**Create:**
- `scripts/db-migrate.js` — one-time migration: add tracking_token column
- `api/track/[token].js` — public GET: return status for a tracking token
- `api/__tests__/track.test.js` — node-env test for track endpoint
- `src/pages/TrackApplication.jsx` — public status-tracking page
- `src/pages/__tests__/TrackApplication.test.jsx` — RTL test
- `src/components/StepIndicator.jsx` — numbered-circle step nav
- `src/components/__tests__/StepIndicator.test.jsx` — RTL test
- `src/components/MultiStepForm.jsx` — 3-step wizard (replaces ApplicationForm)
- `src/components/__tests__/MultiStepForm.test.jsx` — RTL test (replaces ApplicationForm.test.jsx)
- `src/lib/culture.js` — static perks + testimonials data
- `src/components/CultureSection.jsx` — culture section UI
- `src/components/__tests__/CultureSection.test.jsx` — RTL test

**Modify:**
- `api/applications/index.js` — RETURNING tracking_token, return it in response, add tracking link to email
- `api/__tests__/applications.test.js` — update mock + assertion for tracking_token
- `api/admin/applications/[id].js` — send Brevo email on status change
- `api/__tests__/admin-applications-id.test.js` — add email-on-status-change test
- `src/lib/api.js` — add `getApplicationStatus(token)` helper
- `src/components/SuccessModal.jsx` — add `trackingToken` prop + tracking link
- `src/components/__tests__/SuccessModal.test.jsx` — add tracking link test
- `src/pages/Apply.jsx` — import MultiStepForm instead of ApplicationForm
- `src/pages/Home.jsx` — add `<CultureSection />` before Open Positions section
- `src/App.jsx` — add `/track/:token` route
- `.env.local` — add APP_URL=http://localhost:5175
- `.env.example` — add APP_URL=https://your-domain.vercel.app

**Delete:**
- `src/components/ApplicationForm.jsx` — fully replaced by MultiStepForm
- `src/components/__tests__/ApplicationForm.test.jsx` — replaced by MultiStepForm.test.jsx

---

## Task 1: DB Migration — Add tracking_token

**Files:**
- Create: `scripts/db-migrate.js`
- Modify: `.env.local`, `.env.example`

- [ ] **Step 1: Create migration script**

```js
// scripts/db-migrate.js
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

async function migrate() {
  console.log('Running migration...')
  await sql`
    ALTER TABLE applications
      ADD COLUMN IF NOT EXISTS tracking_token UUID DEFAULT gen_random_uuid()
  `
  await sql`
    UPDATE applications SET tracking_token = gen_random_uuid() WHERE tracking_token IS NULL
  `
  console.log('✓ tracking_token column added')
}

migrate().catch(err => { console.error(err); process.exit(1) })
```

- [ ] **Step 2: Run the migration**

```bash
DATABASE_URL="<your-neon-url>" node scripts/db-migrate.js
```

Expected output:
```
Running migration...
✓ tracking_token column added
```

- [ ] **Step 3: Add APP_URL to .env.local**

Add this line to `.env.local`:
```
APP_URL=http://localhost:5175
```

Add to `.env.example`:
```
APP_URL=https://your-domain.vercel.app
```

- [ ] **Step 4: Commit**

```bash
git add scripts/db-migrate.js .env.example
git commit -m "feat: add tracking_token column via migration script"
```

---

## Task 2: Track API Endpoint

**Files:**
- Create: `api/track/[token].js`
- Create: `api/__tests__/track.test.js`

- [ ] **Step 1: Write the failing test**

```js
// api/__tests__/track.test.js
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run api/__tests__/track.test.js
```

Expected: FAIL — `Cannot find module '../track/[token].js'`

- [ ] **Step 3: Implement the handler**

Create directory: `api/track/`

```js
// api/track/[token].js
import { neon } from '@neondatabase/serverless'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { token } = req.query
  const sql = neon(process.env.DATABASE_URL)

  try {
    const rows = await sql`
      SELECT status, job_title, full_name, created_at
      FROM applications
      WHERE tracking_token = ${token}
    `
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
    res.json(rows[0])
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run api/__tests__/track.test.js
```

Expected: 3 passed

- [ ] **Step 5: Commit**

```bash
git add api/track/ api/__tests__/track.test.js
git commit -m "feat: add public application tracking API endpoint"
```

---

## Task 3: TrackApplication Page + Route

**Files:**
- Create: `src/pages/TrackApplication.jsx`
- Create: `src/pages/__tests__/TrackApplication.test.jsx`
- Modify: `src/lib/api.js` (add `getApplicationStatus`)
- Modify: `src/App.jsx` (add route)

- [ ] **Step 1: Add API helper**

In `src/lib/api.js`, append:

```js
export async function getApplicationStatus(token) {
  const res = await fetch(`/api/track/${token}`)
  if (!res.ok) throw new Error('Application not found')
  return res.json()
}
```

- [ ] **Step 2: Write the failing test**

```jsx
// src/pages/__tests__/TrackApplication.test.jsx
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'

vi.mock('../../lib/api', () => ({
  getApplicationStatus: vi.fn().mockResolvedValue({
    status: 'Interview',
    job_title: 'Senior Engineer',
    full_name: 'Jane Doe',
    created_at: '2026-06-04T10:00:00Z',
  }),
}))

vi.mock('@clerk/clerk-react', () => ({
  useAuth: vi.fn(() => ({ isSignedIn: false })),
  useClerk: vi.fn(() => ({ signOut: vi.fn() })),
}))

import TrackApplication from '../TrackApplication'

describe('TrackApplication', () => {
  it('renders applicant name and job title after loading', async () => {
    render(
      <MemoryRouter initialEntries={['/track/test-token-123']}>
        <Routes>
          <Route path="/track/:token" element={<TrackApplication />} />
        </Routes>
      </MemoryRouter>
    )
    await waitFor(() => expect(screen.getByText(/Jane Doe/i)).toBeInTheDocument())
    expect(screen.getByText(/Senior Engineer/i)).toBeInTheDocument()
  })

  it('renders the current status badge', async () => {
    render(
      <MemoryRouter initialEntries={['/track/test-token-123']}>
        <Routes>
          <Route path="/track/:token" element={<TrackApplication />} />
        </Routes>
      </MemoryRouter>
    )
    await waitFor(() => expect(screen.getByText(/Interview/i)).toBeInTheDocument())
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npx vitest run src/pages/__tests__/TrackApplication.test.jsx
```

Expected: FAIL — `Cannot find module '../TrackApplication'`

- [ ] **Step 4: Implement TrackApplication page**

```jsx
// src/pages/TrackApplication.jsx
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import StatusBadge from '../components/StatusBadge'
import { getApplicationStatus } from '../lib/api'

const STATUS_STEPS = ['New', 'Reviewing', 'Interview', 'Offer']

export default function TrackApplication() {
  const { token } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    getApplicationStatus(token)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [token])

  return (
    <>
      <Navbar />
      <div className="container py-5" style={{ maxWidth: 640 }}>
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
          </div>
        )}

        {error && (
          <div className="text-center py-5">
            <div style={{ fontSize: 48 }}>🔍</div>
            <h4 className="fw-bold mt-3">Application Not Found</h4>
            <p className="text-muted">This tracking link may be invalid or expired.</p>
            <Link to="/" className="btn btn-primary mt-2">View Open Positions</Link>
          </div>
        )}

        {data && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-5">
              <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: 72, height: 72, background: 'var(--primary-light)', fontSize: 36 }}>
                📋
              </div>
              <h2 className="fw-bold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Application Status
              </h2>
              <p className="text-muted">
                {data.full_name} · <strong>{data.job_title}</strong>
              </p>
              <p className="text-muted small">
                Submitted {new Date(data.created_at).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="card p-4 mb-4 text-center">
              <div className="text-muted small mb-2">Current Status</div>
              <StatusBadge status={data.status} />
            </div>

            {data.status !== 'Rejected' && (
              <div className="card p-4">
                <div className="d-flex align-items-center justify-content-between position-relative">
                  <div style={{ position: 'absolute', top: 18, left: '12.5%', right: '12.5%', height: 2, background: 'var(--border)', zIndex: 0 }} />
                  {STATUS_STEPS.map((step, i) => {
                    const currentIdx = STATUS_STEPS.indexOf(data.status)
                    const done = i <= currentIdx
                    return (
                      <div key={step} className="d-flex flex-column align-items-center" style={{ zIndex: 1, flex: 1 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: done ? 'var(--primary)' : 'white',
                          border: `2px solid ${done ? 'var(--primary)' : 'var(--border)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: done ? 'white' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem',
                        }}>
                          {done ? '✓' : i + 1}
                        </div>
                        <div style={{ fontSize: '0.7rem', marginTop: 6, color: done ? 'var(--primary)' : 'var(--text-muted)', fontWeight: done ? 600 : 400, textAlign: 'center' }}>
                          {step}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="text-center mt-4">
              <Link to="/" className="btn btn-outline-primary btn-sm">View Other Positions</Link>
            </div>
          </motion.div>
        )}
      </div>
      <Footer />
    </>
  )
}
```

- [ ] **Step 5: Add route in App.jsx**

In `src/App.jsx`, add the import and route:

```jsx
// Add import after existing page imports:
import TrackApplication from './pages/TrackApplication'

// Add route inside <Routes>, after the /apply/:id route:
<Route path="/track/:token" element={<TrackApplication />} />
```

- [ ] **Step 6: Run test to verify it passes**

```bash
npx vitest run src/pages/__tests__/TrackApplication.test.jsx
```

Expected: 2 passed

- [ ] **Step 7: Commit**

```bash
git add src/pages/TrackApplication.jsx src/pages/__tests__/TrackApplication.test.jsx src/lib/api.js src/App.jsx
git commit -m "feat: add application status tracking page and API helper"
```

---

## Task 4: Return tracking_token from Applications API

**Files:**
- Modify: `api/applications/index.js`
- Modify: `api/__tests__/applications.test.js`
- Modify: `src/components/SuccessModal.jsx`
- Modify: `src/components/__tests__/SuccessModal.test.jsx`

- [ ] **Step 1: Update the test first**

In `api/__tests__/applications.test.js`, update the mock and assertion in "inserts application and sends two emails":

```js
it('inserts application and sends two emails', async () => {
  mockQuery.mockResolvedValue([{ id: 'new-uuid', tracking_token: 'track-token-abc' }])
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

  expect(res.json).toHaveBeenCalledWith({ id: 'new-uuid', tracking_token: 'track-token-abc' })
  expect(mockSendEmail).toHaveBeenCalledTimes(2)
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run api/__tests__/applications.test.js
```

Expected: FAIL on the "inserts application" test

- [ ] **Step 3: Update the API handler**

Replace `api/applications/index.js` with this updated version (only `RETURNING` clause and `res.json` line change, plus tracking link in email):

```js
// api/applications/index.js
import { neon } from '@neondatabase/serverless'
import { TransactionalEmailsApi, SendSmtpEmail, ApiClient } from '@getbrevo/brevo'

function getBrevoClient() {
  ApiClient.instance.authentications['api-key'].apiKey = process.env.BREVO_API_KEY
  return new TransactionalEmailsApi()
}

async function sendEmail(api, { to, subject, html }) {
  const email = new SendSmtpEmail()
  email.to = [{ email: to }]
  email.subject = subject
  email.htmlContent = html
  email.sender = { email: 'noreply@careers.com', name: process.env.VITE_ORG_NAME || 'Careers' }
  await api.sendTransacEmail(email)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const {
    job_id, job_title, full_name, email, phone,
    linkedin_url, expected_salary, years_experience,
    availability, cover_letter, resume_url,
    heard_from, visa_sponsorship, work_authorized, start_date,
  } = req.body

  if (!full_name || !email || !phone || !job_title || !resume_url) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const sql = neon(process.env.DATABASE_URL)
    const rows = await sql`
      INSERT INTO applications (
        job_id, job_title, full_name, email, phone, linkedin_url,
        expected_salary, years_experience, availability, cover_letter,
        resume_url, heard_from, visa_sponsorship, work_authorized, start_date
      ) VALUES (
        ${job_id || null}, ${job_title}, ${full_name}, ${email}, ${phone},
        ${linkedin_url || null}, ${expected_salary || null}, ${years_experience || null},
        ${availability || null}, ${cover_letter || null}, ${resume_url},
        ${heard_from || null}, ${visa_sponsorship || null}, ${work_authorized || null},
        ${start_date || null}
      )
      RETURNING id, tracking_token
    `

    const orgName = process.env.VITE_ORG_NAME || 'Our Company'
    const hrEmail = process.env.VITE_HR_EMAIL
    const baseUrl = process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')
    const trackingUrl = baseUrl ? `${baseUrl}/track/${rows[0].tracking_token}` : null
    const brevo = getBrevoClient()
    const date = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })

    await sendEmail(brevo, {
      to: email,
      subject: `✅ Application Received — ${job_title} at ${orgName}`,
      html: `
        <h2>Thank you, ${full_name}!</h2>
        <p>We've received your application for <strong>${job_title}</strong> at ${orgName}.</p>
        <p><strong>Submitted:</strong> ${date}</p>
        ${trackingUrl ? `<p><a href="${trackingUrl}" style="display:inline-block;background:#2563eb;color:white;padding:10px 20px;border-radius:6px;text-decoration:none">Track Your Application →</a></p>` : ''}
        <p>Our team reviews applications within 5–10 business days.</p>
        <p>Best regards,<br/>${orgName} Recruiting Team</p>
      `,
    })

    if (hrEmail) {
      await sendEmail(brevo, {
        to: hrEmail,
        subject: `🔔 New Application — ${job_title} from ${full_name}`,
        html: `
          <h2>New Application Received</h2>
          <table style="border-collapse:collapse;width:100%">
            <tr><td style="padding:8px;border:1px solid #e2e8f0"><strong>Name</strong></td><td style="padding:8px;border:1px solid #e2e8f0">${full_name}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e2e8f0"><strong>Email</strong></td><td style="padding:8px;border:1px solid #e2e8f0">${email}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e2e8f0"><strong>Phone</strong></td><td style="padding:8px;border:1px solid #e2e8f0">${phone}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e2e8f0"><strong>Position</strong></td><td style="padding:8px;border:1px solid #e2e8f0">${job_title}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e2e8f0"><strong>Resume</strong></td><td style="padding:8px;border:1px solid #e2e8f0"><a href="${resume_url}">Download</a></td></tr>
            ${cover_letter ? `<tr><td style="padding:8px;border:1px solid #e2e8f0"><strong>Cover Letter</strong></td><td style="padding:8px;border:1px solid #e2e8f0">${cover_letter.slice(0, 500)}${cover_letter.length > 500 ? '…' : ''}</td></tr>` : ''}
          </table>
        `,
      })
    }

    res.json({ id: rows[0].id, tracking_token: rows[0].tracking_token })
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run api/__tests__/applications.test.js
```

Expected: 3 passed

- [ ] **Step 5: Update SuccessModal to accept trackingToken**

Replace `src/components/SuccessModal.jsx`:

```jsx
// src/components/SuccessModal.jsx
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function SuccessModal({ show, name, jobTitle, onClose, trackingToken }) {
  if (!show) return null

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
        <div className="modal-content text-center p-5" style={{ borderRadius: 'var(--radius)' }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
            <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
              style={{ width: 80, height: 80, background: '#dcfce7', fontSize: 40 }}>
              ✅
            </div>
          </motion.div>
          <h4 className="fw-bold mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Application Submitted!</h4>
          <p className="text-muted mb-3">
            Thank you, <strong>{name}</strong>! Your application for <strong>{jobTitle}</strong> has been received.
            We'll be in touch within 5–10 business days.
          </p>
          {trackingToken && (
            <div className="alert alert-info mb-4 text-start" style={{ fontSize: '0.9rem', borderRadius: 'var(--radius)' }}>
              <strong>🔍 Track your application</strong><br />
              <Link to={`/track/${trackingToken}`} className="text-primary fw-semibold" onClick={onClose}>
                View your application status →
              </Link>
            </div>
          )}
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link to="/" className="btn btn-primary" onClick={onClose}>Apply for Another Position</Link>
            <button className="btn btn-outline-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Update SuccessModal test**

In `src/components/__tests__/SuccessModal.test.jsx`, add one test to the existing `describe('SuccessModal')` block (the file already uses `MemoryRouter` and imports `screen`):

```jsx
it('shows tracking link when trackingToken is provided', () => {
  render(<MemoryRouter><SuccessModal {...props} trackingToken="abc-123" /></MemoryRouter>)
  expect(screen.getByText(/Track your application/i)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /View your application status/i })).toBeInTheDocument()
})
```

- [ ] **Step 7: Run all tests**

```bash
npx vitest run api/__tests__/applications.test.js src/components/__tests__/SuccessModal.test.jsx
```

Expected: all passed

- [ ] **Step 8: Commit**

```bash
git add api/applications/index.js api/__tests__/applications.test.js src/components/SuccessModal.jsx src/components/__tests__/SuccessModal.test.jsx
git commit -m "feat: return tracking_token from applications API and show tracking link in SuccessModal"
```

---

## Task 5: Auto Status-Change Emails

**Files:**
- Modify: `api/admin/applications/[id].js`
- Modify: `api/__tests__/admin-applications-id.test.js`

- [ ] **Step 1: Update the test first**

In `api/__tests__/admin-applications-id.test.js`, add Brevo mock and a new test. Replace the entire file:

```js
// api/__tests__/admin-applications-id.test.js
// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mockQuery = vi.fn()
vi.mock('@neondatabase/serverless', () => ({ neon: vi.fn(() => mockQuery) }))

const mockVerifyToken = vi.fn()
vi.mock('@clerk/backend', () => ({
  createClerkClient: vi.fn(() => ({ verifyToken: mockVerifyToken })),
}))

const mockSendEmail = vi.fn()
vi.mock('@getbrevo/brevo', () => ({
  TransactionalEmailsApi: vi.fn(() => ({ sendTransacEmail: mockSendEmail })),
  SendSmtpEmail: vi.fn(function(d) { Object.assign(this, d) }),
  ApiClient: { instance: { authentications: { 'api-key': { apiKey: '' } } } },
}))

const { default: handler } = await import('../admin/applications/[id].js')

describe('/api/admin/applications/:id', () => {
  beforeEach(() => {
    process.env.DATABASE_URL = 'postgresql://test'
    process.env.CLERK_SECRET_KEY = 'sk_test'
    process.env.BREVO_API_KEY = 'test-key'
    process.env.VITE_ORG_NAME = 'TestOrg'
    mockQuery.mockReset()
    mockVerifyToken.mockReset()
    mockSendEmail.mockReset()
  })

  it('returns 401 when not authenticated', async () => {
    const req = { method: 'PATCH', headers: {}, query: { id: 'app-1' }, body: { status: 'Interview' } }
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn(), end: vi.fn() }
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('updates status via PATCH', async () => {
    mockVerifyToken.mockResolvedValue({ sub: 'user_123' })
    mockQuery
      .mockResolvedValueOnce([{ id: 'app-1', status: 'New', email: 'jane@test.com', full_name: 'Jane', job_title: 'Engineer' }])
      .mockResolvedValueOnce([{ id: 'app-1', status: 'Interview' }])
    mockSendEmail.mockResolvedValue({})

    const req = { method: 'PATCH', headers: { authorization: 'Bearer valid-token' }, query: { id: 'app-1' }, body: { status: 'Interview' } }
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn(), end: vi.fn() }
    await handler(req, res)

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'Interview' }))
    expect(mockSendEmail).toHaveBeenCalledTimes(1)
  })

  it('does not send email when only notes are updated', async () => {
    mockVerifyToken.mockResolvedValue({ sub: 'user_123' })
    mockQuery.mockResolvedValue([{ id: 'app-1', notes: 'Good candidate' }])

    const req = { method: 'PATCH', headers: { authorization: 'Bearer valid-token' }, query: { id: 'app-1' }, body: { notes: 'Good candidate' } }
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn(), end: vi.fn() }
    await handler(req, res)

    expect(mockSendEmail).not.toHaveBeenCalled()
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
```

- [ ] **Step 2: Run test to verify new test fails**

```bash
npx vitest run api/__tests__/admin-applications-id.test.js
```

Expected: "updates status via PATCH" fails (no email sent), "does not send email" may pass

- [ ] **Step 3: Update the admin PATCH handler**

Replace `api/admin/applications/[id].js`:

```js
// api/admin/applications/[id].js
import { neon } from '@neondatabase/serverless'
import { TransactionalEmailsApi, SendSmtpEmail, ApiClient } from '@getbrevo/brevo'
import { requireAuth } from '../../_auth.js'

function getBrevoClient() {
  ApiClient.instance.authentications['api-key'].apiKey = process.env.BREVO_API_KEY
  return new TransactionalEmailsApi()
}

const STATUS_EMAIL = {
  Reviewing: {
    subject: '🔄 Your application is being reviewed',
    body: (name, job, org) => `<h2>Good news, ${name}!</h2><p>Your application for <strong>${job}</strong> at ${org} is now being reviewed by our team. We'll be in touch soon.</p>`,
  },
  Interview: {
    subject: '🎉 You\'re invited to an interview!',
    body: (name, job, org) => `<h2>Congratulations, ${name}!</h2><p>We'd love to invite you to an interview for the <strong>${job}</strong> position at ${org}. Our team will reach out shortly to schedule a time.</p>`,
  },
  Offer: {
    subject: '🌟 We\'d like to make you an offer',
    body: (name, job, org) => `<h2>Exciting news, ${name}!</h2><p>We are pleased to inform you that we'd like to make you an offer for the <strong>${job}</strong> position at ${org}. Our team will be in touch with the details very soon.</p>`,
  },
  Rejected: {
    subject: 'Update on your application',
    body: (name, job, org) => `<h2>Hi ${name},</h2><p>Thank you for your interest in the <strong>${job}</strong> position at ${org}. After careful consideration, we've decided to move forward with other candidates at this time. We encourage you to apply for future openings.</p>`,
  },
}

async function notifyApplicant(email, full_name, job_title, newStatus) {
  const template = STATUS_EMAIL[newStatus]
  if (!template) return

  const orgName = process.env.VITE_ORG_NAME || 'Our Company'
  const api = getBrevoClient()
  const msg = new SendSmtpEmail()
  msg.to = [{ email }]
  msg.subject = template.subject
  msg.htmlContent = template.body(full_name, job_title, orgName) +
    `<p style="margin-top:24px">Best regards,<br/>${orgName} Recruiting Team</p>`
  msg.sender = { email: 'noreply@careers.com', name: orgName }
  await api.sendTransacEmail(msg)
}

export default async function handler(req, res) {
  try { await requireAuth(req) } catch { return res.status(401).json({ error: 'Unauthorized' }) }

  const { id } = req.query
  const sql = neon(process.env.DATABASE_URL)

  if (req.method === 'PATCH') {
    const { status, notes } = req.body

    try {
      let rows
      if (status !== undefined) {
        const current = await sql`SELECT email, full_name, job_title, status FROM applications WHERE id = ${id}`
        if (current.length === 0) return res.status(404).json({ error: 'Not found' })

        if (notes !== undefined) {
          rows = await sql`UPDATE applications SET status = ${status}, notes = ${notes} WHERE id = ${id} RETURNING *`
        } else {
          rows = await sql`UPDATE applications SET status = ${status} WHERE id = ${id} RETURNING *`
        }

        if (current[0].status !== status) {
          await notifyApplicant(current[0].email, current[0].full_name, current[0].job_title, status).catch(() => {})
        }
      } else if (notes !== undefined) {
        rows = await sql`UPDATE applications SET notes = ${notes} WHERE id = ${id} RETURNING *`
      } else {
        return res.status(400).json({ error: 'No fields to update' })
      }

      if (!rows || rows.length === 0) return res.status(404).json({ error: 'Not found' })
      return res.json(rows[0])
    } catch {
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      await sql`DELETE FROM applications WHERE id = ${id}`
      return res.status(204).end()
    } catch {
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  res.status(405).json({ error: 'Method not allowed' })
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run api/__tests__/admin-applications-id.test.js
```

Expected: 4 passed

- [ ] **Step 5: Commit**

```bash
git add api/admin/applications/[id].js api/__tests__/admin-applications-id.test.js
git commit -m "feat: send applicant email automatically when admin changes application status"
```

---

## Task 6: StepIndicator Component

**Files:**
- Create: `src/components/StepIndicator.jsx`
- Create: `src/components/__tests__/StepIndicator.test.jsx`

- [ ] **Step 1: Write the failing test**

```jsx
// src/components/__tests__/StepIndicator.test.jsx
import { render, screen } from '@testing-library/react'
import StepIndicator from '../StepIndicator'

const STEPS = ['Infos personnelles', 'CV & Motivation', 'Finaliser']

describe('StepIndicator', () => {
  it('renders all step labels', () => {
    render(<StepIndicator steps={STEPS} currentStep={0} />)
    expect(screen.getByText('Infos personnelles')).toBeInTheDocument()
    expect(screen.getByText('CV & Motivation')).toBeInTheDocument()
    expect(screen.getByText('Finaliser')).toBeInTheDocument()
  })

  it('shows checkmark for completed steps', () => {
    render(<StepIndicator steps={STEPS} currentStep={2} />)
    const checks = screen.getAllByText('✓')
    expect(checks.length).toBe(2)
  })

  it('shows step number for current and future steps', () => {
    render(<StepIndicator steps={STEPS} currentStep={1} />)
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/components/__tests__/StepIndicator.test.jsx
```

Expected: FAIL — `Cannot find module '../StepIndicator'`

- [ ] **Step 3: Implement StepIndicator**

```jsx
// src/components/StepIndicator.jsx
import { Fragment } from 'react'

export default function StepIndicator({ steps, currentStep }) {
  return (
    <div className="d-flex align-items-start mb-4 px-2">
      {steps.map((label, i) => (
        <Fragment key={label}>
          <div className="d-flex flex-column align-items-center" style={{ flex: 1 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: i < currentStep ? 'var(--primary)' : i === currentStep ? 'var(--primary)' : 'var(--border)',
              color: i <= currentStep ? 'white' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.9rem',
              boxShadow: i === currentStep ? '0 0 0 4px var(--primary-light)' : 'none',
              transition: 'all 0.3s',
            }}>
              {i < currentStep ? '✓' : i + 1}
            </div>
            <div style={{
              fontSize: '0.7rem', marginTop: 6, textAlign: 'center',
              color: i <= currentStep ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: i === currentStep ? 700 : 400,
              lineHeight: 1.2,
            }}>
              {label}
            </div>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              flex: 2, height: 2, marginTop: 17,
              background: i < currentStep ? 'var(--primary)' : 'var(--border)',
              transition: 'background 0.3s',
            }} />
          )}
        </Fragment>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/components/__tests__/StepIndicator.test.jsx
```

Expected: 3 passed

- [ ] **Step 5: Commit**

```bash
git add src/components/StepIndicator.jsx src/components/__tests__/StepIndicator.test.jsx
git commit -m "feat: add StepIndicator component for multi-step form wizard"
```

---

## Task 7: MultiStepForm — 3-Step Wizard

**Files:**
- Create: `src/components/MultiStepForm.jsx`
- Create: `src/components/__tests__/MultiStepForm.test.jsx`
- Delete: `src/components/ApplicationForm.jsx`
- Delete: `src/components/__tests__/ApplicationForm.test.jsx`
- Modify: `src/pages/Apply.jsx`

- [ ] **Step 1: Write the failing test**

```jsx
// src/components/__tests__/MultiStepForm.test.jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

vi.mock('@clerk/clerk-react', () => ({
  useAuth: vi.fn(() => ({ isSignedIn: false })),
  useClerk: vi.fn(() => ({ signOut: vi.fn() })),
}))
vi.mock('../../lib/api', () => ({
  uploadResume: vi.fn(),
  submitApplication: vi.fn(),
}))

import MultiStepForm from '../MultiStepForm'

const JOB = { id: 'job-1', title: 'Senior Engineer' }

describe('MultiStepForm', () => {
  it('renders step 1 fields initially', () => {
    render(<MemoryRouter><MultiStepForm job={JOB} /></MemoryRouter>)
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument()
  })

  it('renders step indicator with 3 steps', () => {
    render(<MemoryRouter><MultiStepForm job={JOB} /></MemoryRouter>)
    expect(screen.getByText('Infos personnelles')).toBeInTheDocument()
    expect(screen.getByText('CV & Motivation')).toBeInTheDocument()
    expect(screen.getByText('Finaliser')).toBeInTheDocument()
  })

  it('shows Next button on step 1', () => {
    render(<MemoryRouter><MultiStepForm job={JOB} /></MemoryRouter>)
    expect(screen.getByRole('button', { name: /next|suivant/i })).toBeInTheDocument()
  })

  it('does not show Back button on step 1', () => {
    render(<MemoryRouter><MultiStepForm job={JOB} /></MemoryRouter>)
    expect(screen.queryByRole('button', { name: /back|retour/i })).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/components/__tests__/MultiStepForm.test.jsx
```

Expected: FAIL — `Cannot find module '../MultiStepForm'`

- [ ] **Step 3: Implement MultiStepForm**

```jsx
// src/components/MultiStepForm.jsx
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import StepIndicator from './StepIndicator'
import SuccessModal from './SuccessModal'
import { uploadResume, submitApplication } from '../lib/api'

const STEPS = ['Infos personnelles', 'CV & Motivation', 'Finaliser']
const YEARS_OPTIONS = ['Less than 1 year', '1-3 years', '3-5 years', '5-10 years', '10+ years']
const AVAILABILITY_OPTIONS = ['Immediately', 'Within 2 weeks', 'Within 1 month', 'Flexible']
const HEARD_OPTIONS = ['LinkedIn', 'Company Website', 'Job Board', 'Referral', 'Social Media', 'Other']
const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

const slideVariants = {
  enter: dir => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: dir => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
}

export default function MultiStepForm({ job }) {
  const { register, trigger, handleSubmit, watch, getValues, formState: { errors, isSubmitting } } = useForm()
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [showSuccess, setShowSuccess] = useState(false)
  const [submittedName, setSubmittedName] = useState('')
  const [trackingToken, setTrackingToken] = useState(null)
  const coverLetter = watch('cover_letter', '')

  const go = (next) => {
    setDir(next > step ? 1 : -1)
    setStep(next)
  }

  const handleNext = async () => {
    const fields = [
      ['full_name', 'email', 'phone'],
      ['resume', 'years_experience', 'availability'],
    ][step]
    const valid = await trigger(fields)
    if (valid) go(step + 1)
  }

  const onSubmit = async (data) => {
    try {
      const { url: resume_url } = await uploadResume(data.resume[0])
      const result = await submitApplication({
        ...data, job_id: job.id, job_title: job.title,
        resume_url, resume: undefined,
      })
      setSubmittedName(data.full_name)
      setTrackingToken(result.tracking_token || null)
      setShowSuccess(true)
    } catch {
      toast.error('Submission failed. Please try again.')
    }
  }

  const vals = getValues()

  return (
    <>
      <StepIndicator steps={STEPS} currentStep={step} />

      <div style={{ overflow: 'hidden' }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={step} custom={dir} variants={slideVariants}
            initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>

              {/* Step 1 — Infos personnelles */}
              {step === 0 && (
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label htmlFor="full_name" className="form-label fw-semibold">Full Name *</label>
                    <input id="full_name" className={`form-control ${errors.full_name ? 'is-invalid' : ''}`}
                      {...register('full_name', { required: 'Full name is required' })} />
                    {errors.full_name && <div className="invalid-feedback">{errors.full_name.message}</div>}
                  </div>
                  <div className="col-12 col-md-6">
                    <label htmlFor="email" className="form-label fw-semibold">Email *</label>
                    <input id="email" type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })} />
                    {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                  </div>
                  <div className="col-12 col-md-6">
                    <label htmlFor="phone" className="form-label fw-semibold">Phone *</label>
                    <input id="phone" className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      {...register('phone', { required: 'Phone number is required' })} />
                    {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
                  </div>
                  <div className="col-12 col-md-6">
                    <label htmlFor="linkedin_url" className="form-label fw-semibold">LinkedIn URL</label>
                    <input id="linkedin_url" type="url" className="form-control"
                      placeholder="https://linkedin.com/in/..." {...register('linkedin_url')} />
                  </div>
                </div>
              )}

              {/* Step 2 — CV & Motivation */}
              {step === 1 && (
                <div className="row g-3">
                  <div className="col-12">
                    <label htmlFor="resume" className="form-label fw-semibold">Resume * (PDF, DOC, DOCX — max 5MB)</label>
                    <input id="resume" type="file" accept=".pdf,.doc,.docx"
                      className={`form-control ${errors.resume ? 'is-invalid' : ''}`}
                      {...register('resume', {
                        required: 'Resume is required',
                        validate: {
                          size: f => !f[0] || f[0].size <= 5 * 1024 * 1024 || 'File must be 5MB or smaller',
                          type: f => !f[0] || ALLOWED_TYPES.includes(f[0].type) || 'Only PDF, DOC, DOCX allowed',
                        },
                      })} />
                    {errors.resume && <div className="invalid-feedback">{errors.resume.message}</div>}
                  </div>
                  <div className="col-12">
                    <label htmlFor="cover_letter" className="form-label fw-semibold">Cover Letter</label>
                    <textarea id="cover_letter" className="form-control" rows={5} maxLength={2000}
                      placeholder="Tell us why you'd be a great fit..." {...register('cover_letter')} />
                    <div className="form-text text-end">{coverLetter.length} / 2000</div>
                  </div>
                  <div className="col-12 col-md-6">
                    <label htmlFor="years_experience" className="form-label fw-semibold">Years of Experience *</label>
                    <select id="years_experience" className={`form-select ${errors.years_experience ? 'is-invalid' : ''}`}
                      {...register('years_experience', { required: 'Please select your experience level' })}>
                      <option value="">Select...</option>
                      {YEARS_OPTIONS.map(o => <option key={o}>{o}</option>)}
                    </select>
                    {errors.years_experience && <div className="invalid-feedback">{errors.years_experience.message}</div>}
                  </div>
                  <div className="col-12 col-md-6">
                    <label htmlFor="availability" className="form-label fw-semibold">Availability *</label>
                    <select id="availability" className={`form-select ${errors.availability ? 'is-invalid' : ''}`}
                      {...register('availability', { required: 'Please select your availability' })}>
                      <option value="">Select...</option>
                      {AVAILABILITY_OPTIONS.map(o => <option key={o}>{o}</option>)}
                    </select>
                    {errors.availability && <div className="invalid-feedback">{errors.availability.message}</div>}
                  </div>
                </div>
              )}

              {/* Step 3 — Finaliser */}
              {step === 2 && (
                <div className="row g-3">
                  <div className="col-12">
                    <div className="card p-3 mb-2" style={{ background: 'var(--primary-light)', border: 'none', borderRadius: 'var(--radius)' }}>
                      <div className="small fw-semibold mb-2" style={{ color: 'var(--primary)' }}>📋 Summary</div>
                      <div className="row g-1 small text-muted">
                        <div className="col-6"><strong>Name:</strong> {vals.full_name}</div>
                        <div className="col-6"><strong>Email:</strong> {vals.email}</div>
                        <div className="col-6"><strong>Phone:</strong> {vals.phone}</div>
                        <div className="col-6"><strong>Position:</strong> {job.title}</div>
                        {vals.years_experience && <div className="col-6"><strong>Experience:</strong> {vals.years_experience}</div>}
                        {vals.availability && <div className="col-6"><strong>Availability:</strong> {vals.availability}</div>}
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <label htmlFor="expected_salary" className="form-label fw-semibold">Expected Salary</label>
                    <input id="expected_salary" className="form-control" placeholder="e.g. 80,000 CAD"
                      {...register('expected_salary')} />
                  </div>
                  <div className="col-12 col-md-6">
                    <label htmlFor="start_date" className="form-label fw-semibold">Earliest Start Date</label>
                    <input id="start_date" type="date" className="form-control" {...register('start_date')} />
                  </div>
                  <div className="col-12 col-md-6">
                    <label htmlFor="heard_from" className="form-label fw-semibold">How did you hear about us?</label>
                    <select id="heard_from" className="form-select" {...register('heard_from')}>
                      <option value="">Select...</option>
                      {HEARD_OPTIONS.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold">Visa sponsorship required?</label>
                    <div className="d-flex gap-4">
                      {['Yes', 'No'].map(v => (
                        <div key={v} className="form-check">
                          <input className="form-check-input" type="radio" id={`visa-${v}`} value={v} {...register('visa_sponsorship')} />
                          <label className="form-check-label" htmlFor={`visa-${v}`}>{v}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold">Authorized to work in Canada?</label>
                    <div className="d-flex gap-4">
                      {['Yes', 'No'].map(v => (
                        <div key={v} className="form-check">
                          <input className="form-check-input" type="radio" id={`auth-${v}`} value={v} {...register('work_authorized')} />
                          <label className="form-check-label" htmlFor={`auth-${v}`}>{v}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className={`d-flex mt-4 ${step > 0 ? 'justify-content-between' : 'justify-content-end'}`}>
                {step > 0 && (
                  <button type="button" className="btn btn-outline-secondary" onClick={() => go(step - 1)}>
                    ← Back
                  </button>
                )}
                {step < STEPS.length - 1 ? (
                  <button type="button" className="btn btn-primary px-4" onClick={handleNext}>
                    Next →
                  </button>
                ) : (
                  <button type="submit" className="btn btn-primary btn-lg px-5" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                )}
              </div>

            </form>
          </motion.div>
        </AnimatePresence>
      </div>

      <SuccessModal show={showSuccess} name={submittedName} jobTitle={job.title}
        onClose={() => setShowSuccess(false)} trackingToken={trackingToken} />
    </>
  )
}
```

- [ ] **Step 4: Update Apply.jsx to use MultiStepForm**

In `src/pages/Apply.jsx`, replace the import and usage:

```jsx
// Change this line:
import ApplicationForm from '../components/ApplicationForm'
// To:
import MultiStepForm from '../components/MultiStepForm'

// Change the usage (wherever <ApplicationForm job={job} /> appears):
// To:
<MultiStepForm job={job} />
```

- [ ] **Step 5: Delete ApplicationForm files**

```bash
rm "src/components/ApplicationForm.jsx"
rm "src/components/__tests__/ApplicationForm.test.jsx"
```

- [ ] **Step 6: Run tests**

```bash
npx vitest run src/components/__tests__/MultiStepForm.test.jsx src/pages/__tests__/Apply.test.jsx
```

Expected: all passed (Apply tests may need minor mock updates if they reference ApplicationForm — update any such mocks to reference MultiStepForm)

- [ ] **Step 7: Run full test suite**

```bash
npx vitest run
```

Expected: all tests pass (21 test files minus ApplicationForm, plus new ones)

- [ ] **Step 8: Commit**

```bash
git add src/components/MultiStepForm.jsx src/components/__tests__/MultiStepForm.test.jsx src/components/StepIndicator.jsx src/pages/Apply.jsx
git rm src/components/ApplicationForm.jsx src/components/__tests__/ApplicationForm.test.jsx
git commit -m "feat: replace ApplicationForm with 3-step MultiStepForm wizard"
```

---

## Task 8: Culture Section

**Files:**
- Create: `src/lib/culture.js`
- Create: `src/components/CultureSection.jsx`
- Create: `src/components/__tests__/CultureSection.test.jsx`
- Modify: `src/pages/Home.jsx`

- [ ] **Step 1: Create culture content**

```js
// src/lib/culture.js
export const PERKS = [
  { icon: '🌍', title: 'Full Remote', desc: 'Work from anywhere in the world.' },
  { icon: '🏥', title: 'Health & Wellness', desc: 'Full coverage including vision and dental.' },
  { icon: '📚', title: 'Learning Budget', desc: '$2,000/year for books, courses, and conferences.' },
  { icon: '🏖️', title: 'Unlimited PTO', desc: 'We count results, not vacation days.' },
  { icon: '💻', title: 'Top Equipment', desc: 'MacBook Pro + monitor + everything you need.' },
  { icon: '🤝', title: 'Caring Team', desc: 'A culture of feedback, inclusion, and respect.' },
]

export const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Senior Engineer',
    quote: 'I joined two years ago and it\'s the best career decision I\'ve made. The autonomy and technical level are exceptional.',
    initials: 'SC',
  },
  {
    name: 'Marcus Diallo',
    role: 'Product Designer',
    quote: 'Here I\'m given the means to do real design work. No compromises on quality — ever.',
    initials: 'MD',
  },
  {
    name: 'Amina Traoré',
    role: 'Marketing Lead',
    quote: 'The remote-first culture is a game changer. I\'m productive, fulfilled, and I love my team.',
    initials: 'AT',
  },
]
```

- [ ] **Step 2: Write the failing test**

```jsx
// src/components/__tests__/CultureSection.test.jsx
import { render, screen } from '@testing-library/react'
import CultureSection from '../CultureSection'

describe('CultureSection', () => {
  it('renders all perk titles', () => {
    render(<CultureSection />)
    expect(screen.getByText('Full Remote')).toBeInTheDocument()
    expect(screen.getByText('Health & Wellness')).toBeInTheDocument()
    expect(screen.getByText('Learning Budget')).toBeInTheDocument()
  })

  it('renders all testimonial names', () => {
    render(<CultureSection />)
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument()
    expect(screen.getByText('Marcus Diallo')).toBeInTheDocument()
    expect(screen.getByText('Amina Traoré')).toBeInTheDocument()
  })

  it('renders the section heading', () => {
    render(<CultureSection />)
    expect(screen.getByText(/Life at/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npx vitest run src/components/__tests__/CultureSection.test.jsx
```

Expected: FAIL — `Cannot find module '../CultureSection'`

- [ ] **Step 4: Implement CultureSection**

```jsx
// src/components/CultureSection.jsx
import { motion } from 'framer-motion'
import { PERKS, TESTIMONIALS } from '../lib/culture'

const ORG_NAME = import.meta.env.VITE_ORG_NAME || 'Our Company'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function CultureSection() {
  return (
    <section className="py-5" style={{ background: 'var(--bg-light)' }}>
      <div className="container">

        {/* Heading */}
        <div className="text-center mb-5">
          <span className="badge mb-3 px-3 py-2" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 }}>
            OUR CULTURE
          </span>
          <h2 className="fw-bold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>
            Life at {ORG_NAME}
          </h2>
          <p className="text-muted mx-auto" style={{ maxWidth: 520 }}>
            We build software that matters, with people who care. Here's what working with us actually looks like.
          </p>
        </div>

        {/* Perks grid */}
        <motion.div className="row g-3 mb-5" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          {PERKS.map(p => (
            <motion.div key={p.title} className="col-12 col-sm-6 col-lg-4" variants={fadeUp}>
              <div className="card h-100 p-4 border-0 shadow-sm" style={{ borderRadius: 'var(--radius)' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{p.icon}</div>
                <h6 className="fw-bold mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{p.title}</h6>
                <p className="text-muted small mb-0">{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <h4 className="fw-bold text-center mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          From the team
        </h4>
        <motion.div className="row g-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          {TESTIMONIALS.map(t => (
            <motion.div key={t.name} className="col-12 col-md-4" variants={fadeUp}>
              <div className="card h-100 p-4 border-0 shadow-sm" style={{ borderRadius: 'var(--radius)' }}>
                <p className="text-muted mb-4" style={{ lineHeight: 1.7, fontStyle: 'italic' }}>"{t.quote}"</p>
                <div className="d-flex align-items-center gap-3 mt-auto">
                  <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                    style={{ width: 40, height: 40, background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.85rem', flexShrink: 0 }}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="fw-semibold small">{t.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npx vitest run src/components/__tests__/CultureSection.test.jsx
```

Expected: 3 passed

- [ ] **Step 6: Add CultureSection to Home page**

In `src/pages/Home.jsx`:

Add import after existing imports:
```jsx
import CultureSection from '../components/CultureSection'
```

Replace the existing "Why Join Us?" section (the `<section id="why-join" ...>` block) entirely with `<CultureSection />`. The section to remove starts with:
```jsx
<section id="why-join" className="py-5" style={{ background: 'var(--primary-light)' }}>
```
and ends with its closing `</section>`. Replace the entire block with:
```jsx
<CultureSection />
```

Then update the hero "Learn More" anchor to still scroll somewhere meaningful — change `href="#why-join"` to `href="#culture"` in the hero section, and add `id="culture"` to the outer `<section>` tag in `CultureSection.jsx`:
```jsx
<section id="culture" className="py-5" style={{ background: 'var(--bg-light)' }}>
```

- [ ] **Step 7: Run full test suite**

```bash
npx vitest run
```

Expected: all tests pass

- [ ] **Step 8: Commit**

```bash
git add src/lib/culture.js src/components/CultureSection.jsx src/components/__tests__/CultureSection.test.jsx src/pages/Home.jsx
git commit -m "feat: add company culture section with perks grid and testimonials"
```

---

## Task 9: Final Verification

- [ ] **Step 1: Run full test suite**

```bash
npx vitest run
```

Expected: all test files pass, 0 failures

- [ ] **Step 2: Build for production**

```bash
npm run build
```

Expected: `✓ built in X ms` — no errors

- [ ] **Step 3: Push to GitHub**

```bash
git push origin main
```

- [ ] **Step 4: Verify database has tracking_token**

```bash
DATABASE_URL="<neon-url>" node -e "
import('@neondatabase/serverless').then(async ({ neon }) => {
  const sql = neon(process.env.DATABASE_URL)
  const r = await sql\`SELECT column_name FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'tracking_token'\`
  console.log(r.length > 0 ? '✓ tracking_token column exists' : '✗ column missing')
})
"
```
