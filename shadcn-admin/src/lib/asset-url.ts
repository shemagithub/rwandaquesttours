function normalizeOrigin(origin: string): string {
  return origin.replace(/\/$/, '')
}

/**
 * Resolve a stored media URL into a browser-loadable URL.
 * - If the value is absolute (`http...`), return as-is.
 * - If the value is `/uploads/...`, prefix with API origin when available.
 * - Otherwise return as-is (relative paths like `/images/...`).
 */
export function resolveAssetUrl(url: string): string {
  const u = String(url ?? '').trim()
  if (!u) return ''
  if (/^https?:\/\//i.test(u)) return u
  if (u.startsWith('/uploads/')) {
    const base = String(import.meta.env.VITE_API_URL ?? '').trim()
    // Dev: if base empty, use same origin (you must proxy `/uploads` or serve from same host).
    if (!base) return u
    return `${normalizeOrigin(base)}${u}`
  }
  return u
}

