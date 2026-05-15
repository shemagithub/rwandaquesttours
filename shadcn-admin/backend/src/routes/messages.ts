import { Router } from 'express'
import { randomUUID } from 'crypto'
import { pool } from '../db.js'
import { asyncHandler } from '../middleware/async-handler.js'

function mapMsg(r: {
  id: string
  source: string
  name: string
  email: string
  subject: string
  body: string
  read_flag: number
  created_at: Date
}) {
  return {
    id: r.id,
    source: r.source,
    name: r.name,
    email: r.email,
    subject: r.subject,
    body: r.body,
    read: !!r.read_flag,
    createdAt: r.created_at.toISOString(),
  }
}

const router = Router()

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const [rows] = await pool.query(
      'SELECT * FROM message_threads ORDER BY created_at DESC'
    )
    res.json((rows as Parameters<typeof mapMsg>[0][]).map(mapMsg))
  })
)

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
      'SELECT * FROM message_threads WHERE id = ?',
      [req.params.id]
    )
    const r = (rows as Parameters<typeof mapMsg>[0][])[0]
    if (!r) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    res.json(mapMsg(r))
  })
)

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const b = req.body as {
      id?: string
      source: string
      name: string
      email: string
      subject: string
      body: string
      read?: boolean
    }
    const id = b.id ?? randomUUID()
    await pool.query(
      `INSERT INTO message_threads (id, source, name, email, subject, body, read_flag)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        b.source,
        b.name,
        b.email,
        b.subject,
        b.body,
        b.read ? 1 : 0,
      ]
    )
    const [rows] = await pool.query(
      'SELECT * FROM message_threads WHERE id = ?',
      [id]
    )
    res.status(201).json(mapMsg((rows as Parameters<typeof mapMsg>[0][])[0]))
  })
)

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const b = req.body as Partial<{
      read: boolean
      subject: string
      body: string
    }>
    const fields: string[] = []
    const vals: unknown[] = []
    if (b.read !== undefined) {
      fields.push('read_flag = ?')
      vals.push(b.read ? 1 : 0)
    }
    if (b.subject != null) {
      fields.push('subject = ?')
      vals.push(b.subject)
    }
    if (b.body != null) {
      fields.push('body = ?')
      vals.push(b.body)
    }
    if (!fields.length) {
      res.status(400).json({ error: 'No fields' })
      return
    }
    vals.push(req.params.id)
    await pool.query(
      `UPDATE message_threads SET ${fields.join(', ')} WHERE id = ?`,
      vals
    )
    const [rows] = await pool.query(
      'SELECT * FROM message_threads WHERE id = ?',
      [req.params.id]
    )
    const r = (rows as Parameters<typeof mapMsg>[0][])[0]
    if (!r) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    res.json(mapMsg(r))
  })
)

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const [r] = await pool.query(
      'DELETE FROM message_threads WHERE id = ?',
      [req.params.id]
    )
    if (!(r as { affectedRows: number }).affectedRows) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    res.status(204).send()
  })
)

export default router
