import { randomUUID } from 'crypto'
import { simpleGet, simpleList } from '../lib/helpers.js'

function mapGallery(r) {
  return {
    id: r.id,
    url: r.url,
    type: r.type,
    category: r.category,
    caption: r.caption,
    updatedAt: new Date(r.updated_at).toISOString(),
  }
}

export function registerGalleryRoutes(app, pool) {
  app.get('/api/gallery', async (_req, res, next) => {
    try {
      await simpleList(
        pool,
        res,
        'SELECT * FROM gallery_items ORDER BY updated_at DESC',
        mapGallery,
      )
    } catch (e) {
      next(e)
    }
  })

  app.post('/api/gallery', async (req, res, next) => {
    try {
      const b = req.body
      const id = b.id ?? randomUUID()
      await pool.query(
        `INSERT INTO gallery_items (id, url, type, category, caption) VALUES (?, ?, ?, ?, ?)`,
        [id, b.url, b.type ?? 'image', b.category ?? 'other', b.caption ?? ''],
      )
      await simpleGet(pool, res, 'SELECT * FROM gallery_items WHERE id = ?', id, mapGallery)
    } catch (e) {
      next(e)
    }
  })

  app.patch('/api/gallery/:id', async (req, res, next) => {
    try {
      const id = String(req.params.id)
      const b = req.body
      const fields = []
      const vals = []
      if (b.url !== undefined) {
        fields.push('url = ?')
        vals.push(b.url)
      }
      if (b.type !== undefined) {
        fields.push('type = ?')
        vals.push(b.type)
      }
      if (b.category !== undefined) {
        fields.push('category = ?')
        vals.push(b.category)
      }
      if (b.caption !== undefined) {
        fields.push('caption = ?')
        vals.push(b.caption)
      }
      if (!fields.length) return res.status(400).json({ error: 'No fields' })
      vals.push(id)
      await pool.query(`UPDATE gallery_items SET ${fields.join(', ')} WHERE id = ?`, vals)
      await simpleGet(pool, res, 'SELECT * FROM gallery_items WHERE id = ?', id, mapGallery)
    } catch (e) {
      next(e)
    }
  })

  app.delete('/api/gallery/:id', async (req, res, next) => {
    try {
      const [r] = await pool.query('DELETE FROM gallery_items WHERE id = ?', [req.params.id])
      if (!r.affectedRows) return res.status(404).json({ error: 'Not found' })
      res.status(204).send()
    } catch (e) {
      next(e)
    }
  })
}
