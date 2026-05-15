import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mysql from 'mysql2/promise'
import { randomUUID } from 'crypto'

dotenv.config()

const config = {
  port: Number(process.env.PORT) || 4000,
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  mysql: {
    host: process.env.MYSQL_HOST ?? '127.0.0.1',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER ?? 'root',
    password: process.env.MYSQL_PASSWORD ?? '',
    database: process.env.MYSQL_DATABASE ?? 'tourism_admin',
  },
}

const pool = mysql.createPool({
  host: config.mysql.host,
  port: config.mysql.port,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database,
  waitForConnections: true,
  connectionLimit: 10,
})

function parseJson<T>(v: unknown, fallback: T): T {
  if (v == null) return fallback
  if (typeof v === 'string') {
    try {
      return JSON.parse(v) as T
    } catch {
      return fallback
    }
  }
  if (typeof v === 'object') return v as T
  return fallback
}

const app = express()
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  }),
)
app.use(express.json({ limit: '10mb' }))

app.get('/health', (_req, res) => res.json({ ok: true }))

// --- USERS ---
app.get('/api/users', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM tourism_users ORDER BY created_at DESC',
    )
    res.json(
      (rows as any[]).map((r) => ({
        id: r.id,
        firstName: r.first_name,
        lastName: r.last_name,
        email: r.email,
        phone: r.phone,
        role: r.role,
        status: r.status,
        createdAt: new Date(r.created_at).toISOString(),
      })),
    )
  } catch (e) {
    next(e)
  }
})

app.post('/api/users', async (req, res, next) => {
  try {
    const b = req.body as any
    const id = b.id ?? randomUUID()
    await pool.query(
      `INSERT INTO tourism_users (id, first_name, last_name, email, phone, role, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        b.firstName,
        b.lastName,
        b.email,
        b.phone ?? '',
        b.role ?? 'customer',
        b.status ?? 'active',
      ],
    )
    const [rows] = await pool.query('SELECT * FROM tourism_users WHERE id = ?', [
      id,
    ])
    const r = (rows as any[])[0]
    res.status(201).json({
      id: r.id,
      firstName: r.first_name,
      lastName: r.last_name,
      email: r.email,
      phone: r.phone,
      role: r.role,
      status: r.status,
      createdAt: new Date(r.created_at).toISOString(),
    })
  } catch (e) {
    next(e)
  }
})

app.patch('/api/users/:id', async (req, res, next) => {
  try {
    const id = String(req.params.id)
    const b = req.body as any
    const fields: string[] = []
    const vals: unknown[] = []
    const map: Record<string, string> = {
      firstName: 'first_name',
      lastName: 'last_name',
      email: 'email',
      phone: 'phone',
      role: 'role',
      status: 'status',
    }
    for (const k of Object.keys(map)) {
      if (b[k] !== undefined) {
        fields.push(`${map[k]} = ?`)
        vals.push(b[k])
      }
    }
    if (!fields.length) return res.status(400).json({ error: 'No fields' })
    vals.push(id)
    await pool.query(`UPDATE tourism_users SET ${fields.join(', ')} WHERE id = ?`, vals)
    const [rows] = await pool.query('SELECT * FROM tourism_users WHERE id = ?', [id])
    const r = (rows as any[])[0]
    if (!r) return res.status(404).json({ error: 'Not found' })
    res.json({
      id: r.id,
      firstName: r.first_name,
      lastName: r.last_name,
      email: r.email,
      phone: r.phone,
      role: r.role,
      status: r.status,
      createdAt: new Date(r.created_at).toISOString(),
    })
  } catch (e) {
    next(e)
  }
})

app.delete('/api/users/:id', async (req, res, next) => {
  try {
    const [r] = await pool.query('DELETE FROM tourism_users WHERE id = ?', [
      req.params.id,
    ])
    if (!(r as any).affectedRows) return res.status(404).json({ error: 'Not found' })
    res.status(204).send()
  } catch (e) {
    next(e)
  }
})

// --- SIMPLE CRUD HELPERS (internal) ---
async function simpleList(res: express.Response, sql: string, map: (r: any) => any) {
  const [rows] = await pool.query(sql)
  res.json((rows as any[]).map(map))
}

async function simpleGet(res: express.Response, sql: string, id: string, map: (r: any) => any) {
  const [rows] = await pool.query(sql, [id])
  const r = (rows as any[])[0]
  if (!r) return res.status(404).json({ error: 'Not found' })
  res.json(map(r))
}

// --- PACKAGE CATEGORIES ---
app.get('/api/package-categories', (req, res, next) =>
  simpleList(res, 'SELECT * FROM package_categories ORDER BY name', (r) => r).catch(next),
)
app.post('/api/package-categories', async (req, res, next) => {
  try {
    const b = req.body as any
    const id = b.id ?? randomUUID()
    const slug = b.slug ?? String(b.name).toLowerCase().trim().replace(/\s+/g, '-')
    await pool.query('INSERT INTO package_categories (id, name, slug) VALUES (?, ?, ?)', [id, b.name, slug])
    return simpleGet(res, 'SELECT * FROM package_categories WHERE id = ?', id, (r) => r).catch(next)
  } catch (e) {
    next(e)
  }
})
app.patch('/api/package-categories/:id', async (req, res, next) => {
  try {
    const id = String(req.params.id)
    const b = req.body as any
    const fields: string[] = []
    const vals: unknown[] = []
    if (b.name !== undefined) { fields.push('name = ?'); vals.push(b.name) }
    if (b.slug !== undefined) { fields.push('slug = ?'); vals.push(b.slug) }
    if (!fields.length) return res.status(400).json({ error: 'No fields' })
    vals.push(id)
    await pool.query(`UPDATE package_categories SET ${fields.join(', ')} WHERE id = ?`, vals)
    return simpleGet(res, 'SELECT * FROM package_categories WHERE id = ?', id, (r) => r).catch(next)
  } catch (e) { next(e) }
})
app.delete('/api/package-categories/:id', async (req, res, next) => {
  try {
    const [r] = await pool.query('DELETE FROM package_categories WHERE id = ?', [req.params.id])
    if (!(r as any).affectedRows) return res.status(404).json({ error: 'Not found' })
    res.status(204).send()
  } catch (e) { next(e) }
})

// --- DESTINATIONS (includes linkedPackageIds) ---
async function destinationsWithLinks() {
  const [rows] = await pool.query('SELECT * FROM destinations ORDER BY name')
  const dests = (rows as any[]).map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    imageUrls: parseJson<string[]>(r.image_urls, []),
    lat: Number(r.lat),
    lng: Number(r.lng),
    updatedAt: new Date(r.updated_at).toISOString(),
    linkedPackageIds: [] as string[],
  }))
  if (!dests.length) return dests
  const ids = dests.map((d) => d.id)
  const ph = ids.map(() => '?').join(',')
  const [links] = await pool.query(
    `SELECT destination_id, package_id FROM destination_package_links WHERE destination_id IN (${ph})`,
    ids,
  )
  const by: Record<string, string[]> = {}
  for (const l of links as any[]) {
    by[l.destination_id] = by[l.destination_id] ?? []
    by[l.destination_id].push(l.package_id)
  }
  for (const d of dests) d.linkedPackageIds = by[d.id] ?? []
  return dests
}

app.get('/api/destinations', async (_req, res, next) => {
  try { res.json(await destinationsWithLinks()) } catch (e) { next(e) }
})
app.post('/api/destinations', async (req, res, next) => {
  try {
    const b = req.body as any
    const id = b.id ?? randomUUID()
    const slug = b.slug ?? String(b.name).toLowerCase().trim().replace(/\s+/g, '-')
    await pool.query(
      `INSERT INTO destinations (id, name, slug, description, image_urls, lat, lng)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, b.name, slug, b.description ?? '', JSON.stringify(b.imageUrls ?? []), b.lat ?? 0, b.lng ?? 0],
    )
    if (Array.isArray(b.linkedPackageIds)) {
      await pool.query('DELETE FROM destination_package_links WHERE destination_id = ?', [id])
      if (b.linkedPackageIds.length) {
        const vals: unknown[] = []
        const sql = b.linkedPackageIds.map((pid: string) => { vals.push(id, pid); return '(?, ?)' }).join(',')
        await pool.query(`INSERT INTO destination_package_links (destination_id, package_id) VALUES ${sql}`, vals)
      }
    }
    const all = await destinationsWithLinks()
    res.status(201).json(all.find((d) => d.id === id))
  } catch (e) { next(e) }
})
app.patch('/api/destinations/:id', async (req, res, next) => {
  try {
    const id = String(req.params.id)
    const b = req.body as any
    const fields: string[] = []
    const vals: unknown[] = []
    if (b.name !== undefined) { fields.push('name = ?'); vals.push(b.name) }
    if (b.slug !== undefined) { fields.push('slug = ?'); vals.push(b.slug) }
    if (b.description !== undefined) { fields.push('description = ?'); vals.push(b.description) }
    if (b.imageUrls !== undefined) { fields.push('image_urls = ?'); vals.push(JSON.stringify(b.imageUrls ?? [])) }
    if (b.lat !== undefined) { fields.push('lat = ?'); vals.push(b.lat) }
    if (b.lng !== undefined) { fields.push('lng = ?'); vals.push(b.lng) }
    if (fields.length) {
      vals.push(id)
      await pool.query(`UPDATE destinations SET ${fields.join(', ')} WHERE id = ?`, vals)
    }
    if (b.linkedPackageIds !== undefined) {
      await pool.query('DELETE FROM destination_package_links WHERE destination_id = ?', [id])
      if (Array.isArray(b.linkedPackageIds) && b.linkedPackageIds.length) {
        const vals2: unknown[] = []
        const sql = b.linkedPackageIds.map((pid: string) => { vals2.push(id, pid); return '(?, ?)' }).join(',')
        await pool.query(`INSERT INTO destination_package_links (destination_id, package_id) VALUES ${sql}`, vals2)
      }
    }
    const all = await destinationsWithLinks()
    const d = all.find((x) => x.id === id)
    if (!d) return res.status(404).json({ error: 'Not found' })
    res.json(d)
  } catch (e) { next(e) }
})
app.delete('/api/destinations/:id', async (req, res, next) => {
  try {
    const [r] = await pool.query('DELETE FROM destinations WHERE id = ?', [req.params.id])
    if (!(r as any).affectedRows) return res.status(404).json({ error: 'Not found' })
    res.status(204).send()
  } catch (e) { next(e) }
})

