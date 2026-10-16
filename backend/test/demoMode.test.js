// Proves the demo can't reach paid or personal services. Run: npm test
process.env.DEMO_MODE = 'true'
const { test } = require('node:test')
const assert = require('node:assert')
const https = require('https')
const { blockOutboundRequests, demoGuard, assertNoSecrets } = require('../src/lib/demoMode')

blockOutboundRequests()

test('blocks https requests to outside hosts', () => {
  assert.throws(() => https.get('https://api.openai.com/v1/models'), /turned off in the demo/)
})

test('blocks fetch to outside hosts', async () => {
  await assert.rejects(fetch('https://www.linkedin.com/jobs'), /turned off in the demo/)
})

test('the real OpenAI SDK cannot reach OpenAI', async () => {
  const OpenAI = require('openai')
  const client = new OpenAI({ apiKey: 'sk-test-not-real', maxRetries: 0 })
  await assert.rejects(client.models.list(), (err) => /turned off in the demo/.test(err.cause?.message))
})

test('the real Gemini SDK cannot reach Google', async () => {
  const { GoogleGenerativeAI } = require('@google/generative-ai')
  const model = new GoogleGenerativeAI('not-real').getGenerativeModel({ model: 'gemini-1.5-flash' })
  await assert.rejects(model.generateContent('hi'), /turned off in the demo/)
})

test('still allows localhost', () => {
  const req = https.request({ hostname: 'localhost', port: 1 })
  req.on('error', () => {})
  req.destroy()
})

test('refuses to start with real secrets set', () => {
  process.env.OPENAI_API_KEY = 'sk-real-looking'
  assert.throws(() => assertNoSecrets(), /OPENAI_API_KEY/)
  delete process.env.OPENAI_API_KEY
  assert.doesNotThrow(() => assertNoSecrets())
})

test('demoGuard blocks risky routes and allows reads', () => {
  const run = (method, path) => {
    let status = 200
    const res = { status(code) { status = code; return this }, json() { return this } }
    demoGuard({ method, path }, res, () => {})
    return status
  }
  assert.strictEqual(run('POST', '/gigs/12/apply'), 403)
  assert.strictEqual(run('POST', '/fans/dm'), 403)
  assert.strictEqual(run('POST', '/social/connect/instagram'), 403)
  assert.strictEqual(run('GET', '/linkedin/jobs'), 403)
  assert.strictEqual(run('GET', '/fans'), 200)
  assert.strictEqual(run('POST', '/campaigns'), 200)
})
