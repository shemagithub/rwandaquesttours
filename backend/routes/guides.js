import { randomUUID } from 'crypto'
import { parseJson } from '../lib/helpers.js'

export function registerGuideRoutes(app, pool) {
  app.get('/api/tour-guides', async (_req, res, next) => {
    try {
      const [rows] = await pool.query('SELECT * FROM tour_guides ORDER BY id')
      const [bookRows] = await pool.query(
        'SELECT id, guide_id FROM bookings WHERE guide_id IS NOT NULL',
      )
      const by = {}
      for (const b of bookRows) {
        by[b.guide_id] = by[b.guide_id] ?? []
        by[b.guide_id].push(b.id)
      }
      res.json(
        rows.map((g) => ({
          id: g.id,
          userId: g.user_id,
          languages: parseJson(g.languages, []),
          bio: g.bio,
          availability: g.availability,
          activeBookingIds: by[g.id] ?? [],
          updatedAt: new Date(g.updated_at).toISOString(),
        })),
      )
    } catch (e) {
      next(e)
    }
  })

  app.post('/api/tour-guides', async (req, res, next) => {
    try {
      const b = req.body
      const id = b.id ?? randomUUID()
      await pool.query(
        `INSERT INTO tour_guides (id, user_id, languages, bio, availability) VALUES (?, ?, ?, ?, ?)`,
        [
          id,
          b.userId,
          JSON.stringify(b.languages ?? []),
          b.bio ?? '',
          b.availability ?? 'available',
        ],
      )
      const [rows] = await pool.query('SELECT * FROM tour_guides WHERE id = ?', [id])
      const g = rows[0]
      res.status(201).json({
        id: g.id,
        userId: g.user_id,
        languages: parseJson(g.languages, []),
        bio: g.bio,
        availability: g.availability,
        activeBookingIds: [],
        updatedAt: new Date(g.updated_at).toISOString(),
      })
    } catch (e) {
      next(e)
    }
  })

  app.patch('/api/tour-guides/:id', async (req, res, next) => {
    try {
      const id = String(req.params.id)
      const b = req.body
      const fields = []
      const vals = []
      if (b.userId !== undefined) {
        fields.push('user_id = ?')
        vals.push(b.userId)
      }
      if (b.languages !== undefined) {
        fields.push('languages = ?')
        vals.push(JSON.stringify(b.languages ?? []))
      }
      if (b.bio !== undefined) {
        fields.push('bio = ?')
        vals.push(b.bio)
      }
      if (b.availability !== undefined) {
        fields.push('availability = ?')
        vals.push(b.availability)
      }
      if (!fields.length) return res.status(400).json({ error: 'No fields' })
      vals.push(id)
      await pool.query(`UPDATE tour_guides SET ${fields.join(', ')} WHERE id = ?`, vals)
      const [rows] = await pool.query('SELECT * FROM tour_guides WHERE id = ?', [id])
      const g = rows[0]
      if (!g) return res.status(404).json({ error: 'Not found' })
      res.json({
        id: g.id,
        userId: g.user_id,
        languages: parseJson(g.languages, []),
        bio: g.bio,
        availability: g.availability,
        activeBookingIds: [],
        updatedAt: new Date(g.updated_at).toISOString(),
      })
    } catch (e) {
      next(e)
    }
  })

  app.delete('/api/tour-guides/:id', async (req, res, next) => {
    try {
      const [r] = await pool.query('DELETE FROM tour_guides WHERE id = ?', [req.params.id])
      if (!r.affectedRows) return res.status(404).json({ error: 'Not found' })
      res.status(204).send()
    } catch (e) {
      next(e)
    }
  })
}
