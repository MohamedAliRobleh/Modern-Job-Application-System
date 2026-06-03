import { neon } from '@neondatabase/serverless'
import { requireAuth } from '../_auth.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try { await requireAuth(req) } catch { return res.status(401).json({ error: 'Unauthorized' }) }

  try {
    const sql = neon(process.env.DATABASE_URL)
    const rows = await sql`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'New') AS new_count,
        COUNT(*) FILTER (WHERE status = 'Interview') AS interview_count,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS this_week
      FROM applications
    `
    res.json(rows[0])
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
}
