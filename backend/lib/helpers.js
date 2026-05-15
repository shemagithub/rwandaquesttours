export function parseJson(v, fallback) {
  if (v == null) return fallback
  if (typeof v === 'string') {
    try {
      return JSON.parse(v)
    } catch {
      return fallback
    }
  }
  if (typeof v === 'object') return v
  return fallback
}

export async function simpleList(pool, res, sql, map) {
  const [rows] = await pool.query(sql)
  res.json(rows.map(map))
}

export async function simpleGet(pool, res, sql, id, map) {
  const [rows] = await pool.query(sql, [id])
  const r = rows[0]
  if (!r) return res.status(404).json({ error: 'Not found' })
  res.json(map(r))
}
