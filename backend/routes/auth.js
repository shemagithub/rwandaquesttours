import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'

function sanitizeRole(role) {
  const r = String(role ?? 'staff').toLowerCase()
  if (['superadmin', 'admin', 'staff'].includes(r)) return r
  return 'staff'
}

export function registerAuthRoutes(app, pool) {
  app.post('/api/auth/login', async (req, res, next) => {
    try {
      const { email, password } = req.body ?? {}
      if (!email || !password) return res.status(400).json({ error: 'Missing credentials' })

      const [rows] = await pool.query('SELECT * FROM admin_users WHERE email = ? LIMIT 1', [
        String(email).trim().toLowerCase(),
      ])
      const u = rows?.[0]
      if (!u) return res.status(401).json({ error: 'Invalid email or password' })

      const ok = await bcrypt.compare(String(password), String(u.password_hash))
      if (!ok) return res.status(401).json({ error: 'Invalid email or password' })

      const exp = Date.now() + 24 * 60 * 60 * 1000
      const token = randomUUID()
      await pool.query('INSERT INTO admin_sessions (token, admin_user_id, exp) VALUES (?, ?, ?)', [
        token,
        u.id,
        exp,
      ])

      res.json({
        accessToken: token,
        user: {
          accountNo: String(u.id).slice(0, 8).toUpperCase(),
          email: u.email,
          role: [sanitizeRole(u.role)],
          exp,
        },
      })
    } catch (e) {
      next(e)
    }
  })

  app.get('/api/auth/me', async (req, res, next) => {
    try {
      const auth = String(req.headers.authorization ?? '')
      const token = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7).trim() : ''
      if (!token) return res.status(401).json({ error: 'Missing token' })

      const [rows] = await pool.query(
        `SELECT s.exp as exp, u.id as id, u.email as email, u.role as role
         FROM admin_sessions s
         JOIN admin_users u ON u.id = s.admin_user_id
         WHERE s.token = ? LIMIT 1`,
        [token],
      )
      const r = rows?.[0]
      if (!r) return res.status(401).json({ error: 'Invalid token' })
      if (Number(r.exp) < Date.now()) return res.status(401).json({ error: 'Token expired' })

      res.json({
        user: {
          accountNo: String(r.id).slice(0, 8).toUpperCase(),
          email: r.email,
          role: [sanitizeRole(r.role)],
          exp: Number(r.exp),
        },
      })
    } catch (e) {
      next(e)
    }
  })
}

