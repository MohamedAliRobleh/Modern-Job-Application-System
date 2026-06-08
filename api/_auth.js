import { verifyToken } from '@clerk/backend'

export async function requireAuth(req) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) throw new Error('Unauthorized')
  await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY })
}
