# 🏠 REAPA — AI Personal Assistant for Real Estate Agents

<div align="center">

**Your AI partner that works 24/7 — finds clients, manages follow-ups, handles compliance — while you close deals.**

[![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

[🚀 Live Demo](https://reapa-mvp.vercel.app) · [Product Concept](docs/product-concept.md) · [Market Research](docs/market-research.md) · [Contributing](#contributing)

</div>

---

## 🎯 The Problem

Real estate agents spend **60–70% of their time on routine tasks** instead of closing deals. They juggle fragmented tools (WhatsApp, Excel, email, portals), miss follow-ups, and risk compliance violations — especially in regulated markets like Malta (AML/KYC, Housing Authority rules, EPC requirements).

**No existing tool** combines AI lead scoring, CRM, compliance automation, and multilingual support at an affordable price point for individual agents.

## 💡 The Solution

REAPA is an **all-in-one AI assistant** that handles the entire agent workflow:

| Module | What it does |
|--------|-------------|
| **🔍 Lead Engine** | AI scoring (Hot/Warm/Cold), multi-channel inbox, auto-responses |
| **🤝 Client Manager** | Smart CRM with sentiment tracking, ghost client detection, journey visualization |
| **📋 Task Autopilot** | AI-generated tasks, compliance deadlines, smart scheduling |
| **📊 Analytics** | Revenue forecasting, agent scorecard, burnout monitoring |
| **🏗 Listing Manager** | One-click multi-portal publish, AI descriptions, photo enhancement |
| **⚖️ Legal & Compliance** | AML/KYC automation, contract templates, regulation alerts |
| **🧠 Market Intelligence** | Price comparator, demand heatmaps, rental yield calculator |
| **🎨 Content Studio** | Social media generator, market reports, email campaigns |

## 🏗 Architecture

```
┌─────────────────────────────────────────────────┐
│                  Frontend (Next.js)               │
│  Dashboard │ Leads │ Clients │ Tasks │ Analytics  │
├─────────────────────────────────────────────────┤
│              API Layer (Supabase Edge)            │
├──────────┬──────────┬──────────┬────────────────┤
│   Auth   │ Realtime │   DB     │   Storage      │
│ (Supabase)│  (WS)   │(Postgres)│   (S3)        │
├──────────┴──────────┴──────────┴────────────────┤
│              AI Services Layer                    │
│  Claude API │ Lead Scoring │ NLP │ Predictions   │
├─────────────────────────────────────────────────┤
│              Integrations                         │
│ WhatsApp │ Portals │ AML/KYC │ Maps │ Email     │
└─────────────────────────────────────────────────┘
```

## 🖥 Screenshots

### Dashboard — AI Daily Briefing
> Morning briefing with KPIs, prioritized tasks, pipeline overview, and market alerts.

### Lead Engine — AI Scoring
> Automatic lead scoring from WhatsApp, email, portals, Instagram, Facebook, and referrals. Auto-reply bot handles initial responses.

### Client Manager — Smart CRM
> Funnel visualization with sentiment tracking. Ghost client alerts for inactive leads. Full client journey from New → Qualified → Viewing → Offer → Closed.

### Task Autopilot
> AI-generated tasks with priority scoring. Compliance deadlines (AML checks, Housing Authority registrations) are automatically tracked.

### Analytics Dashboard
> Revenue trends, AI forecasting (best/expected/conservative), agent performance scorecard, and burnout monitoring.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/ArturHmet/reapa-mvp.git
cd reapa-mvp

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## 🗺 Roadmap

### Phase 1: MVP (Current) ✅
- [x] Dashboard with AI Daily Briefing
- [x] Lead Engine with AI scoring
- [x] Client Manager with CRM funnel
- [x] Task Autopilot with compliance tracking
- [x] Analytics with revenue forecasting
- [ ] Supabase backend integration
- [ ] Authentication system
- [ ] Live demo deployment

### Phase 2: Core Features (Q2–Q3 2026)
- [ ] WhatsApp Business API integration
- [ ] Multi-portal listing sync (Malta portals)
- [ ] AML/KYC automation
- [ ] AI auto-response engine
- [ ] Mobile app (React Native)

### Phase 3: Intelligence (Q3–Q4 2026)
- [ ] Market Intelligence dashboard
- [ ] Predictive analytics (deal probability)
- [ ] Content Studio (social media AI)
- [ ] Advanced compliance engine

### Phase 4: Scale (2027)
- [ ] Cyprus & Dubai market expansion
- [ ] White-label for agencies
- [ ] API marketplace
- [ ] Enterprise tier

## 📊 Market Opportunity

| Metric | Value |
|--------|-------|
| **Global PropTech TAM** | $124.6B |
| **Malta RE Market** | €567M (4,157 businesses) |
| **Target SAM** | €3.2M (Malta solo agents) |
| **Pricing** | €49–99/month per agent |
| **Break-even** | Month 9 (~130 agents) |
| **Year 1 ARR Target** | €379K |
| **Year 2 ARR Target** | €1.9M |

### Competitive Advantage
- 🇲🇹 **Malta-native compliance** (AML, Housing Authority, EPC, licensing)
- 🌍 **Multilingual** (EN/MT/IT) — built for expat-heavy markets
- 💰 **Affordable** (€49/mo vs competitors' $179–$500)
- 🤖 **AI-first** — not a CRM with AI bolted on
- 🏝 **Small market moat** — US/UK tools ignore Malta's regulatory complexity

## 🛠 Tech Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS
- **Backend:** Supabase (Auth, PostgreSQL, Realtime, Storage)
- **AI:** Claude API + domain-specific fine-tuning
- **Messaging:** Twilio WhatsApp Business API + SendGrid
- **Compliance:** ComplyAdvantage / Sumsub API
- **Maps:** Google Maps API (viewing routes)
- **Deployment:** Vercel + AWS (EU data residency)

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx           # Dashboard with AI Briefing
│   ├── leads/page.tsx     # Lead Engine
│   ├── clients/page.tsx   # Client Manager CRM
│   ├── tasks/page.tsx     # Task Autopilot
│   └── analytics/page.tsx # Analytics Dashboard
├── components/
│   ├── Sidebar.tsx        # Navigation sidebar
│   └── UI.tsx             # Reusable UI components
└── lib/
    ├── data.ts            # Mock data (Malta-specific)
    └── utils.ts           # Utility functions
```

## 🤝 Contributing

We're looking for contributors, especially those with:
- Real estate industry experience (Malta/EU markets)
- PropTech product development background
- AI/ML engineering skills
- Mobile development (React Native)

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

## 📬 Contact

- **Founder:** Artur Malokhmetov
- **LinkedIn:** [Connect](https://www.linkedin.com/in/arturhmet/)
- **Location:** Malta 🇲🇹

---

<div align="center">

**Built with ❤️ in Malta for real estate agents worldwide**

*REAPA — Because agents should close deals, not drown in admin.*

</div>
