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
