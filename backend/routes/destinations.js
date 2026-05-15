import { randomUUID } from 'crypto'
import { destinationsWithLinks } from '../lib/services.js'

export function registerDestinationRoutes(app, pool) {
  app.get('/api/destinations', async (_req, res, next) => {
    try {
      res.json(await destinationsWithLinks(pool))
    } catch (e) {
      next(e)
    }
  })

  app.post('/api/destinations', async (req, res, next) => {
    try {
      const b = req.body
      const id = b.id ?? randomUUID()
      const slug =
        b.slug ??
        String(b.name)
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
      await pool.query(
        `INSERT INTO destinations (id, name, slug, description, image_urls, lat, lng)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          b.name,
          slug,
          b.description ?? '',
          JSON.stringify(b.imageUrls ?? []),
          b.lat ?? 0,
          b.lng ?? 0,
        ],
      )
      if (Array.isArray(b.linkedPackageIds)) {
        await pool.query('DELETE FROM destination_package_links WHERE destination_id = ?', [id])
        if (b.linkedPackageIds.length) {
          const vals = []
          const sql = b.linkedPackageIds
            .map((pid) => {
              vals.push(id, pid)
              return '(?, ?)'
            })
            .join(',')
          await pool.query(
            `INSERT INTO destination_package_links (destination_id, package_id) VALUES ${sql}`,
            vals,
          )
        }
      }
      const all = await destinationsWithLinks(pool)
      res.status(201).json(all.find((d) => d.id === id))
    } catch (e) {
      next(e)
    }
  })

  app.patch('/api/destinations/:id', async (req, res, next) => {
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
      if (b.description !== undefined) {
        fields.push('description = ?')
        vals.push(b.description)
      }
      if (b.imageUrls !== undefined) {
        fields.push('image_urls = ?')
        vals.push(JSON.stringify(b.imageUrls ?? []))
      }
      if (b.lat !== undefined) {
        fields.push('lat = ?')
        vals.push(b.lat)
      }
      if (b.lng !== undefined) {
        fields.push('lng = ?')
        vals.push(b.lng)
      }
      if (fields.length) {
        vals.push(id)
        await pool.query(`UPDATE destinations SET ${fields.join(', ')} WHERE id = ?`, vals)
      }
      if (b.linkedPackageIds !== undefined) {
        await pool.query('DELETE FROM destination_package_links WHERE destination_id = ?', [id])
        if (Array.isArray(b.linkedPackageIds) && b.linkedPackageIds.length) {
          const vals2 = []
          const sql = b.linkedPackageIds
            .map((pid) => {
              vals2.push(id, pid)
              return '(?, ?)'
            })
            .join(',')
          await pool.query(
            `INSERT INTO destination_package_links (destination_id, package_id) VALUES ${sql}`,
            vals2,
          )
        }
      }
      const all = await destinationsWithLinks(pool)
      const d = all.find((x) => x.id === id)
      if (!d) return res.status(404).json({ error: 'Not found' })
      res.json(d)
    } catch (e) {
      next(e)
    }
  })

  app.delete('/api/destinations/:id', async (req, res, next) => {
    try {
      const [r] = await pool.query('DELETE FROM destinations WHERE id = ?', [req.params.id])
      if (!r.affectedRows) return res.status(404).json({ error: 'Not found' })
      res.status(204).send()
    } catch (e) {
      next(e)
    }
  })
}
