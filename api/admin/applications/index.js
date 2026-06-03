import { neon } from '@neondatabase/serverless'
import { requireAuth } from '../../_auth.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try { await requireAuth(req) } catch { return res.status(401).json({ error: 'Unauthorized' }) }

  const { search, job_id, status, from, to, page = '1', limit = '20' } = req.query
  const pageNum = parseInt(page, 10)
  const limitNum = parseInt(limit, 10)
  const offset = (pageNum - 1) * limitNum

  const s = search || null
  const j = job_id || null
  const st = status || null
  const f = from || null
  const t = to || null
  const likeSearch = '%' + (search || '') + '%'

  try {
    const sql = neon(process.env.DATABASE_URL)

    const countResult = await sql`
      SELECT COUNT(*) AS count FROM applications
      WHERE (${s}::text IS NULL OR full_name ILIKE ${likeSearch} OR email ILIKE ${likeSearch})
      AND (${j}::text IS NULL OR job_id::text = ${j})
      AND (${st}::text IS NULL OR status = ${st})
      AND (${f}::text IS NULL OR created_at >= ${f}::timestamptz)
      AND (${t}::text IS NULL OR created_at <= ${t}::timestamptz)
    `

    const total = parseInt(countResult[0].count, 10)

    const data = await sql`
      SELECT id, job_id, job_title, full_name, email, phone, linkedin_url, expected_salary,
             years_experience, availability, cover_letter, resume_url, heard_from,
             visa_sponsorship, work_authorized, start_date, status, notes, created_at
      FROM applications
      WHERE (${s}::text IS NULL OR full_name ILIKE ${likeSearch} OR email ILIKE ${likeSearch})
      AND (${j}::text IS NULL OR job_id::text = ${j})
      AND (${st}::text IS NULL OR status = ${st})
      AND (${f}::text IS NULL OR created_at >= ${f}::timestamptz)
      AND (${t}::text IS NULL OR created_at <= ${t}::timestamptz)
      ORDER BY created_at DESC
      LIMIT ${limitNum} OFFSET ${offset}
    `

    res.json({ data, total, page: pageNum, totalPages: Math.ceil(total / limitNum) })
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
}
