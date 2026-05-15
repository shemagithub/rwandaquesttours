import { randomUUID } from 'crypto'
import { simpleGet, simpleList } from '../lib/helpers.js'

function mapReview(r) {
  return {
    id: r.id,
    userId: r.user_id,
    packageId: r.package_id,
    rating: r.rating,
    comment: r.comment,
    status: r.status,
    featured: !!r.featured,
    createdAt: new Date(r.created_at).toISOString(),
  }
}

export function registerReviewRoutes(app, pool) {
  app.get('/api/reviews', async (_req, res, next) => {
    try {
      await simpleList(pool, res, 'SELECT * FROM reviews ORDER BY created_at DESC', mapReview)
    } catch (e) {
      next(e)
    }
  })

  app.post('/api/reviews', async (req, res, next) => {
    try {
      const b = req.body
      const id = b.id ?? randomUUID()
      await pool.query(
        `INSERT INTO reviews (id, user_id, package_id, rating, comment, status, featured)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          b.userId,
          b.packageId,
          b.rating,
          b.comment,
          b.status ?? 'pending',
          b.featured ? 1 : 0,
        ],
      )
      await simpleGet(pool, res, 'SELECT * FROM reviews WHERE id = ?', id, mapReview)
    } catch (e) {
      next(e)
    }
  })

  app.patch('/api/reviews/:id', async (req, res, next) => {
    try {
      const id = String(req.params.id)
      const b = req.body
      const fields = []
      const vals = []
      if (b.rating !== undefined) {
        fields.push('rating = ?')
        vals.push(b.rating)
      }
      if (b.comment !== undefined) {
        fields.push('comment = ?')
        vals.push(b.comment)
      }
      if (b.status !== undefined) {
        fields.push('status = ?')
        vals.push(b.status)
      }
      if (b.featured !== undefined) {
        fields.push('featured = ?')
        vals.push(b.featured ? 1 : 0)
      }
      if (!fields.length) return res.status(400).json({ error: 'No fields' })
      vals.push(id)
      await pool.query(`UPDATE reviews SET ${fields.join(', ')} WHERE id = ?`, vals)
      await simpleGet(pool, res, 'SELECT * FROM reviews WHERE id = ?', id, mapReview)
    } catch (e) {
      next(e)
    }
  })

  app.delete('/api/reviews/:id', async (req, res, next) => {
    try {
      const [r] = await pool.query('DELETE FROM reviews WHERE id = ?', [req.params.id])
      if (!r.affectedRows) return res.status(404).json({ error: 'Not found' })
      res.status(204).send()
    } catch (e) {
      next(e)
    }
  })
}