// --- TOUR PACKAGES (includes itinerary + destinationIds) ---
async function packagesFull() {
  const [rows] = await pool.query('SELECT * FROM tour_packages ORDER BY title')
  const pkgs = rows as any[]
  if (!pkgs.length) return []
  const ids = pkgs.map((p) => p.id)
  const ph = ids.map(() => '?').join(',')
  const [days] = await pool.query(
    `SELECT package_id, day_number, title, description FROM itinerary_days WHERE package_id IN (${ph}) ORDER BY day_number`,
    ids,
  )
  const [links] = await pool.query(
    `SELECT package_id, destination_id FROM destination_package_links WHERE package_id IN (${ph})`,
    ids,
  )
  const dayBy: Record<string, any[]> = {}
  for (const d of days as any[]) {
    dayBy[d.package_id] = dayBy[d.package_id] ?? []
    dayBy[d.package_id].push({ day: d.day_number, title: d.title, description: d.description })
  }
  const destBy: Record<string, string[]> = {}
  for (const l of links as any[]) {
    destBy[l.package_id] = destBy[l.package_id] ?? []
    destBy[l.package_id].push(l.destination_id)
  }
  return pkgs.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    priceRwf: Number(p.price_rwf),
    durationDays: p.duration_days,
    description: p.description,
    imageUrls: parseJson<string[]>(p.image_urls, []),
    itinerary: dayBy[p.id] ?? [],
    status: p.status,
    destinationIds: destBy[p.id] ?? [],
    categoryId: p.category_id ?? '',
    updatedAt: new Date(p.updated_at).toISOString(),
  }))
}

app.get('/api/tour-packages', async (_req, res, next) => {
  try { res.json(await packagesFull()) } catch (e) { next(e) }
})
app.post('/api/tour-packages', async (req, res, next) => {
  const b = req.body as any
  const id = b.id ?? randomUUID()
  const slug = b.slug ?? String(b.title).toLowerCase().trim().replace(/\s+/g, '-')
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    await conn.query(
      `INSERT INTO tour_packages (id, title, slug, price_rwf, duration_days, description, image_urls, status, category_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        b.title,
        slug,
        b.priceRwf,
        b.durationDays,
        b.description ?? '',
        JSON.stringify(b.imageUrls ?? []),
        b.status ?? 'active',
        b.categoryId || null,
      ],
    )
    await conn.query('DELETE FROM itinerary_days WHERE package_id = ?', [id])
    for (const it of (b.itinerary ?? [])) {
      await conn.query(
        `INSERT INTO itinerary_days (id, package_id, day_number, title, description) VALUES (?, ?, ?, ?, ?)`,
        [randomUUID(), id, it.day, it.title, it.description],
      )
    }
    await conn.query('DELETE FROM destination_package_links WHERE package_id = ?', [id])
    for (const did of (b.destinationIds ?? [])) {
      await conn.query(
        `INSERT INTO destination_package_links (destination_id, package_id) VALUES (?, ?)`,
        [did, id],
      )
    }
    await conn.commit()
    const all = await packagesFull()
    res.status(201).json(all.find((p) => p.id === id))
  } catch (e) {
    await conn.rollback()
    next(e)
  } finally {
    conn.release()
  }
})
app.patch('/api/tour-packages/:id', async (req, res, next) => {
  const id = String(req.params.id)
  const b = req.body as any
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const fields: string[] = []
    const vals: unknown[] = []
    if (b.title !== undefined) { fields.push('title = ?'); vals.push(b.title) }
    if (b.slug !== undefined) { fields.push('slug = ?'); vals.push(b.slug) }
    if (b.priceRwf !== undefined) { fields.push('price_rwf = ?'); vals.push(b.priceRwf) }
    if (b.durationDays !== undefined) { fields.push('duration_days = ?'); vals.push(b.durationDays) }
    if (b.description !== undefined) { fields.push('description = ?'); vals.push(b.description) }
    if (b.imageUrls !== undefined) { fields.push('image_urls = ?'); vals.push(JSON.stringify(b.imageUrls ?? [])) }
    if (b.status !== undefined) { fields.push('status = ?'); vals.push(b.status) }
    if (b.categoryId !== undefined) { fields.push('category_id = ?'); vals.push(b.categoryId || null) }
    if (fields.length) {
      vals.push(id)
      await conn.query(`UPDATE tour_packages SET ${fields.join(', ')} WHERE id = ?`, vals)
    }
    if (b.itinerary !== undefined) {
      await conn.query('DELETE FROM itinerary_days WHERE package_id = ?', [id])
      for (const it of (b.itinerary ?? [])) {
        await conn.query(
          `INSERT INTO itinerary_days (id, package_id, day_number, title, description) VALUES (?, ?, ?, ?, ?)`,
          [randomUUID(), id, it.day, it.title, it.description],
        )
      }
    }
    if (b.destinationIds !== undefined) {
      await conn.query('DELETE FROM destination_package_links WHERE package_id = ?', [id])
      for (const did of (b.destinationIds ?? [])) {
        await conn.query(
          `INSERT INTO destination_package_links (destination_id, package_id) VALUES (?, ?)`,
          [did, id],
        )
      }
    }
    await conn.commit()
    const all = await packagesFull()
    const one = all.find((p) => p.id === id)
    if (!one) return res.status(404).json({ error: 'Not found' })
    res.json(one)
  } catch (e) {
    await conn.rollback()
    next(e)
  } finally {
    conn.release()
  }
})
app.delete('/api/tour-packages/:id', async (req, res, next) => {
  try {
    const [r] = await pool.query('DELETE FROM tour_packages WHERE id = ?', [req.params.id])
    if (!(r as any).affectedRows) return res.status(404).json({ error: 'Not found' })
    res.status(204).send()
  } catch (e) { next(e) }
})

// --- BOOKINGS ---
app.get('/api/bookings', (req, res, next) =>
  simpleList(res, 'SELECT * FROM bookings ORDER BY created_at DESC', (r) => ({
    id: r.id,
    userId: r.user_id,
    packageId: r.package_id,
    startDate: (typeof r.start_date === 'string' ? r.start_date : new Date(r.start_date).toISOString()).slice(0, 10),
    status: r.status,
    totalRwf: Number(r.total_rwf),
    guideId: r.guide_id,
    createdAt: new Date(r.created_at).toISOString(),
  })).catch(next),
)
app.post('/api/bookings', async (req, res, next) => {
  try {
    const b = req.body as any
    const id = b.id ?? randomUUID()
    await pool.query(
      `INSERT INTO bookings (id, user_id, package_id, start_date, status, total_rwf, guide_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, b.userId, b.packageId, String(b.startDate).slice(0, 10), b.status ?? 'pending', b.totalRwf, b.guideId ?? null],
    )
    const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id])
    res.status(201).json((rows as any[]).map((r) => ({
      id: r.id,
      userId: r.user_id,
      packageId: r.package_id,
      startDate: (typeof r.start_date === 'string' ? r.start_date : new Date(r.start_date).toISOString()).slice(0, 10),
      status: r.status,
      totalRwf: Number(r.total_rwf),
      guideId: r.guide_id,
      createdAt: new Date(r.created_at).toISOString(),
    }))[0])
  } catch (e) { next(e) }
})
app.patch('/api/bookings/:id', async (req, res, next) => {
  try {
    const id = String(req.params.id)
    const b = req.body as any
    const fields: string[] = []
    const vals: unknown[] = []
    if (b.userId !== undefined) { fields.push('user_id = ?'); vals.push(b.userId) }
    if (b.packageId !== undefined) { fields.push('package_id = ?'); vals.push(b.packageId) }
    if (b.startDate !== undefined) { fields.push('start_date = ?'); vals.push(String(b.startDate).slice(0, 10)) }
    if (b.status !== undefined) { fields.push('status = ?'); vals.push(b.status) }
    if (b.totalRwf !== undefined) { fields.push('total_rwf = ?'); vals.push(b.totalRwf) }
    if (b.guideId !== undefined) { fields.push('guide_id = ?'); vals.push(b.guideId) }
    if (!fields.length) return res.status(400).json({ error: 'No fields' })
    vals.push(id)
    await pool.query(`UPDATE bookings SET ${fields.join(', ')} WHERE id = ?`, vals)
    return simpleGet(res, 'SELECT * FROM bookings WHERE id = ?', id, (r) => ({
      id: r.id,
      userId: r.user_id,
      packageId: r.package_id,
      startDate: (typeof r.start_date === 'string' ? r.start_date : new Date(r.start_date).toISOString()).slice(0, 10),
      status: r.status,
      totalRwf: Number(r.total_rwf),
      guideId: r.guide_id,
      createdAt: new Date(r.created_at).toISOString(),
    })).catch(next)
  } catch (e) { next(e) }
})
app.delete('/api/bookings/:id', async (req, res, next) => {
  try {
    const [r] = await pool.query('DELETE FROM bookings WHERE id = ?', [req.params.id])
    if (!(r as any).affectedRows) return res.status(404).json({ error: 'Not found' })
    res.status(204).send()
  } catch (e) { next(e) }
})

