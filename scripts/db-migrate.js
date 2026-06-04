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
