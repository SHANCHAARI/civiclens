# CivicLens

> **See a problem. Prove it. Fix it.**

CivicLens is a production-quality civic issue intelligence platform that combines AI, geospatial intelligence, computer vision, analytics, and citizen participation to identify, prioritize, track, and verify public infrastructure problems.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up database
npx prisma db push

# Seed demo data
npx tsx prisma/seed.ts

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔑 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Citizen | citizen@demo.com | demo123 |
| Authority | authority@demo.com | demo123 |
| Admin | admin@demo.com | demo123 |

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS + custom design tokens |
| Database | Prisma ORM + SQLite |
| Auth | NextAuth.js (credentials provider) |
| Maps | React-Leaflet + OpenStreetMap |
| Animations | Framer Motion |
| Charts | Recharts |
| AI | Provider abstraction (mock default) |
| Icons | Lucide React |

## ✨ Features

### Citizen Experience
- 📸 **Photo upload** with AI-powered analysis
- 🤖 **AI classification** — category, severity, description
- 📍 **Location detection** — GPS, manual entry, or search
- 🔍 **Duplicate detection** — proximity + category matching
- 📊 **Priority scoring** — transparent multi-factor algorithm
- ✅ **Citizen verification** — confirm or reopen resolutions
- 🏆 **Achievements** — gamified civic participation

### Authority Dashboard
- 📋 **Priority queue** — sorted by urgency
- 🗺️ **Geographic intelligence** — map-based issue density
- 📈 **Department performance** — resolution rates
- 📉 **Trend analysis** — 7/30/90 day patterns
- 🔄 **Status lifecycle** — enforced state machine

### Analytics & Intelligence
- 🗺️ **Interactive civic map** with 120+ seeded issues
- 🔥 **Hotspot detection** — areas with concentrated issues
- 📊 **Category distribution** — what types of issues dominate
- 📈 **Trend visualization** — reported vs resolved over time

### Admin Panel
- 👥 **User management** — roles and permissions
- 🏢 **Department management** — routing configuration
- 🏷️ **Category management** — expandable issue taxonomy
- 📋 **System info** — environment and configuration

## 🎨 Design System

- **Dark/Light themes** with smooth transitions
- **Glassmorphism** — layered translucency, backdrop blur
- **Atmospheric backgrounds** — subtle radial gradients
- **Custom status colors** — severity and status badges
- **Responsive** — mobile-first citizen flow, desktop authority dashboard
- **Accessible** — keyboard navigation, focus states, ARIA labels
- **Reduced motion** — respects `prefers-reduced-motion`

## 📊 Issue Lifecycle

```
REPORTED → AI_ANALYZING → VERIFIED → ASSIGNED → ACKNOWLEDGED
→ IN_PROGRESS → RESOLVED → CITIZEN_VERIFICATION → CLOSED

Alternative paths:
- CITIZEN_VERIFICATION → REOPENED → ASSIGNED
- Any → REJECTED
- DUPLICATE_REVIEW → MERGED
```

## 🗂 Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── (auth)/       # Login
│   ├── (main)/       # Dashboard, Report, Map, Analytics, Authority
│   ├── admin/        # Admin panel
│   └── api/          # REST API routes
├── components/       # Reusable UI components
│   ├── ui/           # Design system (Button, Card, Badge, etc.)
│   ├── map/          # Map components
│   └── layout/       # Sidebar, Header, AppLayout
├── lib/              # Business logic
│   ├── ai/           # AI provider abstraction
│   ├── db.ts         # Prisma client
│   ├── auth.ts       # NextAuth config
│   ├── priority.ts   # Priority scoring engine
│   ├── duplicate.ts  # Duplicate detection
│   ├── geo.ts        # Geospatial utilities
│   └── utils.ts      # General utilities
└── types/            # TypeScript types
```

## 🧪 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/issues | Create new issue |
| GET | /api/issues | List issues (filterable) |
| GET | /api/issues/:id | Get issue details |
| PATCH | /api/issues/:id | Update issue |
| POST | /api/issues/:id/analyze | Run AI analysis |
| POST | /api/issues/:id/status | Change status (state machine) |
| POST | /api/issues/:id/support | Add supporting report |
| POST | /api/issues/:id/verify | Citizen verification |
| GET | /api/analytics?type=overview | Dashboard stats |
| GET | /api/analytics?type=trends | Trend data |
| GET | /api/analytics?type=categories | Category distribution |
| GET | /api/analytics?type=hotspots | Issue hotspots |

## 🔧 Environment Variables

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
AI_PROVIDER="mock"
DEMO_MODE="true"
```

## 📄 License

MIT