// --- PAYMENTS ---
app.get('/api/payments', (req, res, next) =>
  simpleList(res, 'SELECT * FROM payments ORDER BY created_at DESC', (r) => ({
    id: r.id,
    bookingId: r.booking_id,
    amountRwf: Number(r.amount_rwf),
    status: r.status,
    method: r.method,
    reference: r.reference,
    createdAt: new Date(r.created_at).toISOString(),
  })).catch(next),
)
app.post('/api/payments', async (req, res, next) => {
  try {
    const b = req.body as any
    const id = b.id ?? randomUUID()
    await pool.query(
      `INSERT INTO payments (id, booking_id, amount_rwf, status, method, reference)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, b.bookingId, b.amountRwf, b.status ?? 'unpaid', b.method ?? 'flutterwave', b.reference ?? `RW-${id.slice(0, 8)}`],
    )
    return simpleGet(res, 'SELECT * FROM payments WHERE id = ?', id, (r) => ({
      id: r.id,
      bookingId: r.booking_id,
      amountRwf: Number(r.amount_rwf),
      status: r.status,
      method: r.method,
      reference: r.reference,
      createdAt: new Date(r.created_at).toISOString(),
    })).catch(next)
  } catch (e) { next(e) }
})
app.patch('/api/payments/:id', async (req, res, next) => {
  try {
    const id = String(req.params.id)
    const b = req.body as any
    const fields: string[] = []
    const vals: unknown[] = []
    if (b.amountRwf !== undefined) { fields.push('amount_rwf = ?'); vals.push(b.amountRwf) }
    if (b.status !== undefined) { fields.push('status = ?'); vals.push(b.status) }
    if (b.method !== undefined) { fields.push('method = ?'); vals.push(b.method) }
    if (b.reference !== undefined) { fields.push('reference = ?'); vals.push(b.reference) }
    if (!fields.length) return res.status(400).json({ error: 'No fields' })
    vals.push(id)
    await pool.query(`UPDATE payments SET ${fields.join(', ')} WHERE id = ?`, vals)
    return simpleGet(res, 'SELECT * FROM payments WHERE id = ?', id, (r) => ({
      id: r.id,
      bookingId: r.booking_id,
      amountRwf: Number(r.amount_rwf),
      status: r.status,
      method: r.method,
      reference: r.reference,
      createdAt: new Date(r.created_at).toISOString(),
    })).catch(next)
  } catch (e) { next(e) }
})
app.delete('/api/payments/:id', async (req, res, next) => {
  try {
    const [r] = await pool.query('DELETE FROM payments WHERE id = ?', [req.params.id])
    if (!(r as any).affectedRows) return res.status(404).json({ error: 'Not found' })
    res.status(204).send()
  } catch (e) { next(e) }
})

// --- MESSAGES ---
app.get('/api/messages', (req, res, next) =>
  simpleList(res, 'SELECT * FROM message_threads ORDER BY created_at DESC', (r) => ({
    id: r.id,
    source: r.source,
    name: r.name,
    email: r.email,
    subject: r.subject,
    body: r.body,
    read: !!r.read_flag,
    createdAt: new Date(r.created_at).toISOString(),
  })).catch(next),
)
app.post('/api/messages', async (req, res, next) => {
  try {
    const b = req.body as any
    const id = b.id ?? randomUUID()
    await pool.query(
      `INSERT INTO message_threads (id, source, name, email, subject, body, read_flag)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, b.source, b.name, b.email, b.subject, b.body, b.read ? 1 : 0],
    )
    return simpleGet(res, 'SELECT * FROM message_threads WHERE id = ?', id, (r) => ({
      id: r.id,
      source: r.source,
      name: r.name,
      email: r.email,
      subject: r.subject,
      body: r.body,
      read: !!r.read_flag,
      createdAt: new Date(r.created_at).toISOString(),
    })).catch(next)
  } catch (e) { next(e) }
})
app.patch('/api/messages/:id', async (req, res, next) => {
  try {
    const id = String(req.params.id)
    const b = req.body as any
    const fields: string[] = []
    const vals: unknown[] = []
    if (b.read !== undefined) { fields.push('read_flag = ?'); vals.push(b.read ? 1 : 0) }
    if (b.subject !== undefined) { fields.push('subject = ?'); vals.push(b.subject) }
    if (b.body !== undefined) { fields.push('body = ?'); vals.push(b.body) }
    if (!fields.length) return res.status(400).json({ error: 'No fields' })
    vals.push(id)
    await pool.query(`UPDATE message_threads SET ${fields.join(', ')} WHERE id = ?`, vals)
    return simpleGet(res, 'SELECT * FROM message_threads WHERE id = ?', id, (r) => ({
      id: r.id,
      source: r.source,
      name: r.name,
      email: r.email,
      subject: r.subject,
      body: r.body,
      read: !!r.read_flag,
      createdAt: new Date(r.created_at).toISOString(),
    })).catch(next)
  } catch (e) { next(e) }
})
app.delete('/api/messages/:id', async (req, res, next) => {
  try {
    const [r] = await pool.query('DELETE FROM message_threads WHERE id = ?', [req.params.id])
    if (!(r as any).affectedRows) return res.status(404).json({ error: 'Not found' })
    res.status(204).send()
  } catch (e) { next(e) }
})

