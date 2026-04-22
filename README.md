# 🎵 FanFlow AI — Independent Artist Revenue Engine

> Turn your fanbase into a revenue machine. AI-powered fan monetization, gig auto-apply, and artist resume generation.

---

## What This App Does

FanFlow AI is a full-stack application for independent artists that:

- **Superfan Detector** — Scores every follower 0–100, identifies your top 1% who will actually spend money
- **AI Campaign Generator** — Creates DM scripts, captions, and campaign offers that convert fans to paying customers
- **Gig Engine** — Searches venues, sync deals (TV/Film/Games), LinkedIn, and brand deals 24/7 and auto-applies with your resume
- **AI Resume Builder** — Generates a professional artist resume from your social data
- **Analytics** — Deep fan growth, engagement, and revenue tracking
- **LinkedIn Matcher** — Connects you to industry professionals and brand deals

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| State | Zustand (persistent) |
| Charts | Recharts |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| AI | OpenAI GPT-4o-mini |
| Social | Twitter API v2, Instagram Graph API |
| Payments | Stripe |
| Email | Nodemailer / SendGrid |
| Auth | JWT (bcryptjs) |

---

## Project Structure

```
fanflow-ai/
├── frontend/          # React + Vite + Tailwind
│   └── src/
│       ├── pages/     # Landing, Dashboard, Superfans, Campaigns, GigEngine, ResumeAI, Analytics, Settings
│       ├── components/
│       │   ├── bento/ # BentoGrid, BentoCard, StatCard, RevenueCard, FanScoreCard
│       │   ├── layout/ # Sidebar, Navbar
│       │   └── ui/    # Button, Toggle, Badge, Slider, Modal, Input
│       ├── services/  # api.js, fanService, gigService, aiService, resumeService
│       └── store/     # artistStore (Zustand)
└── backend/           # Node.js + Express
    └── src/
        ├── routes/    # auth, artist, fans, gigs, resume, campaigns, ai
        ├── services/  # openaiService, twitterService, instagramService, gigSearchService, emailService, stripeService
        ├── middleware/ # auth (JWT), errorHandler
        └── db/        # PostgreSQL pool, migrations
```

---

## ⚡ STEP-BY-STEP SETUP (exact order)

### Step 1 — Clone / Init

```bash
# If you're starting fresh:
mkdir fanflow-ai
cd fanflow-ai
git init
git branch -M main
```

### Step 2 — Copy all files into the structure above

Place the files from this zip/export into their correct directories as shown in the folder tree.

### Step 3 — Setup Frontend

```bash
cd frontend

# Install all dependencies
npm install

# Verify Tailwind is configured
# (tailwind.config.js already created — just confirm it exists)
ls tailwind.config.js

# Copy .env (edit API key values)
cp .env .env.local
```

**Edit `frontend/.env`:**
```
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY_HERE
```

### Step 4 — Setup Backend

```bash
cd ../backend

# Install all dependencies
npm install
```

**Edit `backend/.env`** — fill in these required keys:
```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/fanflow_db
JWT_SECRET=your_secret_minimum_32_chars_long
OPENAI_API_KEY=sk-...
TWITTER_BEARER_TOKEN=AAAA...
STRIPE_SECRET_KEY=sk_test_...
SMTP_PASS=your_sendgrid_api_key
```

### Step 5 — Setup PostgreSQL Database

```bash
# Make sure PostgreSQL is running, then:
createdb fanflow_db

# Run migrations
cd backend
node src/db/migrate.js

# You should see:
# → Running 001_init.sql
# ✅ 001_init.sql completed
# ✅ Migrations complete!
```

### Step 6 — Start Backend

```bash
# From /backend
npm run dev

# Should see:
# 🎵 FanFlow AI Backend running on port 5000
# 📦 PostgreSQL connected
```

### Step 7 — Start Frontend

```bash
# New terminal, from /frontend
npm run dev

# Should see:
# ➜  Local:   http://localhost:3000/
```

### Step 8 — Open App

Visit `http://localhost:3000` — you'll see the landing page. Fill in your artist name/email and hit **Launch My Revenue Engine**.

---

## API Keys You Need

### Required (app won't work without these)
| Key | Where to get |
|-----|-------------|
| `OPENAI_API_KEY` | https://platform.openai.com/api-keys |
| `JWT_SECRET` | Any random 32+ character string |
| `DATABASE_URL` | Your local PostgreSQL |

### Optional (features degrade gracefully without these)
| Key | Where to get | What it enables |
|-----|-------------|-----------------|
| `TWITTER_BEARER_TOKEN` | https://developer.twitter.com | Real fan import |
| `STRIPE_SECRET_KEY` | https://dashboard.stripe.com | Payments / Pro plan |
| `SMTP_PASS` | https://sendgrid.com (free tier) | Application emails |
| Instagram Graph API | https://developers.facebook.com | Instagram fan data |

---

## Git Workflow (after initial setup)

```bash
# After making changes:
git add .
git commit -m "feat: description of change"

# Push to GitHub
git remote add origin https://github.com/yourusername/fanflow-ai.git
git push -u origin main

# Create feature branch
git checkout -b feature/new-feature-name
git push origin feature/new-feature-name
```

---

## Deployment

### Frontend (Vercel — free)
```bash
cd frontend
npm run build
# Deploy dist/ to Vercel
# Set VITE_API_URL to your backend URL
```

### Backend (Railway or Render — free tier)
```bash
# Set all env vars in Railway/Render dashboard
# Use DATABASE_URL from Railway PostgreSQL plugin
# Set NODE_ENV=production
```

---

## Monetization Model

| Tier | Price | Features |
|------|-------|---------|
| Free | $0/mo | Basic analytics, 3 campaigns/month |
| Pro | $19/mo | Unlimited campaigns, AI manager, auto-apply |
| Revenue Share | 5% | Optional — % of revenue generated via FanFlow |

---

## Features Roadmap

- [x] Superfan detection and scoring
- [x] AI campaign generator (6 types)
- [x] Gig auto-apply engine (venues, sync, LinkedIn)
- [x] AI resume builder
- [x] Fan analytics dashboard
- [x] Twitter fan import
- [ ] Instagram DM automation
- [ ] Spotify data integration
- [ ] TikTok fan scoring
- [ ] Mobile app (React Native)
- [ ] Stripe marketplace for fan purchases
- [ ] AI chat manager (GPT-powered)
- [ ] Auto-posting to social platforms

---

## Color System

```css
--orange:       #FF6B00   /* Primary action, revenue, CTA */
--orange-light: #FF8C38   /* Hover states */
--purple:       #7B2FBE   /* Secondary, AI features */
--purple-light: #9B4FDE   /* Hover states */
--black:        #0A0A0F   /* Page background */
--black-light:  #12121A   /* Input backgrounds */
--black-card:   #1A1A26   /* Card backgrounds */
--black-border: #2A2A3A   /* Borders, dividers */
--white:        #F0F0FF   /* Primary text */
--muted:        #6B6B8A   /* Secondary text */
```

---

## Support & Contributing

Built for independent artists. Built with ❤️ by a music producer turned software engineer.

Questions? Open an issue or reach out.

---

*FanFlow AI — Chase the hustle. Independently.*











# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
