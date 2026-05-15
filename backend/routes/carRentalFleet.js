import { randomUUID } from 'crypto'
import { parseJson, simpleGet, simpleList } from '../lib/helpers.js'

const DEFAULT_SEED_ROWS = [
  {
    slug: 'economy',
    title: 'Economy',
    badge: 'City & airport',
    blurb: 'Ideal for Kigali city runs, meetings, and short transfers.',
    daily_price_usd: 35,
    specs_json: [
      { icon: 'bi-people', text: '4 seats' },
      { icon: 'bi-suitcase2', text: '2 bags' },
      { icon: 'bi-fuel-pump', text: 'Petrol, efficient' },
      { icon: 'bi-gear', text: 'Manual / Auto' },
    ],
    image_url: '',
    sort_order: 10,
  },
  {
    slug: 'suv',
    title: 'Compact SUV',
    badge: 'Family & comfort',
    blurb: 'Room for family luggage and lake or park drives in comfort.',
    daily_price_usd: 75,
    specs_json: [
      { icon: 'bi-people', text: '5 seats' },
      { icon: 'bi-suitcase2', text: '4 bags' },
      { icon: 'bi-moon-stars', text: 'A/C, elevated ride' },
      { icon: 'bi-shield-check', text: 'Full safety kit' },
    ],
    image_url: '',
    sort_order: 20,
  },
  {
    slug: 'fourbyfour',
    title: '4×4 Safari',
    badge: 'Safari & parks',
    blurb: 'Built for Volcanoes, Akagera, and Nyungwe access roads.',
    daily_price_usd: 120,
    specs_json: [
      { icon: 'bi-people', text: '5–7 seats' },
      { icon: 'bi-tree', text: 'Wildlife & unpaved roads' },
      { icon: 'bi-cloud-rain', text: 'All-weather capable' },
      { icon: 'bi-wrench-adjustable', text: 'Spare & tools included' },
    ],
    image_url: '',
    sort_order: 30,
  },
  {
    slug: 'luxury',
    title: 'Luxury SUV',
    badge: 'Executive',
    blurb: 'Business delegations, VIP airport pickups, and bespoke itineraries.',
    daily_price_usd: 180,
    specs_json: [
      { icon: 'bi-people', text: '4–5 seats' },
      { icon: 'bi-star', text: 'Leather, premium sound' },
      { icon: 'bi-person-badge', text: 'Chauffeur available' },
      { icon: 'bi-airplane', text: 'VIP airport meet' },
    ],
    image_url: '',
    sort_order: 40,
  },
]

function toIsoTs(v) {
  if (v == null || v === '')
    return new Date().toISOString()
  const t = new Date(v).getTime()
  return Number.isFinite(t) ? new Date(t).toISOString() : new Date().toISOString()
}

export function mapCarRentalVehicle(r) {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    badge: r.badge,
    blurb: r.blurb ?? '',
    dailyPriceUsd: Number(r.daily_price_usd),
    specs: parseJson(r.specs_json, []),
    imageUrl: r.image_url ?? '',
    active: !!r.active_flag,
    sortOrder: Number(r.sort_order ?? 0),
    updatedAt: toIsoTs(r.updated_at),
  }
}

export async function ensureCarRentalVehiclesTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS car_rental_vehicles (
      id VARCHAR(36) PRIMARY KEY,
      slug VARCHAR(64) NOT NULL,
      title VARCHAR(255) NOT NULL,
      badge VARCHAR(255) NOT NULL DEFAULT '',
      blurb TEXT NOT NULL DEFAULT '',
      daily_price_usd DECIMAL(12, 2) NOT NULL DEFAULT 0,
      specs_json JSON NOT NULL,
      image_url VARCHAR(2048) NOT NULL DEFAULT '',
      active_flag TINYINT(1) NOT NULL DEFAULT 1,
      sort_order INT NOT NULL DEFAULT 0,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uk_car_rental_vehicles_slug (slug)
    )
  `)

  try {
    await pool.query(`
      ALTER TABLE car_rental_vehicles
      ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    `)
  } catch (e) {
    const code = String(e?.code ?? '')
    const dupCol =
      code === 'ER_DUP_FIELDNAME' ||
      e?.errno === 1060 ||
      String(e?.sqlMessage ?? '').toLowerCase().includes('duplicate column')
    if (!dupCol) console.warn('[car-rental-vehicles] alter updated_at skipped:', code || e?.message)
  }

  const [countRows] = await pool.query(
    'SELECT COUNT(*) AS n FROM car_rental_vehicles',
  )
  if (Number(countRows[0]?.n) > 0) return

  for (const row of DEFAULT_SEED_ROWS) {
    await pool.query(
      `INSERT INTO car_rental_vehicles (
        id, slug, title, badge, blurb, daily_price_usd, specs_json, image_url, active_flag, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [
        randomUUID(),
        row.slug,
        row.title,
        row.badge,
        row.blurb,
        row.daily_price_usd,
        JSON.stringify(row.specs_json),
        row.image_url,
        row.sort_order,
      ],
    )
  }
}

