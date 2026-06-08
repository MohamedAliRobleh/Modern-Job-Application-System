import { put } from '@vercel/blob'
import Busboy from 'busboy'

export const config = { api: { bodyParser: false } }

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const MAX_SIZE = 5 * 1024 * 1024

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  return new Promise((resolve) => {
    const bb = Busboy({ headers: req.headers })
    let fileReceived = false
    let uploadDone = false

    bb.on('file', async (fieldname, stream, info) => {
      fileReceived = true
      const { filename, mimeType } = info

      if (!ALLOWED_TYPES.includes(mimeType)) {
        stream.resume()
        res.status(400).json({ error: 'Only PDF, DOC, and DOCX files are allowed' })
        return resolve()
      }

      const chunks = []
      let size = 0

      stream.on('data', chunk => {
        size += chunk.length
        if (size > MAX_SIZE) {
          stream.destroy()
          if (!res.writableEnded) {
            res.status(400).json({ error: 'File must be 5MB or smaller' })
          }
          resolve()
          return
        }
        chunks.push(chunk)
      })

      stream.on('end', async () => {
        if (res.writableEnded) return
        const buffer = Buffer.concat(chunks)
        const safeName = (filename || 'upload').replace(/[^a-zA-Z0-9.\-_]/g, '-')
        try {
          const blob = await put(`resumes/${Date.now()}-${safeName}`, buffer, {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN,
            contentType: mimeType,
          })
          uploadDone = true
          res.json({ url: blob.url })
        } catch (err) {
          console.error('Upload failed:', err)
          if (!res.writableEnded) res.status(500).json({ error: 'Upload failed' })
        } finally {
          resolve()
        }
      })
    })

    bb.on('finish', () => {
      if (!fileReceived && !res.writableEnded) {
        res.status(400).json({ error: 'No file provided' })
        resolve()
      }
    })

    req.pipe(bb)
  })
}
