# ⛳ Golf Charity Subscription Platform

A modern, subscription-based golf platform combining **performance tracking**, **monthly prize draws**, and **charitable giving**. Built as a full-stack web application using Next.js, Supabase, and Stripe.


## 📋 Project Overview

This platform was built from a detailed **Product Requirements Document (PRD)** by Digital Heroes. The goal was to create an emotionally engaging, modern golf platform that deliberately avoids traditional golf website aesthetics — leading with **charitable impact**, not sport.

### The Concept

Members subscribe to the platform, enter their Stableford golf scores, participate in monthly prize draws, and contribute a portion of their subscription to a charity of their choice. It's golf with a purpose.

---

## ✨ Features Built

### 👤 User Features
- **Authentication** — Sign up, sign in, email confirmation with auto-redirect to dashboard
- **Subscription Plans** — Monthly ($9.99/mo) and Yearly ($95.88/yr) via Stripe Checkout
- **Score Tracking** — Enter Stableford scores (1–45), rolling window of last 5 scores kept automatically
- **Charity Selection** — Choose from a directory of verified charities, set contribution percentage (min 10%)
- **Prize Draw Participation** — View upcoming draws, winning numbers, and prize pool breakdown
- **Winnings Dashboard** — Submit proof of scores to claim prizes, track payment status
- **Participation Summary** — View total winnings, winning entries, and next draw date

### 🔧 Admin Features
- **Overview Dashboard** — Platform-wide stats: total users, active subscribers, draws run, prizes paid, pending verifications, charity partners
- **User Management** — View all members, edit subscription status manually
- **Draw Engine** — Two modes:
  - **Random** — Standard lottery-style, all numbers equally likely
  - **Algorithmic** — Weighted by frequency of user scores
  - Simulate numbers before publishing, preview prize pool breakdown
  - Publish draws to make them visible to members
- **Charity Management** — Add, edit, delete charity partners, set featured status
- **Winner Verification** — Review proof submissions, verify winners, mark payouts as paid or reject

### 🏗️ Technical Features
- **Auto Profile Creation** — Supabase trigger creates user profile on signup automatically
- **Row Level Security** — Full RLS policies on all tables
- **Stripe Webhooks** — Auto-activates subscription after payment (production)
- **Admin Guard** — Email-based admin access control
- **Mobile Responsive** — Slide-in sidebar on mobile, fully responsive layout
- **Draw Algorithm** — Custom weighted draw engine with jackpot rollover logic

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Payments | Stripe |
| Animations | Motion (Framer Motion) |
| Icons | Lucide React |
| Notifications | Sonner |
| UI Components | Base UI + Custom |
| Deployment | Vercel |

---

## 📁 Project Structure
```
golf-charity/
├── src/
│   ├── app/
│   │   ├── page.tsx                    ← Landing page
│   │   ├── auth/page.tsx               ← Sign in / Sign up
│   │   ├── charities/page.tsx          ← Public charity directory
│   │   ├── subscribe/
│   │   │   ├── page.tsx                ← Plan selection
│   │   │   └── success/page.tsx        ← Post-payment confirmation
│   │   ├── dashboard/
│   │   │   ├── layout.tsx              ← Dashboard shell with sidebar
│   │   │   ├── page.tsx                ← Member overview
│   │   │   ├── scores/page.tsx         ← Score entry
│   │   │   ├── charity/page.tsx        ← Charity selection
│   │   │   └── draws/page.tsx          ← Draws & winnings
│   │   ├── admin/
│   │   │   ├── layout.tsx              ← Admin shell
│   │   │   ├── page.tsx                ← Admin overview
│   │   │   ├── users/page.tsx          ← User management
│   │   │   ├── draws/page.tsx          ← Draw engine
│   │   │   ├── charities/page.tsx      ← Charity management
│   │   │   └── winners/page.tsx        ← Winner verification
│   │   └── api/
│   │       ├── create-checkout-session/route.ts
│   │       └── stripe/webhook/route.ts
│   ├── components/
│   │   ├── AuthProvider.tsx            ← Global auth context
│   │   ├── dashboard/
│   │   │   ├── ScoreEntry.tsx
│   │   │   ├── CharitySelection.tsx
│   │   │   └── ParticipationSummary.tsx
│   │   └── ui/                         ← UI component library
│   ├── lib/
│   │   ├── supabase.ts                 ← Supabase client
│   │   ├── stripe.ts                   ← Stripe client + plans
│   │   ├── draw-engine.ts              ← Draw algorithm
│   │   └── utils.ts                    ← Helpers (formatCurrency, formatDate)
│   └── types/
│       └── index.ts                    ← Shared TypeScript types
├── supabase_schema.sql                 ← Full DB schema
└── .env.local                          ← Environment variables
```

