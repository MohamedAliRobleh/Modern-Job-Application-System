import { neon } from '@neondatabase/serverless'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query

  try {
    const sql = neon(process.env.DATABASE_URL)
    const rows = await sql`
      SELECT id, title, department, location, type, description, requirements, salary_range, created_at
      FROM job_listings
      WHERE id = ${id} AND is_active = true
    `

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' })
    }

    res.json(rows[0])
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
}
