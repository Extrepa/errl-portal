import express from 'express'
import cors from 'cors'
import { z } from 'zod'
import { chromium, devices, type Browser, type BrowserContext, type Page } from 'playwright'

// Simple in-memory session store
interface SessionLogs {
  console: Array<{ type: string; text: string; ts: number }>
  network: Array<{ method: string; url: string; status?: number; ts: number }>
}
interface Session {
  id: string
  context: BrowserContext
  page: Page
  logs: SessionLogs
}

const sessions = new Map<string, Session>()
let browser: Browser | null = null

const LOG_LIMIT = 500
function pushBounded<T>(arr: T[], item: T) {
  arr.push(item)
  if (arr.length > LOG_LIMIT) arr.shift()
}

async function ensureBrowser(headless: boolean) {
  if (browser && browser.isConnected()) return browser
  browser = await chromium.launch({ headless })
  return browser
}

async function createOrGetSession(id: string, opts: { headless: boolean; device?: string; viewport?: { width: number; height: number }; userAgent?: string }) {
  let sess = sessions.get(id)
  if (sess && !sess.page.isClosed()) return sess

  const b = await ensureBrowser(opts.headless)
  const device = opts.device ? devices[opts.device] : undefined
  const context = await b.newContext({
    ...(device ?? {}),
    viewport: opts.viewport ?? device?.viewport,
    userAgent: opts.userAgent ?? device?.userAgent,
  })
  const page = await context.newPage()

  const logs: SessionLogs = { console: [], network: [] }

  page.on('console', (msg) => {
    pushBounded(logs.console, { type: msg.type(), text: msg.text(), ts: Date.now() })
  })
  page.on('request', (req) => {
    pushBounded(logs.network, { method: req.method(), url: req.url(), ts: Date.now() })
  })
  page.on('response', async (res) => {
    const req = res.request()
    const idx = logs.network.findIndex((n) => n.url === req.url() && !('status' in n))
    const entry = { method: req.method(), url: req.url(), status: res.status(), ts: Date.now() }
    if (idx >= 0) logs.network[idx] = entry
    else pushBounded(logs.network, entry)
  })

  sess = { id, context, page, logs }
  sessions.set(id, sess)
  return sess
}

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

const SessionSchema = z.object({
  id: z.string().default('default'),
  headless: z.boolean().optional().default(true),
  device: z.string().optional(),
  viewport: z.object({ width: z.number().int().positive(), height: z.number().int().positive() }).optional(),
  userAgent: z.string().optional(),
})

app.post('/session', async (req, res) => {
  try {
    const body = SessionSchema.parse(req.body ?? {})
    const sess = await createOrGetSession(body.id, body)
    res.json({ ok: true, sessionId: sess.id })
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e?.message ?? String(e) })
  }
})

const WithSession = z.object({ sessionId: z.string().default('default') })

app.post('/goto', async (req, res) => {
  try {
    const body = WithSession.extend({ url: z.string().url(), waitUntil: z.enum(['load', 'domcontentloaded', 'networkidle']).optional(), timeout: z.number().int().optional() }).parse(req.body)
    const sess = await createOrGetSession(body.sessionId, { headless: true })
    await sess.page.goto(body.url, { waitUntil: body.waitUntil ?? 'load', timeout: body.timeout ?? 30000 })
    res.json({ ok: true })
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e?.message ?? String(e) })
  }
})

app.post('/click', async (req, res) => {
  try {
    const body = WithSession.extend({ selector: z.string(), button: z.enum(['left', 'right', 'middle']).optional(), clickCount: z.number().int().optional(), delay: z.number().int().optional() }).parse(req.body)
    const sess = await createOrGetSession(body.sessionId, { headless: true })
    await sess.page.click(body.selector, { button: body.button ?? 'left', clickCount: body.clickCount ?? 1, delay: body.delay })
    res.json({ ok: true })
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e?.message ?? String(e) })
  }
})

