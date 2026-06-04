// api/applications/index.js
import { neon } from '@neondatabase/serverless'
import { TransactionalEmailsApi, SendSmtpEmail, ApiClient } from '@getbrevo/brevo'

function getBrevoClient() {
  ApiClient.instance.authentications['api-key'].apiKey = process.env.BREVO_API_KEY
  return TransactionalEmailsApi()
}

async function sendEmail(api, { to, subject, html }) {
  const email = new SendSmtpEmail()
  email.to = [{ email: to }]
  email.subject = subject
  email.htmlContent = html
  email.sender = { email: 'noreply@careers.com', name: process.env.VITE_ORG_NAME || 'Careers' }
  await api.sendTransacEmail(email)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const {
    job_id, job_title, full_name, email, phone,
    linkedin_url, expected_salary, years_experience,
    availability, cover_letter, resume_url,
    heard_from, visa_sponsorship, work_authorized, start_date,
  } = req.body

  if (!full_name || !email || !phone || !job_title || !resume_url) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const sql = neon(process.env.DATABASE_URL)
    const rows = await sql`
      INSERT INTO applications (
        job_id, job_title, full_name, email, phone, linkedin_url,
        expected_salary, years_experience, availability, cover_letter,
        resume_url, heard_from, visa_sponsorship, work_authorized, start_date
      ) VALUES (
        ${job_id || null}, ${job_title}, ${full_name}, ${email}, ${phone},
        ${linkedin_url || null}, ${expected_salary || null}, ${years_experience || null},
        ${availability || null}, ${cover_letter || null}, ${resume_url},
        ${heard_from || null}, ${visa_sponsorship || null}, ${work_authorized || null},
        ${start_date || null}
      )
      RETURNING id, tracking_token
    `

    const orgName = process.env.VITE_ORG_NAME || 'Our Company'
    const hrEmail = process.env.VITE_HR_EMAIL
    const baseUrl = process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')
    const trackingUrl = baseUrl ? `${baseUrl}/track/${rows[0].tracking_token}` : null
    const brevo = getBrevoClient()
    const date = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })

    await sendEmail(brevo, {
      to: email,
      subject: `✅ Application Received — ${job_title} at ${orgName}`,
      html: `
        <h2>Thank you, ${full_name}!</h2>
        <p>We've received your application for <strong>${job_title}</strong> at ${orgName}.</p>
        <p><strong>Submitted:</strong> ${date}</p>
        ${trackingUrl ? `<p><a href="${trackingUrl}" style="display:inline-block;background:#2563eb;color:white;padding:10px 20px;border-radius:6px;text-decoration:none">Track Your Application →</a></p>` : ''}
        <p>Our team reviews applications within 5–10 business days.</p>
        <p>Best regards,<br/>${orgName} Recruiting Team</p>
      `,
    })

    if (hrEmail) {
      await sendEmail(brevo, {
        to: hrEmail,
        subject: `🔔 New Application — ${job_title} from ${full_name}`,
        html: `
          <h2>New Application Received</h2>
          <table style="border-collapse:collapse;width:100%">
            <tr><td style="padding:8px;border:1px solid #e2e8f0"><strong>Name</strong></td><td style="padding:8px;border:1px solid #e2e8f0">${full_name}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e2e8f0"><strong>Email</strong></td><td style="padding:8px;border:1px solid #e2e8f0">${email}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e2e8f0"><strong>Phone</strong></td><td style="padding:8px;border:1px solid #e2e8f0">${phone}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e2e8f0"><strong>Position</strong></td><td style="padding:8px;border:1px solid #e2e8f0">${job_title}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e2e8f0"><strong>Resume</strong></td><td style="padding:8px;border:1px solid #e2e8f0"><a href="${resume_url}">Download</a></td></tr>
            ${cover_letter ? `<tr><td style="padding:8px;border:1px solid #e2e8f0"><strong>Cover Letter</strong></td><td style="padding:8px;border:1px solid #e2e8f0">${cover_letter.slice(0, 500)}${cover_letter.length > 500 ? '…' : ''}</td></tr>` : ''}
          </table>
        `,
      })
    }

    res.json({ id: rows[0].id, tracking_token: rows[0].tracking_token })
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
}
