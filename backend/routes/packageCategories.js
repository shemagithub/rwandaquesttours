import { randomUUID } from 'crypto'
import { simpleGet, simpleList } from '../lib/helpers.js'

export function registerPackageCategoryRoutes(app, pool) {
  app.get('/api/package-categories', async (_req, res, next) => {
    try {
      await simpleList(pool, res, 'SELECT * FROM package_categories ORDER BY name', (r) => r)
    } catch (e) {
      next(e)
    }
  })

  app.post('/api/package-categories', async (req, res, next) => {
    try {
      const b = req.body
      const id = b.id ?? randomUUID()
      const slug =
        b.slug ??
        String(b.name)
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
      await pool.query('INSERT INTO package_categories (id, name, slug) VALUES (?, ?, ?)', [
        id,
        b.name,
        slug,
      ])
      await simpleGet(pool, res, 'SELECT * FROM package_categories WHERE id = ?', id, (r) => r)
    } catch (e) {
      next(e)
    }
  })

  app.patch('/api/package-categories/:id', async (req, res, next) => {
    try {
      const id = String(req.params.id)
      const b = req.body
      const fields = []
      const vals = []
      if (b.name !== undefined) {
        fields.push('name = ?')
        vals.push(b.name)
      }
      if (b.slug !== undefined) {
        fields.push('slug = ?')
        vals.push(b.slug)
      }
      if (!fields.length) return res.status(400).json({ error: 'No fields' })
      vals.push(id)
      await pool.query(`UPDATE package_categories SET ${fields.join(', ')} WHERE id = ?`, vals)
      await simpleGet(pool, res, 'SELECT * FROM package_categories WHERE id = ?', id, (r) => r)
    } catch (e) {
      next(e)
    }
  })

  app.delete('/api/package-categories/:id', async (req, res, next) => {
    try {
      const [r] = await pool.query('DELETE FROM package_categories WHERE id = ?', [req.params.id])
      if (!r.affectedRows) return res.status(404).json({ error: 'Not found' })
      res.status(204).send()
    } catch (e) {
      next(e)
    }
  })
}
