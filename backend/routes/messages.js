import { randomUUID } from 'crypto'
import { simpleGet, simpleList } from '../lib/helpers.js'

function mapMsg(r) {
  return {
    id: r.id,
    source: r.source,
    name: r.name,
    email: r.email,
    subject: r.subject,
    body: r.body,
    read: !!r.read_flag,
    createdAt: new Date(r.created_at).toISOString(),
  }
}

export function registerMessageRoutes(app, pool) {
  app.get('/api/messages', async (_req, res, next) => {
    try {
      await simpleList(
        pool,
        res,
        'SELECT * FROM message_threads ORDER BY created_at DESC',
        mapMsg,
      )
    } catch (e) {
      next(e)
    }
  })

  app.post('/api/messages', async (req, res, next) => {
    try {
      const b = req.body
      const id = b.id ?? randomUUID()
      await pool.query(
        `INSERT INTO message_threads (id, source, name, email, subject, body, read_flag)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, b.source, b.name, b.email, b.subject, b.body, b.read ? 1 : 0],
      )
      await simpleGet(pool, res, 'SELECT * FROM message_threads WHERE id = ?', id, mapMsg)
    } catch (e) {
      next(e)
    }
  })

  app.patch('/api/messages/:id', async (req, res, next) => {
    try {
      const id = String(req.params.id)
      const b = req.body
      const fields = []
      const vals = []
      if (b.read !== undefined) {
        fields.push('read_flag = ?')
        vals.push(b.read ? 1 : 0)
      }
      if (b.subject !== undefined) {
        fields.push('subject = ?')
        vals.push(b.subject)
      }
      if (b.body !== undefined) {
        fields.push('body = ?')
        vals.push(b.body)
      }
      if (!fields.length) return res.status(400).json({ error: 'No fields' })
      vals.push(id)
      await pool.query(`UPDATE message_threads SET ${fields.join(', ')} WHERE id = ?`, vals)
      await simpleGet(pool, res, 'SELECT * FROM message_threads WHERE id = ?', id, mapMsg)
    } catch (e) {
      next(e)
    }
  })

  app.delete('/api/messages/:id', async (req, res, next) => {
    try {
      const [r] = await pool.query('DELETE FROM message_threads WHERE id = ?', [req.params.id])
      if (!r.affectedRows) return res.status(404).json({ error: 'Not found' })
      res.status(204).send()
    } catch (e) {
      next(e)
    }
  })
}
