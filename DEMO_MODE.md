# FanFlow AI Demo Mode

*Written October 16, 2026*

This note explains why FanFlow AI has a demo mode, what it does, and how to run it.

---

## Why we built it

FanFlow AI is my strongest project, and I want employers to try it. But the full app can't simply be put online, because it's built to act **as me**, using **my paid accounts**:

| Feature | What it uses | What could go wrong if it were public |
| --- | --- | --- |
| AI campaigns, DM scripts, resume, chat | My OpenAI, Gemini, and Azure keys | Every visitor's click is billed to my card. A bot could run up hundreds of dollars overnight. |
| Gig Engine auto-apply | My LinkedIn session cookie and a "stealth" Puppeteer browser | Strangers could make my LinkedIn account do things. LinkedIn bans accounts for automation. |
| Applying to gigs, emailing my resume | My email account | Strangers could send real emails to real venues in my name. |
| Fan import, DMs, connecting accounts | My Twitter/X, Instagram, and Spotify access | Strangers could read my followers or message real fans. |
| Media upload | My Cloudinary account | Anyone could upload anything to storage I pay for. |
| Scheduled jobs | LinkedIn scans and weekly emails | These run on their own every day, even with no visitors. |

There was one more problem: the app had **no real login**. It used a shortcut where any token starting with `demo-token-` was accepted as me. That's fine on my laptop, but online it would let anyone in.

**Demo mode keeps the whole experience (every page, the data, the AI answers) and removes everything that costs money or touches a real account.**

---

## How it protects me: three layers

One safeguard can fail, so demo mode uses three. Each one would stop the problem even if the others missed it.

### Layer 1: The demo server has no keys at all

The demo runs **without** an OpenAI key, a LinkedIn cookie, or any other secret.

- In demo mode the server **doesn't read the `.env` file** (`backend/server.js`), so my real keys can't load by accident, even on my own laptop.
- If any real key is set anyway, the server **refuses to start** and names the key (`assertNoSecrets` in `backend/src/lib/demoMode.js`).

> **Why this is the most important layer:** code can have bugs, but a key that isn't there can't be stolen or spent.

### Layer 2: Risky actions are blocked at the door

`demoGuard` (in `backend/src/lib/demoMode.js`) sits in front of the API and answers these with a friendly "turned off in the demo" message (HTTP 403):

- Importing fans, sending DMs
- Scanning LinkedIn, applying and auto-applying to gigs
- Connecting Twitter, Instagram, and Spotify
- Uploading and deleting media
- Emailing my resume
- The whole autonomous agent and LinkedIn agent

**Reading** data still works, and so does saving drafts that only go to the database (like creating a campaign).

The scheduled jobs (daily LinkedIn scan, fan-score refresh, weekly email) **never start** in demo mode.

### Layer 3: No outside calls, period

`blockOutboundRequests` patches Node's `http`, `https`, and `fetch`, so **any** request to a host other than `localhost` fails. This catches code I forgot about. The tests prove that even the real OpenAI and Gemini SDKs get stopped.

The database still works, because PostgreSQL doesn't use `http`.

---

## What visitors see

- **One-click login:** "Start Free" and "Watch Demo" sign visitors in as **Demo Artist**, a made-up sample profile. The login is a real signed token that expires after 2 hours. The old `demo-token-` shortcut is never accepted in demo mode.
- **A banner on every page:** "Demo mode. Sample data only…"
- **Sample data:** 12 invented fans, 5 invented gigs, a past campaign, and notifications (`backend/src/db/seedDemo.js`). The data is reset every time the server starts, so if a visitor messes it up, a restart fixes it.
- **AI answers:** the pre-written answers that were already in each AI route as a fallback. The AI chat gives sample answers about gigs, money, and growing fans, and each answer says it's pre-written.
- **Blocked buttons:** a 🔒 message explaining what the real app would do.

---

## How to run it

**Backend** (needs PostgreSQL):

```bash
cd backend
DEMO_MODE=true \
JWT_SECRET=any-long-random-string \
DATABASE_URL=postgres://localhost:5432/fanflow_demo \
NODE_ENV=demo \
npm start
```

(Use `NODE_ENV=production` on a host like Railway, so the database uses SSL.)

**Frontend:**

```bash
cd frontend
VITE_DEMO_MODE=true VITE_API_URL=http://localhost:5050/api npm run dev
```

**Tests** (they prove the safeguards work):

```bash
cd backend
npm test
```

## What I tested (Oct 16, 2026)

- The 7 demo-mode tests pass, including the real OpenAI and Gemini SDKs being blocked
- With a real-looking key set, the server refused to start
- The fake `demo-token-` login was rejected
- All 11 risky actions returned 403
- The AI routes returned their pre-written answers, and the chat returned a sample answer
- In the browser: one-click login, banner, dashboard, gigs with match scores, and the Auto-Apply message
- Blocked outbound calls in the server log: **0**. Layers 1 and 2 stopped everything before layer 3 had to.

## Files changed

| File | What changed |
| --- | --- |
| `backend/src/lib/demoMode.js` | New: all three layers |
| `backend/src/routes/demo.js` | New: one-click demo login |
| `backend/src/db/seedDemo.js` | New: invented sample data |
| `backend/test/demoMode.test.js` | New: tests for the safeguards |
| `backend/server.js` | Skips `.env`, refuses real keys, blocks outbound calls, skips scheduled jobs, loads sample data |
| `backend/src/app.js` | Mounts the demo login and guard; removed leftover debug logging |
| `backend/src/services/openaiService.js` | No OpenAI client in demo; sample chat answers |
| `backend/src/middleware/auth.js` | The `demo-token-` shortcut can never work in demo mode |
| `frontend/src/services/demo.js` | New: demo flag and demo login |
| `frontend/src/components/layout/DemoBanner.jsx` | New: the banner |
| `frontend/src/services/api.js` | Sends the real saved login instead of a hard-coded test token; shows 🔒 messages |
| `frontend/src/pages/Landing.jsx` | "Start Free" and "Watch Demo" start the demo |
| `frontend/src/pages/GigEngine.jsx` | Apply buttons explain they're off in the demo |
| `frontend/src/services/gigService.js` | Match scores from the database now show up |

## Still to do before the real (non-demo) app goes public

Demo mode makes the demo safe. These need fixing before the **full** app is ever public:

- [ ] Build real sign-up and login. `/api/auth` currently mounts the login-check middleware, not login routes.
- [ ] Remove the `demo-token-` shortcut, or keep it strictly for local development.
- [ ] Decide whether LinkedIn automation stays. It breaks LinkedIn's rules and puts my account at risk. The RapidAPI job search is the safer route.
- [ ] Add rate limits to the AI routes so one user can't spend unlimited money.

See also: [PROTECTING-YOUR-PROJECTS.md](../PROTECTING-YOUR-PROJECTS.md) in my review folder.