function mapCarRentalRow(r: any) {
  const pd =
    typeof r.pickup_date === 'string'
      ? r.pickup_date.slice(0, 10)
      : new Date(r.pickup_date).toISOString().slice(0, 10)
  const rd =
    typeof r.return_date === 'string'
      ? r.return_date.slice(0, 10)
      : new Date(r.return_date).toISOString().slice(0, 10)
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    vehicleClass: r.vehicle_class,
    pickupDate: pd,
    returnDate: rd,
    pickupLocation: r.pickup_location ?? '',
    returnLocation: r.return_location ?? '',
    driverOption: r.driver_option,
    extras: parseJson<Record<string, boolean>>(r.extras_json, {}),
    message: r.message ?? '',
    status: r.status,
    adminNotes: r.admin_notes ?? '',
    read: !!r.read_flag,
    createdAt: new Date(r.created_at).toISOString(),
  }
}

function isoOrNow(v: unknown): string {
  if (v == null || v === '') return new Date().toISOString()
  const t = new Date(v as string).getTime()
  return Number.isFinite(t) ? new Date(t).toISOString() : new Date().toISOString()
}

function mapCarRentalVehicleRow(r: any) {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    badge: r.badge,
    blurb: r.blurb ?? '',
    dailyPriceUsd: Number(r.daily_price_usd),
    specs: parseJson<{ icon?: string; text?: string }[]>(r.specs_json, []),
    imageUrl: r.image_url ?? '',
    active: !!r.active_flag,
    sortOrder: Number(r.sort_order ?? 0),
    updatedAt: isoOrNow(r.updated_at),
  }
}

// --- CAR RENTAL REQUESTS ---
app.get('/api/car-rental-requests/summary', async (_req, res, next) => {
  try {
    const [statusRows] = await pool.query(
      'SELECT status, COUNT(*) AS c FROM car_rental_requests GROUP BY status',
    )
    const [[tot]] = await pool.query(
      'SELECT COUNT(*) AS total, SUM(CASE WHEN read_flag = 0 THEN 1 ELSE 0 END) AS unread FROM car_rental_requests',
    )
    const byStatus: Record<string, number> = {}
    for (const row of statusRows as { status: string; c: number }[]) {
      byStatus[row.status] = Number(row.c)
    }
    res.json({
      total: Number((tot as any)?.total ?? 0),
      unread: Number((tot as any)?.unread ?? 0),
      byStatus,
    })
  } catch (e) {
    next(e)
  }
})
app.get('/api/car-rental-requests', async (req, res, next) => {
  try {
    const q = req.query as Record<string, string | undefined>
    let sql = 'SELECT * FROM car_rental_requests WHERE 1=1'
    const vals: unknown[] = []
    if (q.status) {
      sql += ' AND status = ?'
      vals.push(String(q.status))
    }
    if (q.vehicleClass) {
      sql += ' AND vehicle_class = ?'
      vals.push(String(q.vehicleClass))
    }
    if (q.read === 'true' || q.read === '1') {
      sql += ' AND read_flag = 1'
    } else if (q.read === 'false' || q.read === '0') {
      sql += ' AND read_flag = 0'
    }
    if (q.fromDate) {
      sql += ' AND pickup_date >= ?'
      vals.push(String(q.fromDate).slice(0, 10))
    }
    if (q.toDate) {
      sql += ' AND pickup_date <= ?'
      vals.push(String(q.toDate).slice(0, 10))
    }
    if (q.q && String(q.q).trim()) {
      const qq = `%${String(q.q).trim()}%`
      sql += ` AND (
          name LIKE ? OR email LIKE ? OR phone LIKE ? OR vehicle_class LIKE ?
          OR pickup_location LIKE ? OR return_location LIKE ?
          OR COALESCE(message, '') LIKE ? OR COALESCE(admin_notes, '') LIKE ?
        )`
      vals.push(qq, qq, qq, qq, qq, qq, qq, qq)
    }
    sql += ' ORDER BY created_at DESC'
    const limit = Math.min(Math.max(Number(q.limit) || 500, 1), 500)
    const offset = Math.max(Number(q.offset) || 0, 0)
    sql += ' LIMIT ? OFFSET ?'
    vals.push(limit, offset)
    const [rows] = await pool.query(sql, vals)
    res.json((rows as any[]).map(mapCarRentalRow))
  } catch (e) {
    next(e)
  }
})
app.post('/api/car-rental-requests/bulk-read', async (req, res, next) => {
  try {
    const { ids, read } = req.body as { ids?: unknown[]; read?: boolean }
    if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ error: 'ids array required' })
    const uniq = [...new Set(ids.map((x) => String(x)))].filter(Boolean)
    if (!uniq.length) return res.status(400).json({ error: 'ids array required' })
    const flag = read === false ? 0 : 1
    const ph = uniq.map(() => '?').join(',')
    await pool.query(`UPDATE car_rental_requests SET read_flag = ? WHERE id IN (${ph})`, [flag, ...uniq])
    res.json({ ok: true, count: uniq.length })
  } catch (e) {
    next(e)
  }
})
app.post('/api/car-rental-requests', async (req, res, next) => {
  try {
    const b = req.body as any
    if (!String(b.name ?? '').trim() || !String(b.email ?? '').trim()) {
      return res.status(400).json({ error: 'Name and email are required' })
    }
    const pd = String(b.pickupDate ?? '').slice(0, 10)
    const rd = String(b.returnDate ?? '').slice(0, 10)
    if (!pd || !rd) return res.status(400).json({ error: 'Pickup and return dates are required' })
    if (rd < pd) return res.status(400).json({ error: 'Return date must be on or after pickup date' })
    const id = b.id ?? randomUUID()
    const extras =
      typeof b.extras === 'object' && b.extras != null ? b.extras : {}
    await pool.query(
      `INSERT INTO car_rental_requests (
         id, name, email, phone, vehicle_class, pickup_date, return_date,
         pickup_location, return_location, driver_option, extras_json, message,
         status, admin_notes, read_flag
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', '', 0)`,
      [
        id,
        String(b.name).trim(),
        String(b.email).trim().toLowerCase(),
        String(b.phone ?? '').trim(),
        String(b.vehicleClass ?? '').trim(),
        pd,
        rd,
        String(b.pickupLocation ?? '').trim(),
        String(b.returnLocation ?? '').trim(),
        String(b.driverOption ?? 'self-drive').trim(),
        JSON.stringify(extras),
        String(b.message ?? '').trim(),
      ],
    )
    const [rows] = await pool.query('SELECT * FROM car_rental_requests WHERE id = ?', [id])
    res.status(201).json(mapCarRentalRow((rows as any[])[0]))
  } catch (e) {
    next(e)
  }
})
app.patch('/api/car-rental-requests/:id', async (req, res, next) => {
  try {
    const id = String(req.params.id)
    const b = req.body as any
    const fields: string[] = []
    const vals: unknown[] = []
    if (b.status !== undefined) {
      fields.push('status = ?')
      vals.push(String(b.status))
    }
    if (b.adminNotes !== undefined) {
      fields.push('admin_notes = ?')
      vals.push(String(b.adminNotes))
    }
    if (b.read !== undefined) {
      fields.push('read_flag = ?')
      vals.push(b.read ? 1 : 0)
    }
    if (!fields.length) return res.status(400).json({ error: 'No fields' })
    vals.push(id)
    await pool.query(`UPDATE car_rental_requests SET ${fields.join(', ')} WHERE id = ?`, vals)
    return simpleGet(res, 'SELECT * FROM car_rental_requests WHERE id = ?', id, mapCarRentalRow).catch(
      next,
    )
  } catch (e) {
    next(e)
  }
})
app.delete('/api/car-rental-requests/:id', async (req, res, next) => {
  try {
    const [r] = await pool.query('DELETE FROM car_rental_requests WHERE id = ?', [req.params.id])
    if (!(r as any).affectedRows) return res.status(404).json({ error: 'Not found' })
    res.status(204).send()
  } catch (e) {
    next(e)
  }
})

