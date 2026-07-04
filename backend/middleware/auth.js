import { verifyToken } from '../utils/jwt.js'
import { User } from '../models/User.js'

/**
 * Express middleware that verifies the JWT from the Authorization header
 * and attaches the decoded user to req.user.
 */
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    const token = header.split(' ')[1]
    const decoded = verifyToken(token)
    const user = await User.findById(decoded.id)
    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }
    req.user = user
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

/**
 * Middleware that only allows access to users with role 'admin'.
 * Must be used after requireAuth.
 */
export function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}
