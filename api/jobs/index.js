import { neon } from '@neondatabase/serverless'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const sql = neon(process.env.DATABASE_URL)
    const jobs = await sql`
      SELECT id, title, department, location, type, description, requirements, salary_range, created_at
      FROM job_listings
      WHERE is_active = true
      ORDER BY created_at DESC
    `
    res.json(jobs)
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
}
