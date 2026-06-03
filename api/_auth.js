import { createClerkClient } from '@clerk/backend'

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

export async function requireAuth(req) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) throw new Error('Unauthorized')
  await clerk.verifyToken(token)
}
