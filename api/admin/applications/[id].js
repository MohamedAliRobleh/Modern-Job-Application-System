// api/admin/applications/[id].js
import { neon } from '@neondatabase/serverless'
import { TransactionalEmailsApi, SendSmtpEmail, ApiClient } from '@getbrevo/brevo'
import { requireAuth } from '../../_auth.js'

function getBrevoClient() {
  ApiClient.instance.authentications['api-key'].apiKey = process.env.BREVO_API_KEY
  return TransactionalEmailsApi()
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
