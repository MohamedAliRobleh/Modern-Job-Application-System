import { createClerkClient } from '@clerk/backend'

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

export async function requireAuth(req) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) throw new Error('Unauthorized')
  try {
    await clerk.verifyToken(token)
  } catch (err) {
    console.error('Clerk verifyToken failed:', err.message)
    throw err
  }
}