---

## 🗄️ Database Schema

| Table | Description |
|-------|-------------|
| `profiles` | User profiles with subscription status, charity selection, Stripe IDs |
| `charities` | Charity directory with featured flag |
| `scores` | Golf scores (max 5 per user, rolling window) |
| `draws` | Monthly prize draws with winning numbers and prize pool |
| `winners` | Winner records with proof submission and payment status |

---

## 🎯 Draw & Prize System

### How Draws Work
1. Admin configures draw mode (Random or Algorithmic)
2. Sets prize pool amount and draw date
3. Simulates 5 winning numbers — previews before publishing
4. Publishes draw — visible to all members

### Prize Pool Distribution
| Match Type | Pool Share | Rollover |
|------------|-----------|---------|
| 5-Number Match | 40% | ✅ Jackpot rolls over |
| 4-Number Match | 35% | ❌ |
| 3-Number Match | 25% | ❌ |

### Winner Verification Flow
```
User wins → Submits proof URL → Admin reviews → 
Verified → Marked as Paid
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Stripe account

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/golf-charity.git
cd golf-charity

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Fill in your Supabase and Stripe keys

# Run the database schema
# Go to Supabase SQL Editor and paste supabase_schema.sql

# Start development server
npm run dev
```

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_YEARLY_PRICE_ID=price_...

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_EMAILS=your@email.com
```

---

## 🗺️ Route Map

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page |
| `/auth` | Public | Sign in / Sign up |
| `/charities` | Public | Charity directory |
| `/subscribe` | Public | Plan selection |
| `/subscribe/success` | Public | Post-payment page |
| `/dashboard` | Members | Overview |
| `/dashboard/scores` | Members | Score entry |
| `/dashboard/charity` | Members | Charity selection |
| `/dashboard/draws` | Members | Draws & winnings |
| `/admin` | Admin only | Overview stats |
| `/admin/users` | Admin only | User management |
| `/admin/draws` | Admin only | Draw engine |
| `/admin/charities` | Admin only | Charity management |
| `/admin/winners` | Admin only | Winner verification |

---

## 🔐 Security

- Row Level Security (RLS) enabled on all Supabase tables
- Users can only read/write their own data
- Service role key used only in server-side API routes
- Admin access controlled via `NEXT_PUBLIC_ADMIN_EMAILS` environment variable
- Stripe webhook signature verification on all webhook events

---

## 💳 Testing Payments

Use Stripe test card:
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g. 12/29)
CVC: Any 3 digits (e.g. 123)
```

---

## 📦 Deployment

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

Add all environment variables in the Vercel dashboard under **Settings → Environment Variables**.

### Stripe Webhook (Production)

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`
4. Copy the webhook secret → add to Vercel env vars as `STRIPE_WEBHOOK_SECRET`

---

## 🧪 Testing Checklist

- [x] User signup & login
- [x] Email confirmation auto-redirect
- [x] Subscription flow (monthly and yearly)
- [x] Score entry — 5-score rolling logic
- [x] Draw system — random & algorithmic simulation
- [x] Charity selection and contribution percentage
- [x] Winner verification flow and payout tracking
- [x] User dashboard — all modules functional
- [x] Admin panel — full control and usability
- [x] Responsive design on mobile and desktop

---

## 📄 PRD Compliance

This project was built from the **Digital Heroes PRD** for a Golf Charity Subscription Platform. All major requirements from the PRD have been implemented:

| PRD Requirement | Status |
|----------------|--------|
| Subscription Engine (Monthly/Yearly) | ✅ |
| Score Management (5-score rolling) | ✅ |
| Draw & Reward System | ✅ |
| Prize Pool Logic (40/35/25 split) | ✅ |
| Charity System (min 10% contribution) | ✅ |
| Winner Verification System | ✅ |
| User Dashboard (all modules) | ✅ |
| Admin Dashboard (full control) | ✅ |
| Mobile-first responsive design | ✅ |
| Secure authentication | ✅ |
| Jackpot rollover logic | ✅ |

---

## 👨‍💻 Built By

Built as a full-stack development trainee assignment for **Digital Heroes** — a premium full-stack development and digital marketing agency.

---

## 📝 License

This project is private and confidential. Built for evaluation purposes only.