import { randomUUID } from 'crypto'
import { parseJson, simpleGet, simpleList } from '../lib/helpers.js'

export function registerExtraRoutes(app, pool) {
  app.get('/api/activity-logs', async (_req, res, next) => {
    try {
      await simpleList(
        pool,
        res,
        'SELECT * FROM activity_logs ORDER BY at DESC LIMIT 500',
        (r) => ({
          id: r.id,
          actor: r.actor,
          action: r.action,
          entity: r.entity,
          at: new Date(r.at).toISOString(),
        }),
      )
    } catch (e) {
      next(e)
    }
  })

  app.post('/api/activity-logs', async (req, res, next) => {
    try {
      const b = req.body
      const id = b.id ?? randomUUID()
      await pool.query(
        `INSERT INTO activity_logs (id, actor, action, entity, at) VALUES (?, ?, ?, ?, ?)`,
        [id, b.actor, b.action, b.entity, b.at ? new Date(b.at) : new Date()],
      )
      await simpleGet(pool, res, 'SELECT * FROM activity_logs WHERE id = ?', id, (r) => ({
        id: r.id,
        actor: r.actor,
        action: r.action,
        entity: r.entity,
        at: new Date(r.at).toISOString(),
      }))
    } catch (e) {
      next(e)
    }
  })

  app.get('/api/admin-notifications', async (_req, res, next) => {
    try {
      await simpleList(
        pool,
        res,
        'SELECT * FROM admin_notifications ORDER BY created_at DESC',
        (r) => ({
          id: r.id,
          type: r.type,
          title: r.title,
          read: !!r.read_flag,
          createdAt: new Date(r.created_at).toISOString(),
        }),
      )
    } catch (e) {
      next(e)
    }
  })

  app.post('/api/admin-notifications', async (req, res, next) => {
    try {
      const b = req.body
      const id = b.id ?? randomUUID()
      await pool.query(
        `INSERT INTO admin_notifications (id, type, title, read_flag) VALUES (?, ?, ?, ?)`,
        [id, b.type ?? 'system', b.title, b.read ? 1 : 0],
      )
      await simpleGet(
        pool,
        res,
        'SELECT * FROM admin_notifications WHERE id = ?',
        id,
        (r) => ({
          id: r.id,
          type: r.type,
          title: r.title,
          read: !!r.read_flag,
          createdAt: new Date(r.created_at).toISOString(),
        }),
      )
    } catch (e) {
      next(e)
    }
  })

  app.patch('/api/admin-notifications/:id', async (req, res, next) => {
    try {
      const id = String(req.params.id)
      const b = req.body
      const fields = []
      const vals = []
      if (b.read !== undefined) {
        fields.push('read_flag = ?')
        vals.push(b.read ? 1 : 0)
      }
      if (b.title !== undefined) {
        fields.push('title = ?')
        vals.push(b.title)
      }
      if (!fields.length) return res.status(400).json({ error: 'No fields' })
      vals.push(id)
      await pool.query(`UPDATE admin_notifications SET ${fields.join(', ')} WHERE id = ?`, vals)
      await simpleGet(
        pool,
        res,
        'SELECT * FROM admin_notifications WHERE id = ?',
        id,
        (r) => ({
          id: r.id,
          type: r.type,
          title: r.title,
          read: !!r.read_flag,
          createdAt: new Date(r.created_at).toISOString(),
        }),
      )
    } catch (e) {
      next(e)
    }
  })

  app.post('/api/admin-notifications/mark-all-read', async (_req, res, next) => {
    try {
      await pool.query('UPDATE admin_notifications SET read_flag = 1')
      const [rows] = await pool.query(
        'SELECT * FROM admin_notifications ORDER BY created_at DESC',
      )
      res.json(
        rows.map((r) => ({
          id: r.id,
          type: r.type,
          title: r.title,
          read: !!r.read_flag,
          createdAt: new Date(r.created_at).toISOString(),
        })),
      )
    } catch (e) {
      next(e)
    }
  })

  app.get('/api/monthly-metrics', async (_req, res, next) => {
    try {
      await simpleList(
        pool,
        res,
        'SELECT * FROM monthly_metrics ORDER BY sort_order ASC, month_label ASC',
        (r) => ({
          month: r.month_label,
          bookings: r.bookings,
          revenueRwf: Number(r.revenue_rwf),
        }),
      )
    } catch (e) {
      next(e)
    }
  })

  app.get('/api/role-definitions', async (_req, res, next) => {
    try {
      await simpleList(pool, res, 'SELECT * FROM role_definitions ORDER BY id', (r) => ({
        id: r.id,
        label: r.label,
        permissions: parseJson(r.permissions, []),
      }))
    } catch (e) {
      next(e)
    }
  })

  app.put('/api/role-definitions', async (req, res, next) => {
    const list = req.body
    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()
      await conn.query('DELETE FROM role_definitions')
      for (const r of list) {
        await conn.query('INSERT INTO role_definitions (id, label, permissions) VALUES (?, ?, ?)', [
          r.id,
          r.label,
          JSON.stringify(r.permissions ?? []),
        ])
      }
      await conn.commit()
      const [rows] = await pool.query('SELECT * FROM role_definitions ORDER BY id')
      res.json(
        rows.map((r) => ({
          id: r.id,
          label: r.label,
          permissions: parseJson(r.permissions, []),
        })),
      )
    } catch (e) {
      await conn.rollback()
      next(e)
    } finally {
      conn.release()
    }
  })

  app.get('/api/site-settings', async (_req, res, next) => {
    try {
      const [rows] = await pool.query(
        'SELECT payload FROM site_settings WHERE singleton = 1 LIMIT 1',
      )
      const payload = parseJson(rows[0]?.payload, {})
      res.json(payload)
    } catch (e) {
      next(e)
    }
  })

  app.patch('/api/site-settings', async (req, res, next) => {
    try {
      const patch = req.body
      const [rows] = await pool.query(
        'SELECT payload FROM site_settings WHERE singleton = 1 LIMIT 1',
      )
      const current = parseJson(rows[0]?.payload, {})
      const nextPayload = { ...current, ...patch }
      await pool.query('UPDATE site_settings SET payload = ? WHERE singleton = 1', [
        JSON.stringify(nextPayload),
      ])
      res.json(nextPayload)
    } catch (e) {
      next(e)
    }
  })

  app.get('/api/admin-settings', async (_req, res, next) => {
    try {
      const [rows] = await pool.query(
        'SELECT payload FROM admin_settings WHERE singleton = 1 LIMIT 1',
      )
      const payload = parseJson(rows[0]?.payload, {})
      res.json(payload)
    } catch (e) {
      next(e)
    }
  })

  app.patch('/api/admin-settings', async (req, res, next) => {
    try {
      const patch = req.body
      const [rows] = await pool.query(
        'SELECT payload FROM admin_settings WHERE singleton = 1 LIMIT 1',
      )
      const current = parseJson(rows[0]?.payload, {})
      const nextPayload = { ...current, ...patch }
      await pool.query('UPDATE admin_settings SET payload = ? WHERE singleton = 1', [
        JSON.stringify(nextPayload),
      ])
      res.json(nextPayload)
    } catch (e) {
      next(e)
    }
  })
}
