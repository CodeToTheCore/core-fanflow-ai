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



name: frontend-design
description: Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one. Helps with aesthetic direction, typography, and making choices that don't read as templated defaults.
license: Complete terms in LICENSE.txt
---
 
# Frontend Design
 
Approach this as the design lead at a small studio known for giving every client a visual identity that could not be mistaken for anyone else's. This client has already rejected proposals that felt templated, and is paying for a distinctive point of view: make deliberate, opinionated choices about palette, typography, and layout that are specific to this brief, and take one real aesthetic risk you can justify.
 
## Ground it in the subject
 
If the brief does not pin down what the product or subject is, pin it yourself before designing: name one concrete subject, its audience, and the page's single job, and state your choice. If there's any information in your memory about the human's preferences, context about what they're building, or designs you've made before – use that as a hint. The subject's own world, its materials, instruments, artifacts, and vernacular, is where distinctive choices come from. Build with the brief's real content and subject matter throughout.
 
## Design principles
 
For web designs, the hero is a thesis. Open with the most characteristic thing in the subject's world, in whatever form makes sense for it: a headline, an image, an animation, a live demo, an interactive moment. Be deliberate with your choice: a big number with a small label, supporting stats, and a gradient accent is the template answer, only use if that's truly the best option.
 
Typography carries the personality of the page. Pair the display and body faces deliberately, not the same families you would reach for on any other project, and set a clear type scale with intentional weights, widths, and spacing. Make the type treatment itself a memorable part of the design, not a neutral delivery vehicle for the content.
 
Structure is information. Structural devices, numbering, eyebrows, dividers, labels, should encode something true about the content, not decorate it. Many generic designs use numbered markers (01 / 02 / 03), but that's only appropriate if the content actually is a sequence - like a real process or a typed timeline where order carries information the reader needs. Question if choices like numbered markers actually make sense before incorporating them.
 
Leverage motion deliberately. Think about where and if animation can serve the subject: a page-load sequence, a scroll-triggered reveal, hover micro-interactions, ambient atmosphere. An orchestrated moment usually lands harder than scattered effects; choose what the direction calls for. However, sometimes less is more, and extra animation contributes to the feeling that the design is AI-generated.
 
Match complexity to the vision. Maximalist directions need elaborate execution; minimal directions need precision in spacing, type, and detail. Elegance is executing the chosen vision well.
 
Consider written content carefully. Often a design brief may not contain real content, and it's up to you to come up with copy. Copy can make a design feel as templated as the design itself. See the below section on writing for more guidance.
 
## Process: brainstorm, explore, plan, critique, build, critique again
 
For calibration: AI-generated design right now clusters around three looks: (1) a warm cream background (near #F4F1EA) with a high-contrast serif display and a terracotta accent; (2) a near-black background with a single bright acid-green or vermilion accent; (3) a broadsheet-style layout with hairline rules, zero border-radius, and dense newspaper-like columns. All three are legitimate for some briefs, but they are defaults rather than choices, and they appear regardless of subject. Where the brief pins down a visual direction, follow it exactly — the brief's own words always win, including when it asks for one of these looks. Where it leaves an axis free, don't spend that freedom on one of these defaults. Just like a human designer who's hired, there's often a careful balance between doing what you're good at and taking each project as a chance to experiment and learn.
 
Work in two passes. First, brainstorm a short design plan based on the human's design brief: create a compact token system with color, type, layout, and signature. Color: describe the palette as 4–6 named hex values. Type: the typefaces for 2+ roles (a characterful display face that's used with restraint, a complementary body face, and a utility face for captions or data if needed). Layout: a layout concept, using one-sentence prose descriptions and ASCII wireframes to ideate and compare. Signature: the single unique element this page will be remembered by that embodies the brief in an appropriate way.
 
Then review that plan against the brief before building: if any part of it reads like the generic default you would produce for any similar page (work through a similar prompt to see if you arrive somewhere similar) rather than a choice made for this specific brief — revise that part, say what you changed and why. Only after you've confirmed the relative uniqueness of your design plan should you start to write the code, following the revised plan exactly and deriving every color and type decision from it.
 
When writing the code, be careful of structuring your CSS selector specificities. It's easy to generate CSS classes that cancel each other out (especially with a type-based selector like .section and a element-based selector like .cta). This can happen often with paddings/margins between sections.
 
Try to do a lot of this planning and iteration in your thinking, and only show ideas to the user when you have higher confidence it'll delight them.
 
## Restraint and self-critique
 
Spend your boldness in one place. Let the signature element be the one memorable thing, keep everything around it quiet and disciplined, and cut any decoration that does not serve the brief. Not taking a risk can be a risk itself! Build to a quality floor without announcing it: responsive down to mobile, visible keyboard focus, reduced motion respected. Critique your own work as you build, taking screenshots if your environment supports it – a picture is worth 1000 tokens. Consider Chanel's advice: before leaving the house, take a look in the mirror and remove one accessory. Human creators have memory and always try to do something new, so if you have a space to quickly jot down notes about what you've tried, it can help you in future passes.
 
## More on writing in design
 
Words appear in a design for one reason: to make it easier to understand, and therefore easier to use. They are design material, not decoration. Bring the same intentionality to copy that you would bring to spacing and color. Before writing anything, ask what the design needs to say, and how it can best be said to help the person navigate the experience.
 
Write from the end user's side of the screen. Name things by what people control and recognize, never by how the system is built. A person manages notifications, not webhook config. Describe what something does in plain terms rather than selling it. Being specific is always better than being clever.
 
Use active voice as default. A control should say exactly what happens when it's used: "Save changes," not "Submit." An action keeps the same name through the whole flow, so the button that says "Publish" produces a toast that says "Published." The vocabulary of an interface is the signposting for someone navigating the product. Cohesion and consistency are how people learn their way around.
 
Treat failure and emptiness as moments for direction, not mood. Explain what went wrong and how to fix it, in the interface's voice rather than a person's. Errors don't apologize, and they are never vague about what happened. An empty screen is an invitation to act.
 
Keep the register conversational and tuned: plain verbs, sentence case, no filler, with tone matched to the brand and the audience. Let each element do exactly one job. A label labels, an example demonstrates, and nothing quietly does double duty.
 