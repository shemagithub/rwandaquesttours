import { randomUUID } from 'crypto'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads')
const MAX_BYTES = 600 * 1024 * 1024

function parseDataUrl(dataUrl) {
  if (typeof dataUrl !== 'string') return null
  const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!m) return null
  const mime = m[1]
  const base64 = m[2]
  return { mime, base64 }
}

function extFromMime(mime) {
  if (mime === 'image/jpeg') return 'jpg'
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  if (mime === 'image/gif') return 'gif'
  if (mime === 'image/svg+xml') return 'svg'
  return null
}

export function registerUploadRoutes(app) {
  app.post('/api/uploads', async (req, res, next) => {
    try {
      const { dataUrl, filename } = req.body ?? {}
      const parsed = parseDataUrl(dataUrl)
      if (!parsed) return res.status(400).json({ error: 'Invalid dataUrl' })
      if (!String(parsed.mime).startsWith('image/')) {
        return res.status(400).json({ error: 'Only image uploads are supported' })
      }
      const ext = extFromMime(parsed.mime)
      if (!ext) return res.status(400).json({ error: `Unsupported image type: ${parsed.mime}` })

      await fs.mkdir(UPLOAD_DIR, { recursive: true })

      const id = randomUUID()
      const safeName =
        typeof filename === 'string' && filename.trim()
          ? filename.trim().replace(/[^\w.\-]+/g, '_')
          : 'image'
      const outName = `${id}-${safeName}.${ext}`.replace(/\.{2,}/g, '.')
      const outPath = path.join(UPLOAD_DIR, outName)

      const buf = Buffer.from(parsed.base64, 'base64')
      if (buf.length > MAX_BYTES) {
        return res.status(413).json({ error: 'File too large (max 600MB)' })
      }
      await fs.writeFile(outPath, buf)

      res.status(201).json({ url: `/uploads/${outName}`, mime: parsed.mime, bytes: buf.length })
    } catch (e) {
      next(e)
    }
  })
}

