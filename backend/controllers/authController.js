import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { signToken, verifyToken } from '../utils/jwt.js'

const VALID_ROLES = ['customer', 'admin']

export async function register(req, res) {
  try {
    const { email, password, name, role } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' })
    }
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: 'Role must be "customer" or "admin"' })
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' })
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ email, password: hashed, name, role })

    const token = signToken({ id: user._id, role: user.role })
    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
    })
  } catch {
    res.status(500).json({ error: 'Registration failed' })
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = signToken({ id: user._id, role: user.role })
    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
    })
  } catch {
    res.status(500).json({ error: 'Login failed' })
  }
}

export async function getMe(req, res) {
  try {
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    const token = header.split(' ')[1]
    const decoded = verifyToken(token)
    const user = await User.findById(decoded.id)
    if (!user) return res.status(401).json({ error: 'User not found' })
    res.json({ id: user._id, email: user.email, name: user.name, role: user.role })
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