app.post('/type', async (req, res) => {
  try {
    const body = WithSession.extend({ selector: z.string(), text: z.string(), delay: z.number().int().optional(), clear: z.boolean().optional() }).parse(req.body)
    const sess = await createOrGetSession(body.sessionId, { headless: true })
    if (body.clear) await sess.page.fill(body.selector, '')
    await sess.page.type(body.selector, body.text, { delay: body.delay })
    res.json({ ok: true })
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e?.message ?? String(e) })
  }
})

app.post('/wait', async (req, res) => {
  try {
    const body = WithSession.extend({ selector: z.string(), state: z.enum(['attached', 'detached', 'visible', 'hidden']).optional(), timeout: z.number().int().optional() }).parse(req.body)
    const sess = await createOrGetSession(body.sessionId, { headless: true })
    await sess.page.waitForSelector(body.selector, { state: body.state ?? 'visible', timeout: body.timeout ?? 30000 })
    res.json({ ok: true })
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e?.message ?? String(e) })
  }
})

app.get('/screenshot', async (req, res) => {
  try {
    const sessionId = (req.query.sessionId as string) || 'default'
    const fullPage = (req.query.fullPage as string) === 'true'
    const sess = await createOrGetSession(sessionId, { headless: true })
    const buf = await sess.page.screenshot({ fullPage })
    res.set('Content-Type', 'image/png')
    res.send(buf)
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e?.message ?? String(e) })
  }
})

app.get('/dom', async (req, res) => {
  try {
    const sessionId = (req.query.sessionId as string) || 'default'
    const sess = await createOrGetSession(sessionId, { headless: true })
    const html = await sess.page.content()
    res.type('text/html').send(html)
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e?.message ?? String(e) })
  }
})

app.get('/logs', async (req, res) => {
  try {
    const sessionId = (req.query.sessionId as string) || 'default'
    const sess = await createOrGetSession(sessionId, { headless: true })
    res.json({ ok: true, logs: sess.logs })
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e?.message ?? String(e) })
  }
})

app.post('/eval', async (req, res) => {
  try {
    const body = WithSession.extend({ expression: z.string() }).parse(req.body)
    const sess = await createOrGetSession(body.sessionId, { headless: true })
    const result = await sess.page.evaluate((expr) => {
      // eslint-disable-next-line no-eval
      return (0, eval)(expr)
    }, body.expression)
    res.json({ ok: true, result })
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e?.message ?? String(e) })
  }
})

app.post('/key', async (req, res) => {
  try {
    const body = WithSession.extend({ key: z.string() }).parse(req.body)
    const sess = await createOrGetSession(body.sessionId, { headless: true })
    await sess.page.keyboard.press(body.key)
    res.json({ ok: true })
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e?.message ?? String(e) })
  }
})

app.post('/hover', async (req, res) => {
  try {
    const body = WithSession.extend({ selector: z.string() }).parse(req.body)
    const sess = await createOrGetSession(body.sessionId, { headless: true })
    await sess.page.hover(body.selector)
    res.json({ ok: true })
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e?.message ?? String(e) })
  }
})

app.post('/scroll', async (req, res) => {
  try {
    const body = WithSession.extend({ to: z.enum(['top', 'bottom']).optional(), x: z.number().optional(), y: z.number().optional() }).parse(req.body)
    const sess = await createOrGetSession(body.sessionId, { headless: true })
    await sess.page.evaluate(({ to, x, y }) => {
      if (to === 'top') window.scrollTo({ top: 0, behavior: 'smooth' })
      else if (to === 'bottom') window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
      else if (x != null || y != null) window.scrollBy({ left: x ?? 0, top: y ?? 0, behavior: 'smooth' })
    }, { to: body.to, x: body.x, y: body.y })
    res.json({ ok: true })
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e?.message ?? String(e) })
  }
})

app.post('/close', async (req, res) => {
  try {
    const body = WithSession.parse(req.body)
    const sess = sessions.get(body.sessionId)
    if (sess) {
      await sess.page.close().catch(() => {})
      await sess.context.close().catch(() => {})
      sessions.delete(body.sessionId)
    }
    res.json({ ok: true })
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e?.message ?? String(e) })
  }
})

const PORT = Number(process.env.AGENT_BROWSER_PORT || process.env.PORT || 9323)
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[agent-browser] listening on http://localhost:${PORT}`)
})
