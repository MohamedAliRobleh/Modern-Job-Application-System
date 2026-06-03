import { neon } from '@neondatabase/serverless'
import { requireAuth } from '../../_auth.js'

export default async function handler(req, res) {
  try { await requireAuth(req) } catch { return res.status(401).json({ error: 'Unauthorized' }) }

  const { id } = req.query
  const sql = neon(process.env.DATABASE_URL)

  if (req.method === 'PATCH') {
    const { status, notes } = req.body
    let rows

    try {
      if (status !== undefined && notes !== undefined) {
        rows = await sql`UPDATE applications SET status = ${status}, notes = ${notes} WHERE id = ${id} RETURNING *`
      } else if (status !== undefined) {
        rows = await sql`UPDATE applications SET status = ${status} WHERE id = ${id} RETURNING *`
      } else if (notes !== undefined) {
        rows = await sql`UPDATE applications SET notes = ${notes} WHERE id = ${id} RETURNING *`
      } else {
        return res.status(400).json({ error: 'No fields to update' })
      }

      if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
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