export function registerCarRentalFleetRoutes(app, pool) {
  app.get('/api/car-rental-vehicles/summary', async (_req, res, next) => {
    try {
      const [[tot]] = await pool.query(
        `SELECT COUNT(*) AS total,
         SUM(CASE WHEN active_flag = 1 THEN 1 ELSE 0 END) AS active,
         SUM(CASE WHEN active_flag = 0 THEN 1 ELSE 0 END) AS inactive
         FROM car_rental_vehicles`,
      )
      res.json({
        total: Number(tot?.total ?? 0),
        active: Number(tot?.active ?? 0),
        inactive: Number(tot?.inactive ?? 0),
      })
    } catch (e) {
      next(e)
    }
  })

  app.get('/api/car-rental-vehicles/catalog', async (_req, res, next) => {
    try {
      await simpleList(
        pool,
        res,
        'SELECT * FROM car_rental_vehicles WHERE active_flag = 1 ORDER BY sort_order ASC, title ASC',
        mapCarRentalVehicle,
      )
    } catch (e) {
      next(e)
    }
  })

  app.get('/api/car-rental-vehicles', async (req, res, next) => {
    try {
      const q = req.query
      let sql = 'SELECT * FROM car_rental_vehicles WHERE 1=1'
      const vals = []
      if (q.active === 'true' || q.active === '1') {
        sql += ' AND active_flag = 1'
      } else if (q.active === 'false' || q.active === '0') {
        sql += ' AND active_flag = 0'
      }
      if (q.q && String(q.q).trim()) {
        const qq = `%${String(q.q).trim()}%`
        sql +=
          ' AND (title LIKE ? OR slug LIKE ? OR badge LIKE ? OR blurb LIKE ? OR COALESCE(image_url, "") LIKE ?)'
        vals.push(qq, qq, qq, qq, qq)
      }
      sql += ' ORDER BY sort_order ASC, title ASC'
      const limit = Math.min(Math.max(Number(q.limit) || 500, 1), 500)
      sql += ' LIMIT ?'
      vals.push(limit)
      const [rows] = await pool.query(sql, vals)
      res.json(rows.map(mapCarRentalVehicle))
    } catch (e) {
      next(e)
    }
  })

  app.post('/api/car-rental-vehicles/:id/duplicate', async (req, res, next) => {
    try {
      const id = String(req.params.id)
      const [existing] = await pool.query('SELECT * FROM car_rental_vehicles WHERE id = ?', [id])
      const row = existing[0]
      if (!row) return res.status(404).json({ error: 'Not found' })

      let slug = `${String(row.slug).slice(0, 40)}-copy-${randomUUID().slice(0, 6)}`.toLowerCase()
      slug = slug.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')
      if (!/^[a-z0-9-]{1,64}$/.test(slug)) slug = `copy-${randomUUID().slice(0, 13)}`

      const nid = randomUUID()
      let specsSrc = row.specs_json
      let specsArr
      if (typeof specsSrc === 'string') specsArr = parseJson(specsSrc, [])
      else if (Array.isArray(specsSrc)) specsArr = specsSrc
      else specsArr = parseJson(specsSrc, [])
      const specs = JSON.stringify(Array.isArray(specsArr) ? specsArr : [])
      await pool.query(
        `INSERT INTO car_rental_vehicles (
          id, slug, title, badge, blurb, daily_price_usd, specs_json, image_url, active_flag, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nid,
          slug,
          `${String(row.title).trim()} (copy)`,
          String(row.badge ?? '').trim(),
          String(row.blurb ?? '').trim(),
          Number(row.daily_price_usd),
          specs,
          String(row.image_url ?? '').trim(),
          0,
          Number(row.sort_order ?? 0) + 5,
        ],
      )
      const [ins] = await pool.query('SELECT * FROM car_rental_vehicles WHERE id = ?', [nid])
      res.status(201).json(mapCarRentalVehicle(ins[0]))
    } catch (e) {
      next(e)
    }
  })

  app.post('/api/car-rental-vehicles', async (req, res, next) => {
    try {
      const b = req.body ?? {}
      const slug = String(b.slug ?? '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
      if (!slug || !/^[a-z0-9-]{1,64}$/.test(slug)) {
        return res.status(400).json({ error: 'Valid slug required (lowercase letters, numbers, hyphen)' })
      }
      const title = String(b.title ?? '').trim()
      if (!title) return res.status(400).json({ error: 'Title is required' })
      const id = b.id ?? randomUUID()
      const specs =
        Array.isArray(b.specs) && b.specs.length ? b.specs : [{ icon: 'bi-info-circle', text: 'See description' }]
      const rawUsd = Number(b.dailyPriceUsd ?? 0)
      const dailyUsd =
        Number.isFinite(rawUsd) && rawUsd >= 0 ? Math.min(rawUsd, 999999999.99) : 0
      const sortN = Number(b.sortOrder ?? 0)
      const img = String(b.imageUrl ?? '').trim().slice(0, 2048)

      await pool.query(
        `INSERT INTO car_rental_vehicles (
          id, slug, title, badge, blurb, daily_price_usd, specs_json, image_url, active_flag, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          slug,
          title,
          String(b.badge ?? '').trim(),
          String(b.blurb ?? '').trim(),
          dailyUsd,
          JSON.stringify(specs),
          img,
          b.active === false ? 0 : 1,
          Number.isFinite(sortN) ? sortN : 0,
        ],
      )
      const [rows] = await pool.query('SELECT * FROM car_rental_vehicles WHERE id = ?', [id])
      res.status(201).json(mapCarRentalVehicle(rows[0]))
    } catch (e) {
      if (String(e?.code) === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Slug already exists' })
      }
      next(e)
    }
  })

  app.patch('/api/car-rental-vehicles/:id', async (req, res, next) => {
    try {
      const id = String(req.params.id)
      const body = req.body ?? {}
      const fields = []
      const vals = []

      if (body.slug !== undefined) {
        const slug = String(body.slug)
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-')
        if (!/^[a-z0-9-]{1,64}$/.test(slug)) {
          return res.status(400).json({ error: 'Invalid slug format' })
        }
        fields.push('slug = ?')
        vals.push(slug)
      }
      if (body.title !== undefined) {
        fields.push('title = ?')
        vals.push(String(body.title).trim())
      }
      if (body.badge !== undefined) {
        fields.push('badge = ?')
        vals.push(String(body.badge ?? '').trim())
      }
      if (body.blurb !== undefined) {
        fields.push('blurb = ?')
        vals.push(String(body.blurb ?? '').trim())
      }
      if (body.dailyPriceUsd !== undefined) {
        fields.push('daily_price_usd = ?')
        vals.push(Number(body.dailyPriceUsd))
      }
      if (body.specs !== undefined) {
        fields.push('specs_json = ?')
        vals.push(JSON.stringify(Array.isArray(body.specs) ? body.specs : []))
      }
      if (body.imageUrl !== undefined) {
        fields.push('image_url = ?')
        vals.push(String(body.imageUrl ?? '').trim())
      }
      if (body.active !== undefined) {
        fields.push('active_flag = ?')
        vals.push(body.active ? 1 : 0)
      }
      if (body.sortOrder !== undefined) {
        fields.push('sort_order = ?')
        vals.push(Number(body.sortOrder))
      }

      if (!fields.length) return res.status(400).json({ error: 'No fields' })
      vals.push(id)
      await pool.query(
        `UPDATE car_rental_vehicles SET ${fields.join(', ')} WHERE id = ?`,
        vals,
      )
      await simpleGet(pool, res, 'SELECT * FROM car_rental_vehicles WHERE id = ?', id, mapCarRentalVehicle)
    } catch (e) {
      if (String(e?.code) === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Slug already exists' })
      }
      next(e)
    }
  })

  app.delete('/api/car-rental-vehicles/:id', async (req, res, next) => {
    try {
      const [r] = await pool.query('DELETE FROM car_rental_vehicles WHERE id = ?', [req.params.id])
      if (!r.affectedRows) return res.status(404).json({ error: 'Not found' })
      res.status(204).send()
    } catch (e) {
      next(e)
    }
  })
}
