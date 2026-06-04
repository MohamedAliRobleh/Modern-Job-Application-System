// @ts-check
import { neon } from '@neondatabase/serverless'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

const sql = neon(DATABASE_URL)

async function setup() {
  console.log('Creating tables...')

  await sql`
    CREATE TABLE IF NOT EXISTS job_listings (
      id          SERIAL PRIMARY KEY,
      title       TEXT NOT NULL,
      department  TEXT NOT NULL,
      location    TEXT NOT NULL,
      type        TEXT NOT NULL DEFAULT 'Full-time',
      description TEXT NOT NULL,
      requirements TEXT NOT NULL,
      salary_range TEXT,
      is_active   BOOLEAN NOT NULL DEFAULT true,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  console.log('✓ job_listings')

  await sql`
    CREATE TABLE IF NOT EXISTS applications (
      id                SERIAL PRIMARY KEY,
      job_id            INTEGER REFERENCES job_listings(id) ON DELETE SET NULL,
      job_title         TEXT NOT NULL,
      full_name         TEXT NOT NULL,
      email             TEXT NOT NULL,
      phone             TEXT NOT NULL,
      linkedin_url      TEXT,
      expected_salary   TEXT,
      years_experience  TEXT,
      availability      TEXT,
      cover_letter      TEXT,
      resume_url        TEXT NOT NULL,
      heard_from        TEXT,
      visa_sponsorship  TEXT,
      work_authorized   TEXT,
      start_date        TEXT,
      status            TEXT NOT NULL DEFAULT 'New',
      notes             TEXT,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  console.log('✓ applications')

  // Seed sample job listings
  const existing = await sql`SELECT COUNT(*) AS n FROM job_listings`
  if (Number(existing[0].n) === 0) {
    console.log('Seeding sample jobs...')
    await sql`
      INSERT INTO job_listings (title, department, location, type, description, requirements, salary_range) VALUES
      (
        'Senior Frontend Engineer',
        'Engineering',
        'Remote',
        'Full-time',
        'Join our product team to build fast, accessible, and beautiful user interfaces. You will own the frontend architecture of our flagship product and mentor junior engineers.',
        '5+ years React experience, TypeScript, testing culture, strong design sense',
        '$120,000 – $160,000'
      ),
      (
        'Product Designer',
        'Design',
        'New York, NY',
        'Full-time',
        'Shape the visual language of our products from concept to pixel-perfect delivery. You will collaborate daily with engineering and product leadership.',
        'Figma proficiency, 3+ years product design, portfolio showing end-to-end process',
        '$100,000 – $130,000'
      ),
      (
        'Backend Engineer',
        'Engineering',
        'Remote',
        'Full-time',
        'Build scalable APIs and data pipelines that power millions of requests per day. You will work on distributed systems, performance, and reliability.',
        'Node.js or Go, PostgreSQL, REST/GraphQL APIs, 3+ years experience',
        '$110,000 – $150,000'
      ),
      (
        'Marketing Manager',
        'Marketing',
        'San Francisco, CA',
        'Full-time',
        'Own our go-to-market strategy and drive growth across content, paid, and partnerships. You will build and manage a small team.',
        '4+ years B2B SaaS marketing, data-driven mindset, strong writer',
        '$90,000 – $120,000'
      ),
      (
        'DevOps Engineer',
        'Engineering',
        'Remote',
        'Contract',
        'Improve our CI/CD pipelines, infrastructure-as-code, and observability stack. 6-month contract with potential for full-time conversion.',
        'Terraform, AWS, Kubernetes, GitHub Actions, 4+ years DevOps',
        '$80 – $110 / hour'
      )
    `
    console.log('✓ 5 sample jobs seeded')
  } else {
    console.log('Job listings already exist — skipping seed')
  }

  console.log('\nDatabase setup complete.')
}

setup().catch(err => {
  console.error(err)
  process.exit(1)
})
