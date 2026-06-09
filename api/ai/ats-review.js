import { neon } from '@neondatabase/serverless'
import Anthropic from '@anthropic-ai/sdk'
import { requireAuth } from '../_auth.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try { await requireAuth(req) } catch { return res.status(401).json({ error: 'Unauthorized' }) }

  const { applicationId } = req.body
  if (!applicationId) return res.status(400).json({ error: 'applicationId required' })

  const sql = neon(process.env.DATABASE_URL)

  const apps = await sql`
    SELECT id, job_id, job_title, full_name, email, years_experience, availability,
           expected_salary, cover_letter, resume_url, work_authorized, visa_sponsorship
    FROM applications WHERE id = ${applicationId}
  `
  if (!apps.length) return res.status(404).json({ error: 'Not found' })
  const app = apps[0]

  const jobs = await sql`
    SELECT title, department, location, type, description, requirements, salary_range
    FROM job_listings WHERE id = ${app.job_id}
  `
  const job = jobs[0] || { title: app.job_title, department: '', location: '', type: '', description: '', requirements: '', salary_range: '' }

  // Build message content — attach PDF resume if available
  const content = []
  let resumeNote = 'No resume uploaded.'

  if (app.resume_url) {
    if (app.resume_url.toLowerCase().includes('.pdf')) {
      try {
        const resp = await fetch(app.resume_url)
        if (resp.ok) {
          const data = Buffer.from(await resp.arrayBuffer()).toString('base64')
          content.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data } })
          resumeNote = 'Resume attached as PDF above — analyze it carefully.'
        }
      } catch { resumeNote = 'Resume PDF could not be fetched.' }
    } else {
      resumeNote = 'Resume uploaded (non-PDF format, not directly readable).'
    }
  }

  content.push({
    type: 'text',
    text: `You are a senior technical recruiter and ATS expert. Evaluate this job application rigorously.

JOB POSTING
Title: ${job.title}
Department: ${job.department}
Location: ${job.location}
Type: ${job.type}
Description: ${job.description}
Requirements: ${job.requirements}
Salary Range: ${job.salary_range}

CANDIDATE
Name: ${app.full_name}
Years of Experience: ${app.years_experience || 'Not specified'}
Availability: ${app.availability || 'Not specified'}
Expected Salary: ${app.expected_salary || 'Not specified'}
Work Authorized: ${app.work_authorized || 'Not specified'}
Visa Sponsorship Needed: ${app.visa_sponsorship || 'Not specified'}
Cover Letter: ${app.cover_letter || 'Not provided'}
Resume: ${resumeNote}

Return ONLY a valid JSON object — no markdown fences, no explanation, just the JSON:
{
  "score": <integer 0-100>,
  "recommendation": <"STRONG HIRE" | "HIRE" | "MAYBE" | "NO HIRE">,
  "summary": "<2-3 sentence executive summary of this candidate>",
  "matched_keywords": ["<matched skill or keyword>"],
  "missing_keywords": ["<important skill or requirement missing>"],
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "concerns": ["<concern or red flag>"],
  "interview_questions": ["<tailored question 1>", "<tailored question 2>", "<tailored question 3>"]
}`,
  })

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content }],
    })

    const raw = message.content[0].text.trim().replace(/^```json?\n?/, '').replace(/\n?```$/, '')
    return res.json(JSON.parse(raw))
  } catch (err) {
    return res.status(500).json({ error: 'AI analysis failed', detail: err.message })
  }
}