// --- CAR RENTAL FLEET (vehicles) ---
app.get('/api/car-rental-vehicles/summary', async (_req, res, next) => {
  try {
    const [[tot]] = await pool.query(
      `SELECT COUNT(*) AS total,
       SUM(CASE WHEN active_flag = 1 THEN 1 ELSE 0 END) AS active,
       SUM(CASE WHEN active_flag = 0 THEN 1 ELSE 0 END) AS inactive
       FROM car_rental_vehicles`,
    )
    res.json({
      total: Number((tot as any)?.total ?? 0),
      active: Number((tot as any)?.active ?? 0),
      inactive: Number((tot as any)?.inactive ?? 0),
    })
  } catch (e) {
    next(e)
  }
})
app.get('/api/car-rental-vehicles/catalog', (req, res, next) =>
  simpleList(
    res,
    'SELECT * FROM car_rental_vehicles WHERE active_flag = 1 ORDER BY sort_order ASC, title ASC',
    mapCarRentalVehicleRow,
  ).catch(next),
)
app.get('/api/car-rental-vehicles', async (req, res, next) => {
  try {
    const q = req.query as Record<string, string | undefined>
    let sql = 'SELECT * FROM car_rental_vehicles WHERE 1=1'
    const vals: unknown[] = []
    if (q.active === 'true' || q.active === '1') sql += ' AND active_flag = 1'
    else if (q.active === 'false' || q.active === '0') sql += ' AND active_flag = 0'
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
    res.json((rows as any[]).map(mapCarRentalVehicleRow))
  } catch (e) {
    next(e)
  }
})
app.post('/api/car-rental-vehicles/:id/duplicate', async (req, res, next) => {
  try {
    const id = String(req.params.id)
    const [existing] = await pool.query('SELECT * FROM car_rental_vehicles WHERE id = ?', [id])
    const row = (existing as any[])[0]
    if (!row) return res.status(404).json({ error: 'Not found' })

    let slug = `${String(row.slug).slice(0, 40)}-copy-${randomUUID().slice(0, 6)}`.toLowerCase()
    slug = slug.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')
    if (!/^[a-z0-9-]{1,64}$/.test(slug)) slug = `copy-${randomUUID().slice(0, 13)}`

    let specsSrc = row.specs_json
    let specsArr: unknown[]
    if (typeof specsSrc === 'string') specsArr = parseJson<{ icon?: string; text?: string }[]>(specsSrc, [])
    else if (Array.isArray(specsSrc)) specsArr = specsSrc as unknown[]
    else specsArr = parseJson(specsSrc, [] as unknown[])
    const specs = JSON.stringify(Array.isArray(specsArr) ? specsArr : [])

    const nid = randomUUID()
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
    res.status(201).json(mapCarRentalVehicleRow((ins as any[])[0]))
  } catch (e) {
    next(e)
  }
})
app.post('/api/car-rental-vehicles', async (req, res, next) => {
  try {
    const b = req.body as any
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
    const specs = Array.isArray(b.specs) && b.specs.length ? b.specs : [{ icon: 'bi-info-circle', text: 'See description' }]
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
        Number(b.dailyPriceUsd ?? 0),
        JSON.stringify(specs),
        String(b.imageUrl ?? '').trim(),
        b.active === false ? 0 : 1,
        Number(b.sortOrder ?? 0),
      ],
    )
    const [rows] = await pool.query('SELECT * FROM car_rental_vehicles WHERE id = ?', [id])
    res.status(201).json(mapCarRentalVehicleRow((rows as any[])[0]))
  } catch (e: any) {
    if (String(e?.code) === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Slug already exists' })
    next(e)
  }
})
app.patch('/api/car-rental-vehicles/:id', async (req, res, next) => {
  try {
    const id = String(req.params.id)
    const b = req.body as any
    const fields: string[] = []
    const vals: unknown[] = []
    if (b.slug !== undefined) {
      const s = String(b.slug)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
      if (!/^[a-z0-9-]{1,64}$/.test(s)) return res.status(400).json({ error: 'Invalid slug' })
      fields.push('slug = ?')
      vals.push(s)
    }
    if (b.title !== undefined) {
      fields.push('title = ?')
      vals.push(String(b.title).trim())
    }
    if (b.badge !== undefined) {
      fields.push('badge = ?')
      vals.push(String(b.badge ?? '').trim())
    }
    if (b.blurb !== undefined) {
      fields.push('blurb = ?')
      vals.push(String(b.blurb ?? '').trim())
    }
    if (b.dailyPriceUsd !== undefined) {
      fields.push('daily_price_usd = ?')
      vals.push(Number(b.dailyPriceUsd))
    }
    if (b.specs !== undefined) {
      fields.push('specs_json = ?')
      vals.push(JSON.stringify(Array.isArray(b.specs) ? b.specs : []))
    }
    if (b.imageUrl !== undefined) {
      fields.push('image_url = ?')
      vals.push(String(b.imageUrl ?? '').trim())
    }
    if (b.active !== undefined) {
      fields.push('active_flag = ?')
      vals.push(b.active ? 1 : 0)
    }
    if (b.sortOrder !== undefined) {
      fields.push('sort_order = ?')
      vals.push(Number(b.sortOrder))
    }
    if (!fields.length) return res.status(400).json({ error: 'No fields' })
    vals.push(id)
    await pool.query(`UPDATE car_rental_vehicles SET ${fields.join(', ')} WHERE id = ?`, vals)
    return simpleGet(res, 'SELECT * FROM car_rental_vehicles WHERE id = ?', id, mapCarRentalVehicleRow).catch(next)
  } catch (e: any) {
    if (String(e?.code) === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Slug already exists' })
    next(e)
  }
})
app.delete('/api/car-rental-vehicles/:id', async (req, res, next) => {
  try {
    const [r] = await pool.query('DELETE FROM car_rental_vehicles WHERE id = ?', [req.params.id])
    if (!(r as any).affectedRows) return res.status(404).json({ error: 'Not found' })
    res.status(204).send()
  } catch (e) {
    next(e)
  }
})

// --- REVIEWS ---
app.get('/api/reviews', (req, res, next) =>
  simpleList(res, 'SELECT * FROM reviews ORDER BY created_at DESC', (r) => ({
    id: r.id,
    userId: r.user_id,
    packageId: r.package_id,
    rating: r.rating,
    comment: r.comment,
    status: r.status,
    featured: !!r.featured,
    createdAt: new Date(r.created_at).toISOString(),
  })).catch(next),
)
app.post('/api/reviews', async (req, res, next) => {
  try {
    const b = req.body as any
    const id = b.id ?? randomUUID()
    await pool.query(
      `INSERT INTO reviews (id, user_id, package_id, rating, comment, status, featured)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, b.userId, b.packageId, b.rating, b.comment, b.status ?? 'pending', b.featured ? 1 : 0],
    )
    return simpleGet(res, 'SELECT * FROM reviews WHERE id = ?', id, (r) => ({
      id: r.id,
      userId: r.user_id,
      packageId: r.package_id,
      rating: r.rating,
      comment: r.comment,
      status: r.status,
      featured: !!r.featured,
      createdAt: new Date(r.created_at).toISOString(),
    })).catch(next)
  } catch (e) { next(e) }
})
app.patch('/api/reviews/:id', async (req, res, next) => {
  try {
    const id = String(req.params.id)
    const b = req.body as any
    const fields: string[] = []
    const vals: unknown[] = []
    if (b.rating !== undefined) { fields.push('rating = ?'); vals.push(b.rating) }
    if (b.comment !== undefined) { fields.push('comment = ?'); vals.push(b.comment) }
    if (b.status !== undefined) { fields.push('status = ?'); vals.push(b.status) }
    if (b.featured !== undefined) { fields.push('featured = ?'); vals.push(b.featured ? 1 : 0) }
    if (!fields.length) return res.status(400).json({ error: 'No fields' })
    vals.push(id)
    await pool.query(`UPDATE reviews SET ${fields.join(', ')} WHERE id = ?`, vals)
    return simpleGet(res, 'SELECT * FROM reviews WHERE id = ?', id, (r) => ({
      id: r.id,
      userId: r.user_id,
      packageId: r.package_id,
      rating: r.rating,
      comment: r.comment,
      status: r.status,
      featured: !!r.featured,
      createdAt: new Date(r.created_at).toISOString(),
    })).catch(next)
  } catch (e) { next(e) }
})
app.delete('/api/reviews/:id', async (req, res, next) => {
  try {
    const [r] = await pool.query('DELETE FROM reviews WHERE id = ?', [req.params.id])
    if (!(r as any).affectedRows) return res.status(404).json({ error: 'Not found' })
    res.status(204).send()
  } catch (e) { next(e) }
})

// --- BLOG (categories + posts) ---
app.get('/api/blog/categories', (req, res, next) =>
  simpleList(res, 'SELECT * FROM blog_categories ORDER BY name', (r) => r).catch(next),
)
app.post('/api/blog/categories', async (req, res, next) => {
  try {
    const b = req.body as any
    const id = b.id ?? randomUUID()
    const slug = b.slug ?? String(b.name).toLowerCase().trim().replace(/\s+/g, '-')
    await pool.query('INSERT INTO blog_categories (id, name, slug) VALUES (?, ?, ?)', [id, b.name, slug])
    return simpleGet(res, 'SELECT * FROM blog_categories WHERE id = ?', id, (r) => r).catch(next)
  } catch (e) { next(e) }
})
app.patch('/api/blog/categories/:id', async (req, res, next) => {
  try {
    const id = String(req.params.id)
    const b = req.body as any
    const fields: string[] = []
    const vals: unknown[] = []
    if (b.name !== undefined) { fields.push('name = ?'); vals.push(b.name) }
    if (b.slug !== undefined) { fields.push('slug = ?'); vals.push(b.slug) }
    if (!fields.length) return res.status(400).json({ error: 'No fields' })
    vals.push(id)
    await pool.query(`UPDATE blog_categories SET ${fields.join(', ')} WHERE id = ?`, vals)
    return simpleGet(res, 'SELECT * FROM blog_categories WHERE id = ?', id, (r) => r).catch(next)
  } catch (e) { next(e) }
})
app.delete('/api/blog/categories/:id', async (req, res, next) => {
  try {
    const [r] = await pool.query('DELETE FROM blog_categories WHERE id = ?', [req.params.id])
    if (!(r as any).affectedRows) return res.status(404).json({ error: 'Not found' })
    res.status(204).send()
  } catch (e) { next(e) }
})

app.get('/api/blog/posts', (req, res, next) =>
  simpleList(res, 'SELECT * FROM blog_posts ORDER BY updated_at DESC', (r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    excerpt: r.excerpt,
    body: r.body,
    categoryId: r.category_id,
    coverImageUrl: r.cover_image_url,
    published: !!r.published,
    updatedAt: new Date(r.updated_at).toISOString(),
  })).catch(next),
)
app.post('/api/blog/posts', async (req, res, next) => {
  try {
    const b = req.body as any
    const id = b.id ?? randomUUID()
    const slug = b.slug ?? String(b.title).toLowerCase().trim().replace(/\s+/g, '-')
    await pool.query(
      `INSERT INTO blog_posts (id, title, slug, excerpt, body, category_id, cover_image_url, published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, b.title, slug, b.excerpt ?? '', b.body ?? '', b.categoryId, b.coverImageUrl ?? '', b.published ? 1 : 0],
    )
    const [rows] = await pool.query('SELECT * FROM blog_posts WHERE id = ?', [id])
    const r = (rows as any[])[0]
    res.status(201).json({
      id: r.id,
      title: r.title,
      slug: r.slug,
      excerpt: r.excerpt,
      body: r.body,
      categoryId: r.category_id,
      coverImageUrl: r.cover_image_url,
      published: !!r.published,
      updatedAt: new Date(r.updated_at).toISOString(),
    })
  } catch (e) { next(e) }
})
app.patch('/api/blog/posts/:id', async (req, res, next) => {
  try {
    const id = String(req.params.id)
    const b = req.body as any
    const fields: string[] = []
    const vals: unknown[] = []
    const m: Record<string, string> = {
      title: 'title',
      slug: 'slug',
      excerpt: 'excerpt',
      body: 'body',
      categoryId: 'category_id',
      coverImageUrl: 'cover_image_url',
    }
    for (const k of Object.keys(m)) {
      if (b[k] !== undefined) { fields.push(`${m[k]} = ?`); vals.push(b[k]) }
    }
    if (b.published !== undefined) { fields.push('published = ?'); vals.push(b.published ? 1 : 0) }
    if (!fields.length) return res.status(400).json({ error: 'No fields' })
    vals.push(id)
    await pool.query(`UPDATE blog_posts SET ${fields.join(', ')} WHERE id = ?`, vals)
    const [rows] = await pool.query('SELECT * FROM blog_posts WHERE id = ?', [id])
    const r = (rows as any[])[0]
    if (!r) return res.status(404).json({ error: 'Not found' })
    res.json({
      id: r.id,
      title: r.title,
      slug: r.slug,
      excerpt: r.excerpt,
      body: r.body,
      categoryId: r.category_id,
      coverImageUrl: r.cover_image_url,
      published: !!r.published,
      updatedAt: new Date(r.updated_at).toISOString(),
    })
  } catch (e) { next(e) }
})
app.delete('/api/blog/posts/:id', async (req, res, next) => {
  try {
    const [r] = await pool.query('DELETE FROM blog_posts WHERE id = ?', [req.params.id])
    if (!(r as any).affectedRows) return res.status(404).json({ error: 'Not found' })
    res.status(204).send()
  } catch (e) { next(e) }
})

// --- GALLERY ---
app.get('/api/gallery', (req, res, next) =>
  simpleList(res, 'SELECT * FROM gallery_items ORDER BY updated_at DESC', (r) => ({
    id: r.id,
    url: r.url,
    type: r.type,
    category: r.category,
    caption: r.caption,
    updatedAt: new Date(r.updated_at).toISOString(),
  })).catch(next),
)
app.post('/api/gallery', async (req, res, next) => {
  try {
    const b = req.body as any
    const id = b.id ?? randomUUID()
    await pool.query(
      `INSERT INTO gallery_items (id, url, type, category, caption) VALUES (?, ?, ?, ?, ?)`,
      [id, b.url, b.type ?? 'image', b.category ?? 'other', b.caption ?? ''],
    )
    return simpleGet(res, 'SELECT * FROM gallery_items WHERE id = ?', id, (r) => ({
      id: r.id,
      url: r.url,
      type: r.type,
      category: r.category,
      caption: r.caption,
      updatedAt: new Date(r.updated_at).toISOString(),
    })).catch(next)
  } catch (e) { next(e) }
})
app.patch('/api/gallery/:id', async (req, res, next) => {
  try {
    const id = String(req.params.id)
    const b = req.body as any
    const fields: string[] = []
    const vals: unknown[] = []
    if (b.url !== undefined) { fields.push('url = ?'); vals.push(b.url) }
    if (b.type !== undefined) { fields.push('type = ?'); vals.push(b.type) }
    if (b.category !== undefined) { fields.push('category = ?'); vals.push(b.category) }
    if (b.caption !== undefined) { fields.push('caption = ?'); vals.push(b.caption) }
    if (!fields.length) return res.status(400).json({ error: 'No fields' })
    vals.push(id)
    await pool.query(`UPDATE gallery_items SET ${fields.join(', ')} WHERE id = ?`, vals)
    return simpleGet(res, 'SELECT * FROM gallery_items WHERE id = ?', id, (r) => ({
      id: r.id,
      url: r.url,
      type: r.type,
      category: r.category,
      caption: r.caption,
      updatedAt: new Date(r.updated_at).toISOString(),
    })).catch(next)
  } catch (e) { next(e) }
})
app.delete('/api/gallery/:id', async (req, res, next) => {
  try {
    const [r] = await pool.query('DELETE FROM gallery_items WHERE id = ?', [req.params.id])
    if (!(r as any).affectedRows) return res.status(404).json({ error: 'Not found' })
    res.status(204).send()
  } catch (e) { next(e) }
})

// --- TOUR GUIDES ---
app.get('/api/tour-guides', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tour_guides ORDER BY id')
    const [bookRows] = await pool.query('SELECT id, guide_id FROM bookings WHERE guide_id IS NOT NULL')
    const by: Record<string, string[]> = {}
    for (const b of bookRows as any[]) {
      by[b.guide_id] = by[b.guide_id] ?? []
      by[b.guide_id].push(b.id)
    }
    res.json((rows as any[]).map((g) => ({
      id: g.id,
      userId: g.user_id,
      languages: parseJson<string[]>(g.languages, []),
      bio: g.bio,
      availability: g.availability,
      activeBookingIds: by[g.id] ?? [],
      updatedAt: new Date(g.updated_at).toISOString(),
    })))
  } catch (e) { next(e) }
})
app.post('/api/tour-guides', async (req, res, next) => {
  try {
    const b = req.body as any
    const id = b.id ?? randomUUID()
    await pool.query(
      `INSERT INTO tour_guides (id, user_id, languages, bio, availability) VALUES (?, ?, ?, ?, ?)`,
      [id, b.userId, JSON.stringify(b.languages ?? []), b.bio ?? '', b.availability ?? 'available'],
    )
    const [rows] = await pool.query('SELECT * FROM tour_guides WHERE id = ?', [id])
    const g = (rows as any[])[0]
    res.status(201).json({
      id: g.id,
      userId: g.user_id,
      languages: parseJson<string[]>(g.languages, []),
      bio: g.bio,
      availability: g.availability,
      activeBookingIds: [],
      updatedAt: new Date(g.updated_at).toISOString(),
    })
  } catch (e) { next(e) }
})
app.patch('/api/tour-guides/:id', async (req, res, next) => {
  try {
    const id = String(req.params.id)
    const b = req.body as any
    const fields: string[] = []
    const vals: unknown[] = []
    if (b.userId !== undefined) { fields.push('user_id = ?'); vals.push(b.userId) }
    if (b.languages !== undefined) { fields.push('languages = ?'); vals.push(JSON.stringify(b.languages ?? [])) }
    if (b.bio !== undefined) { fields.push('bio = ?'); vals.push(b.bio) }
    if (b.availability !== undefined) { fields.push('availability = ?'); vals.push(b.availability) }
    if (!fields.length) return res.status(400).json({ error: 'No fields' })
    vals.push(id)
    await pool.query(`UPDATE tour_guides SET ${fields.join(', ')} WHERE id = ?`, vals)
    const [rows] = await pool.query('SELECT * FROM tour_guides WHERE id = ?', [id])
    const g = (rows as any[])[0]
    if (!g) return res.status(404).json({ error: 'Not found' })
    res.json({
      id: g.id,
      userId: g.user_id,
      languages: parseJson<string[]>(g.languages, []),
      bio: g.bio,
      availability: g.availability,
      activeBookingIds: [],
      updatedAt: new Date(g.updated_at).toISOString(),
    })
  } catch (e) { next(e) }
})
app.delete('/api/tour-guides/:id', async (req, res, next) => {
  try {
    const [r] = await pool.query('DELETE FROM tour_guides WHERE id = ?', [req.params.id])
    if (!(r as any).affectedRows) return res.status(404).json({ error: 'Not found' })
    res.status(204).send()
  } catch (e) { next(e) }
})

