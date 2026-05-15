/**
 * Backend base URL:
 * - Development: omit REACT_APP_API_URL to use CRA proxy (`package.json` "proxy") → same-origin `/api`.
 * - Production: set REACT_APP_API_URL=https://your-api.example.com
 */
export function getApiBase() {
  return String(process.env.REACT_APP_API_URL || "").replace(/\/$/, "");
}

/** Absolute URL for API (or relative path when using dev proxy). */
export function apiUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const base = getApiBase();
  return base ? `${base}${p}` : p;
}

/** Images stored as `/uploads/...` need the API origin when the SPA is on another host. */
export function resolveMediaUrl(url) {
  const u = String(url ?? "").trim();
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  const path = u.startsWith("/") ? u : `/${u}`;
  const base = getApiBase();
  if (path.startsWith("/uploads/")) return base ? `${base}${path}` : path;
  return base ? `${base}${path}` : path;
}

export async function fetchJson(path, options = {}) {
  const res = await fetch(apiUrl(path), {
    ...options,
    headers: {
      Accept: "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || res.statusText || `HTTP ${res.status}`);
  }
  return res.json();
}

/** Rough display conversion when UI shows USD (packages are stored in RWF). */
export function rwfToUsdEstimate(rwf, rate = 1350) {
  const n = Number(rwf);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.max(0, Math.round(n / rate));
}
