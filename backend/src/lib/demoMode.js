/**
 * DEMO MODE
 * ============================================================
 * Turn on with DEMO_MODE=true. Used for the public portfolio demo.
 *
 * In demo mode the app must never:
 *   - spend money (OpenAI, Gemini, Azure, RapidAPI, NewsAPI, Twilio, Cloudinary, Stripe)
 *   - act as Cornell on a real account (LinkedIn, Twitter/X, Instagram, Spotify, email)
 *
 * It protects in three layers, so one mistake can't leak through:
 *   1. The demo server is started WITHOUT any API keys (see DEMO_MODE.md).
 *   2. demoGuard blocks every route that sends, posts, connects, uploads, or applies.
 *   3. blockOutboundRequests stops ANY http/https/fetch call to an outside host.
 * See DEMO_MODE.md for the full explanation.
 */
const http = require('http')
const https = require('https')

const isDemoMode = process.env.DEMO_MODE === 'true'

class DemoModeError extends Error {
  constructor(what) {
    super(`${what} is turned off in the demo`)
    this.name = 'DemoModeError'
    this.status = 403
  }
}

// Routes that would reach a real outside service or a real person.
// Reading data (GET) is fine; these are the actions that are not.
const BLOCKED_ROUTES = [
  { method: 'POST',   path: /^\/fans\/import\/twitter/,   what: 'Importing fans from Twitter' },
  { method: 'POST',   path: /^\/fans\/dm/,                what: 'Sending DMs to fans' },
  { method: 'POST',   path: /^\/gigs\/trigger-scan/,      what: 'Scanning LinkedIn for gigs' },
  { method: 'POST',   path: /^\/gigs\/linkedin/,          what: 'Searching LinkedIn' },
  { method: 'POST',   path: /^\/gigs\/[^/]+\/apply/,      what: 'Applying to gigs' },
  { method: 'POST',   path: /^\/gigs\/bulk-apply/,        what: 'Auto-applying to gigs' },
  { method: 'POST',   path: /^\/social\/connect/,         what: 'Connecting social accounts' },
  { method: 'POST',   path: /^\/media\/upload/,           what: 'Uploading media' },
  { method: 'DELETE', path: /^\/media\//,                 what: 'Deleting media' },
  { method: 'POST',   path: /^\/resume\/submit/,          what: 'Emailing your resume' },
  { method: 'ALL',    path: /^\/agent/,                   what: 'The autonomous agent' },
  { method: 'ALL',    path: /^\/linkedin/,                what: 'The LinkedIn agent' },
]

// Express middleware, mounted on /api. Answers blocked routes with a friendly 403.
function demoGuard(req, res, next) {
  const blocked = BLOCKED_ROUTES.find(
    (r) => (r.method === 'ALL' || r.method === req.method) && r.path.test(req.path)
  )
  if (!blocked) return next()
  res.status(403).json({
    demo: true,
    error: `${blocked.what} is turned off in the demo. In the real app this connects to live accounts.`,
  })
}

// Hosts the demo is allowed to talk to over http(s). Postgres uses its own
// protocol (not http), so the database keeps working.
const ALLOWED_HOSTS = ['localhost', '127.0.0.1', '::1']

function hostOf(input) {
  try {
    if (typeof input === 'string' || input instanceof URL) return new URL(input).hostname
    if (input && input.url) return new URL(input.url).hostname
    if (input && (input.hostname || input.host)) return String(input.hostname || input.host).split(':')[0]
  } catch (_) { /* fall through */ }
  return ''
}

/**
 * Last line of defense: patches Node's http, https, and fetch so a request to
 * any outside host fails, even from code we forgot to guard.
 */
function blockOutboundRequests() {
  const guard = (original, label) =>
    function guarded(input, ...rest) {
      const host = hostOf(input)
      if (host && !ALLOWED_HOSTS.includes(host)) {
        console.warn(`🛡️  Demo mode blocked an outbound ${label} request to ${host}`)
        throw new DemoModeError(`Calling ${host}`)
      }
      return original.call(this, input, ...rest)
    }

  http.request = guard(http.request, 'http')
  http.get = guard(http.get, 'http')
  https.request = guard(https.request, 'https')
  https.get = guard(https.get, 'https')
  if (typeof globalThis.fetch === 'function') {
    const originalFetch = globalThis.fetch
    globalThis.fetch = async (input, init) => {
      const host = hostOf(input)
      if (host && !ALLOWED_HOSTS.includes(host)) {
        console.warn(`🛡️  Demo mode blocked an outbound fetch to ${host}`)
        throw new DemoModeError(`Calling ${host}`)
      }
      return originalFetch(input, init)
    }
  }
}

// Secrets that must NOT be set on a demo server. If any are, refuse to start.
const SECRET_ENV_VARS = [
  'OPENAI_API_KEY', 'GEMINI_API_KEY', 'AZURE_OPENAI_KEY', 'AZURE_OPENAI_ENDPOINT',
  'RAPIDAPI_KEY', 'NEWS_API_KEY', 'LINKEDIN_SESSION_COOKIE',
  'TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN',
  'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET',
  'SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET',
  'STRIPE_SECRET_KEY', 'SENDGRID_API_KEY', 'SMTP_PASS',
  'TWITTER_BEARER_TOKEN', 'INSTAGRAM_ACCESS_TOKEN',
]

function assertNoSecrets() {
  const found = SECRET_ENV_VARS.filter((name) => process.env[name])
  if (found.length) {
    throw new Error(
      `DEMO_MODE is on but real secrets are set: ${found.join(', ')}. ` +
      'Remove them from the demo environment. A public demo should never hold real keys.'
    )
  }
}

module.exports = { isDemoMode, DemoModeError, demoGuard, blockOutboundRequests, assertNoSecrets, SECRET_ENV_VARS }