// --- ACTIVITY LOGS ---
app.get('/api/activity-logs', (req, res, next) =>
  simpleList(res, 'SELECT * FROM activity_logs ORDER BY at DESC LIMIT 500', (r) => ({
    id: r.id,
    actor: r.actor,
    action: r.action,
    entity: r.entity,
    at: new Date(r.at).toISOString(),
  })).catch(next),
)
app.post('/api/activity-logs', async (req, res, next) => {
  try {
    const b = req.body as any
    const id = b.id ?? randomUUID()
    await pool.query(
      `INSERT INTO activity_logs (id, actor, action, entity, at) VALUES (?, ?, ?, ?, ?)`,
      [id, b.actor, b.action, b.entity, b.at ? new Date(b.at) : new Date()],
    )
    return simpleGet(res, 'SELECT * FROM activity_logs WHERE id = ?', id, (r) => ({
      id: r.id,
      actor: r.actor,
      action: r.action,
      entity: r.entity,
      at: new Date(r.at).toISOString(),
    })).catch(next)
  } catch (e) { next(e) }
})

// --- ADMIN NOTIFICATIONS ---
app.get('/api/admin-notifications', (req, res, next) =>
  simpleList(res, 'SELECT * FROM admin_notifications ORDER BY created_at DESC', (r) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    read: !!r.read_flag,
    createdAt: new Date(r.created_at).toISOString(),
  })).catch(next),
)
app.post('/api/admin-notifications', async (req, res, next) => {
  try {
    const b = req.body as any
    const id = b.id ?? randomUUID()
    await pool.query(
      `INSERT INTO admin_notifications (id, type, title, read_flag) VALUES (?, ?, ?, ?)`,
      [id, b.type ?? 'system', b.title, b.read ? 1 : 0],
    )
    return simpleGet(res, 'SELECT * FROM admin_notifications WHERE id = ?', id, (r) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      read: !!r.read_flag,
      createdAt: new Date(r.created_at).toISOString(),
    })).catch(next)
  } catch (e) { next(e) }
})
app.patch('/api/admin-notifications/:id', async (req, res, next) => {
  try {
    const id = String(req.params.id)
    const b = req.body as any
    const fields: string[] = []
    const vals: unknown[] = []
    if (b.read !== undefined) { fields.push('read_flag = ?'); vals.push(b.read ? 1 : 0) }
    if (b.title !== undefined) { fields.push('title = ?'); vals.push(b.title) }
    if (!fields.length) return res.status(400).json({ error: 'No fields' })
    vals.push(id)
    await pool.query(`UPDATE admin_notifications SET ${fields.join(', ')} WHERE id = ?`, vals)
    return simpleGet(res, 'SELECT * FROM admin_notifications WHERE id = ?', id, (r) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      read: !!r.read_flag,
      createdAt: new Date(r.created_at).toISOString(),
    })).catch(next)
  } catch (e) { next(e) }
})
app.post('/api/admin-notifications/mark-all-read', async (_req, res, next) => {
  try {
    await pool.query('UPDATE admin_notifications SET read_flag = 1')
    const [rows] = await pool.query('SELECT * FROM admin_notifications ORDER BY created_at DESC')
    res.json((rows as any[]).map((r) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      read: !!r.read_flag,
      createdAt: new Date(r.created_at).toISOString(),
    })))
  } catch (e) { next(e) }
})

// --- MONTHLY METRICS ---
app.get('/api/monthly-metrics', (req, res, next) =>
  simpleList(res, 'SELECT * FROM monthly_metrics ORDER BY sort_order ASC, month_label ASC', (r) => ({
    month: r.month_label,
    bookings: r.bookings,
    revenueRwf: Number(r.revenue_rwf),
  })).catch(next),
)

// --- ROLE DEFINITIONS (bulk replace) ---
app.get('/api/role-definitions', (req, res, next) =>
  simpleList(res, 'SELECT * FROM role_definitions ORDER BY id', (r) => ({
    id: r.id,
    label: r.label,
    permissions: parseJson<string[]>(r.permissions, []),
  })).catch(next),
)
app.put('/api/role-definitions', async (req, res, next) => {
  const list = req.body as any[]
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
    res.json((rows as any[]).map((r) => ({
      id: r.id,
      label: r.label,
      permissions: parseJson<string[]>(r.permissions, []),
    })))
  } catch (e) {
    await conn.rollback()
    next(e)
  } finally {
    conn.release()
  }
})

// --- SITE SETTINGS (singleton) ---
app.get('/api/site-settings', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT payload FROM site_settings WHERE singleton = 1 LIMIT 1')
    const payload = parseJson<Record<string, unknown>>((rows as any[])[0]?.payload, {})
    res.json(payload)
  } catch (e) { next(e) }
})
app.patch('/api/site-settings', async (req, res, next) => {
  try {
    const patch = req.body as Record<string, unknown>
    const [rows] = await pool.query('SELECT payload FROM site_settings WHERE singleton = 1 LIMIT 1')
    const current = parseJson<Record<string, unknown>>((rows as any[])[0]?.payload, {})
    const nextPayload = { ...current, ...patch }
    await pool.query('UPDATE site_settings SET payload = ? WHERE singleton = 1', [JSON.stringify(nextPayload)])
    res.json(nextPayload)
  } catch (e) { next(e) }
})

// --- BOOTSTRAP (one call for admin app hydration) ---
app.get('/api/bootstrap', async (_req, res, next) => {
  try {
    const [users] = await pool.query('SELECT * FROM tourism_users ORDER BY created_at DESC')
    const [packageCategories] = await pool.query('SELECT * FROM package_categories ORDER BY name')
    const destinations = await destinationsWithLinks()
    const packages = await packagesFull()
    const [bookings] = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC')
    const [payments] = await pool.query('SELECT * FROM payments ORDER BY created_at DESC')
    const [messages] = await pool.query('SELECT * FROM message_threads ORDER BY created_at DESC')
    let carRentalRows: any[] = []
    try {
      const [crr] = await pool.query('SELECT * FROM car_rental_requests ORDER BY created_at DESC')
      carRentalRows = (crr as any[]) ?? []
    } catch {
      carRentalRows = []
    }
    let carRentalVehicleRows: any[] = []
    try {
      const [cv] = await pool.query(
        'SELECT * FROM car_rental_vehicles ORDER BY sort_order ASC, title ASC',
      )
      carRentalVehicleRows = (cv as any[]) ?? []
    } catch {
      carRentalVehicleRows = []
    }
    const [reviews] = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC')
    const [blogCategories] = await pool.query('SELECT * FROM blog_categories ORDER BY name')
    const [posts] = await pool.query('SELECT * FROM blog_posts ORDER BY updated_at DESC')
    const [gallery] = await pool.query('SELECT * FROM gallery_items ORDER BY updated_at DESC')
    const [guides] = await pool.query('SELECT * FROM tour_guides ORDER BY id')
    const [monthlyMetrics] = await pool.query('SELECT * FROM monthly_metrics ORDER BY sort_order ASC')
    const [notifications] = await pool.query('SELECT * FROM admin_notifications ORDER BY created_at DESC')
    const [activityLogs] = await pool.query('SELECT * FROM activity_logs ORDER BY at DESC LIMIT 200')
    const [roleDefinitions] = await pool.query('SELECT * FROM role_definitions ORDER BY id')
    const [settingsRow] = await pool.query('SELECT payload FROM site_settings WHERE singleton = 1 LIMIT 1')

    const settings = parseJson<Record<string, unknown>>((settingsRow as any[])[0]?.payload, {})

    res.json({
      tourismUsers: (users as any[]).map((r) => ({
        id: r.id,
        firstName: r.first_name,
        lastName: r.last_name,
        email: r.email,
        phone: r.phone,
        role: r.role,
        status: r.status,
        createdAt: new Date(r.created_at).toISOString(),
      })),
      packageCategories: (packageCategories as any[]).map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
      destinations,
      packages,
      bookings: (bookings as any[]).map((r) => ({
        id: r.id,
        userId: r.user_id,
        packageId: r.package_id,
        startDate: (typeof r.start_date === 'string' ? r.start_date : new Date(r.start_date).toISOString()).slice(0, 10),
        status: r.status,
        totalRwf: Number(r.total_rwf),
        guideId: r.guide_id,
        createdAt: new Date(r.created_at).toISOString(),
      })),
      payments: (payments as any[]).map((r) => ({
        id: r.id,
        bookingId: r.booking_id,
        amountRwf: Number(r.amount_rwf),
        status: r.status,
        method: r.method,
        reference: r.reference,
        createdAt: new Date(r.created_at).toISOString(),
      })),
      messages: (messages as any[]).map((r) => ({
        id: r.id,
        source: r.source,
        name: r.name,
        email: r.email,
        subject: r.subject,
        body: r.body,
        read: !!r.read_flag,
        createdAt: new Date(r.created_at).toISOString(),
      })),
      carRentalRequests: carRentalRows.map((r) => mapCarRentalRow(r)),
      carRentalVehicles: carRentalVehicleRows.map((r) => mapCarRentalVehicleRow(r)),
      reviews: (reviews as any[]).map((r) => ({
        id: r.id,
        userId: r.user_id,
        packageId: r.package_id,
        rating: r.rating,
        comment: r.comment,
        status: r.status,
        featured: !!r.featured,
        createdAt: new Date(r.created_at).toISOString(),
      })),
      blogCategories: (blogCategories as any[]).map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
      posts: (posts as any[]).map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        body: p.body,
        categoryId: p.category_id,
        coverImageUrl: p.cover_image_url,
        published: !!p.published,
        updatedAt: new Date(p.updated_at).toISOString(),
      })),
      gallery: (gallery as any[]).map((g) => ({
        id: g.id,
        url: g.url,
        type: g.type,
        category: g.category,
        caption: g.caption,
        updatedAt: new Date(g.updated_at).toISOString(),
      })),
      guides: (guides as any[]).map((g) => ({
        id: g.id,
        userId: g.user_id,
        languages: parseJson<string[]>(g.languages, []),
        bio: g.bio,
        availability: g.availability,
        activeBookingIds: [],
        updatedAt: new Date(g.updated_at).toISOString(),
      })),
      monthlyMetrics: (monthlyMetrics as any[]).map((m) => ({
        month: m.month_label,
        bookings: m.bookings,
        revenueRwf: Number(m.revenue_rwf),
      })),
      notifications: (notifications as any[]).map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        read: !!n.read_flag,
        createdAt: new Date(n.created_at).toISOString(),
      })),
      activityLogs: (activityLogs as any[]).map((a) => ({
        id: a.id,
        actor: a.actor,
        action: a.action,
        entity: a.entity,
        at: new Date(a.at).toISOString(),
      })),
      roleDefinitions: (roleDefinitions as any[]).map((r) => ({
        id: r.id,
        label: r.label,
        permissions: parseJson<string[]>(r.permissions, []),
      })),
      settings,
    })
  } catch (e) {
    next(e)
  }
})

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // eslint-disable-next-line no-console
  console.error(err)
  res.status(500).json({ error: err?.message ?? 'Internal Server Error' })
})

void pool
  .query(
    `
  CREATE TABLE IF NOT EXISTS car_rental_requests (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(64) NOT NULL DEFAULT '',
    vehicle_class VARCHAR(64) NOT NULL,
    pickup_date DATE NOT NULL,
    return_date DATE NOT NULL,
    pickup_location VARCHAR(512) NOT NULL DEFAULT '',
    return_location VARCHAR(512) NOT NULL DEFAULT '',
    driver_option VARCHAR(64) NOT NULL DEFAULT 'self-drive',
    extras_json JSON NOT NULL,
    message TEXT NOT NULL DEFAULT '',
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    admin_notes TEXT NOT NULL DEFAULT '',
    read_flag TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`,
  )
  .catch(() => {})

void pool
  .query(
    `
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
`,
  )
  .catch(() => {})

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Tourism API listening on http://localhost:${config.port}`)
})

