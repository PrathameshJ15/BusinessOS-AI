# BusinessOS AI (Saarthi AI — सारथी AI)

<div align="center">

![BusinessOS AI Banner](https://raw.githubusercontent.com/PrathameshJ15/BusinessOS-AI/main/SARTHI%20AI%20LOGO.png)

**The AI-First Business Operating System for Modern Enterprises & SMBs**  
*Ask. Saarthi does the work.*

[![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.2-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.9.0-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Three.js / R3F](https://img.shields.io/badge/Three.js-R3F_9.12-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://docs.pmnd.rs/react-three-fiber)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[Live Demo](#quick-start) • [Architecture](#-system-architecture) • [Modules](#-core-platform-modules) • [API Docs](#-rest-api--swagger-documentation) • [Setup Guide](#-getting-started)

</div>

---

## 📖 Overview

**BusinessOS AI** (featuring **Saarthi AI** / **सारथी AI** — *The trusted guide/companion driving your business forward*) is a unified, multi-tenant business operating system. Designed to replace fragmented toolchains (CRM, appointment schedulers, email/SMS marketing, website builders, review managers, and conversational AI assistants), BusinessOS consolidates all operational verticals into a single cohesive workspace.

Powered by an intelligent natural-language command router, BusinessOS lets operators type plain-English requests (e.g., *"Schedule follow-up emails for churn-risk customers"* or *"Publish a new weekend discount promo to my website"*) and automatically translates intent into validated, permission-controlled, auditable platform actions.

---

## ⚡ Core Platform Modules

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       BUSINESSOS AI                                         │
├───────────────────┬───────────────────┬────────────────────┬──────────────────┬─────────────┤
│   Saarthi Co-Pilot│   CRM & Leads     │ Bookings & Calendar│ Marketing Engine │ AI Builder  │
│   • Intent Parser │   • Customer CRM  │ • Slot Conflicts   │ • Multi-Channel  │ • Block CMS │
│   • Multi-Provider│   • LTV Analytics │ • Staff Rosters    │ • Auto Reviews   │ • 1-Click   │
│   • Action Guards │   • Deal Pipeline │ • Service Catalogs │ • Broadcasts     │   Publishing│
└───────────────────┴───────────────────┴────────────────────┴──────────────────┴─────────────┘
```

### 1. 🤖 Saarthi AI Co-Pilot (`सारथी AI`)
- **Natural Language Action Execution**: Translates conversational prompts into database mutations and marketing dispatches.
- **Multi-Provider AI Abstraction Layer**: Pluggable provider architecture supporting **OpenAI**, **Anthropic Claude**, **Google Gemini**, **Groq**, and an offline **Mock Provider**.
- **Audit-Logged Tool Engine**: Read actions execute instantly; sensitive write actions (e.g. mass campaign dispatch) generate interactive confirmation cards before execution.
- **Context-Aware Recommendations**: Generates contextual next-step prompts based on business metrics.

### 2. 👥 Customer Relationship Management (CRM) & Pipeline
- **Unified Client Directory**: Manage customer contact records, lifetime value (LTV), activity history, tags, and internal notes.
- **Sales & Lead Funnel**: Visual stage-based lead tracking (New, Contacted, Qualified, Closed).
- **Activity Stream**: Real-time logging of customer interactions (bookings, reviews, inbound inquiries).

### 3. 📅 Smart Booking & Appointment Scheduler
- **Conflict-Free Scheduling**: Automated slot collision detection prevents double-booking across staff members.
- **Service Catalog**: Configurable duration, pricing, and assigned staff members.
- **Appointment Lifecycle**: Track statuses across `Pending`, `Confirmed`, `Completed`, and `Cancelled`.

### 4. 📣 Marketing Automation & Reputation Management
- **Multi-Channel Broadcasts**: Trigger campaigns via Email, SMS, and WhatsApp.
- **Audience Segmentation**: Target campaigns based on spending thresholds, inactivity windows, or customer tags.
- **Google & Yelp Review Management**: Monitor customer sentiment and generate AI-assisted replies with a single click.

### 5. 🌐 AI Website Builder & Visual CMS
- **Modular Block Editor**: Customize Hero, Services, Testimonials, and Contact sections in real-time.
- **1-Click Publishing**: Instantly toggle between draft and live production states with live domain preview.
- **Responsive & Accessible**: Mobile-first design system with full theme customization.

### 6. 🛡️ Multi-Tenant Isolation & Role-Based Access Control (RBAC)
- **Zero-Leakage Multi-Tenancy**: All database queries strictly scope to `organization_id` derived directly from verified JWT/session claims. Frontend-injected tenant IDs are rejected.
- **Granular Permissions Matrix**:
  - `OWNER`: Full administrative access, tenant settings, API keys, billing, and all read/write scopes.
  - `MANAGER`: Operational access (CRM, bookings, campaigns, website editing, AI execution).
  - `STAFF`: Scoped operational access (assigned bookings, customer lookup, task management).

### 7. 💳 Billing & Razorpay Integration
- **Subscription Management**: Supports Free, Pro, and Enterprise subscription tiers.
- **Simulation Sandbox**: Full offline development mode simulating order creation, payment signatures, invoices, and webhooks.

### 8. 🎨 3D Landing Experience
- Built with **React Three Fiber (R3F)** and **Three.js**, featuring an interactive central intelligence core, orbiting business module nodes, floating metric cards, and camera parallax effects.

---

## 🏛 System Architecture

```
                                  +---------------------------------------+
                                  |        Web App (Next.js 14+)          |
                                  |   - Dashboard     - Customers         |
                                  |   - Website       - Marketing         |
                                  |   - Bookings      - AI Workspace      |
                                  |   - Settings      - 3D Landing Page   |
                                  +-------------------+-------------------+
                                                      |
                                                      v  HTTP / REST (JWT Bearer)
                                  +---------------------------------------+
                                  |         NestJS Backend API            |
                                  |   - Auth & Tenant Context Guard       |
                                  |   - Customer Service                  |
                                  |   - Website Engine                    |
                                  |   - Marketing & Campaign Engine       |
                                  |   - Booking Scheduler                 |
                                  |   - AI Tool Execution Router          |
                                  |   - Billing & Razorpay Integration    |
                                  +-------------------+-------------------+
                                                      |
                  +-----------------------------------+-----------------------------------+
                  |                                   |                                   |
                  v                                   v                                   v
   +-----------------------------+     +-----------------------------+     +-----------------------------+
   |  Unified AI Abstraction     |     | Multi-tenant Database Layer |     | Payment Adapter (Razorpay)  |
   | - OpenAI, Claude, Gemini    |     | - Tenant Isolation (Org ID) |     | - Mock/Sim Sandbox          |
   | - Groq, Mock Engine         |     | - Prisma ORM / PostgreSQL   |     | - Signature Verification    |
   | - Tool / Action Engine      |     | - In-Memory Seed Fallback   |     | - Webhook Dispatcher        |
   +-----------------------------+     +-----------------------------+     +-----------------------------+
```

---

## 📁 Repository Structure

The monorepo uses **NPM Workspaces** to coordinate apps and shared packages:

```
BusinessOS-AI/
├── apps/
│   ├── web/                     # Next.js 14 Frontend (App Router, Tailwind CSS, R3F)
│   │   ├── src/
│   │   │   ├── app/             # Application routes (/, /dashboard, /onboarding, /api)
│   │   │   ├── components/      # UI components (dashboard, landing, 3D scenes)
│   │   │   └── lib/             # API client, data layer, auth utilities
│   │   └── package.json
│   │
│   └── api/                     # NestJS 11 Production Backend API
│       ├── src/
│       │   ├── ai/              # AI message router and Saarthi tool controller
│       │   ├── auth/            # Session validation and login endpoints
│       │   ├── bookings/        # Scheduling engine and slot conflict detector
│       │   ├── common/          # @CurrentUser, @RequirePermission decorators & guards
│       │   ├── customers/       # CRM contacts and lead management
│       │   ├── dashboard/       # Aggregated KPIs and pulse metrics
│       │   ├── marketing/       # Broadcast campaigns and review responders
│       │   ├── tasks/           # Team operational task tracking
│       │   ├── websites/        # Visual website block CMS and publishing
│       │   └── main.ts          # NestJS bootstrap and Swagger OpenAPI setup
│       └── package.json
│
├── packages/
│   ├── ai/                      # AI provider abstraction (OpenAI, Claude, Gemini, Groq)
│   ├── auth/                    # RBAC permissions engine, token validators, audit logger
│   ├── config/                  # Shared TypeScript, ESLint, and Tailwind configurations
│   ├── database/                # Prisma ORM schema, PostgreSQL migrations, repository & mock seed
│   ├── shared/                  # Domain DTOs, TypeScript interfaces, constants & permission types
│   └── ui/                      # Reusable UI component library (design tokens, glass cards, buttons)
│
├── docs/                        # Architecture specs, ADR decision logs, and implementation reports
├── .env.example                 # Master environment variable template
├── package.json                 # Monorepo root configuration & orchestrator scripts
└── README.md                    # Project documentation
```

---

## 🛠 Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | [Next.js 14](https://nextjs.org/) (App Router), [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/), [Lucide React](https://lucide.dev/), [Recharts](https://recharts.org/) |
| **3D Graphics** | [React Three Fiber](https://docs.pmnd.rs/react-three-fiber), [Three.js](https://threejs.org/), [@react-three/drei](https://github.com/pmndrs/drei) |
| **Backend** | [NestJS 11](https://nestjs.com/), [Express](https://expressjs.com/), [Swagger / OpenAPI](https://swagger.io/), `class-validator`, `class-transformer` |
| **Database & ORM** | [PostgreSQL (Neon Serverless)](https://neon.tech/), [Prisma ORM 6.9](https://www.prisma.io/), In-Memory Repository Fallback |
| **AI Integration** | OpenAI (GPT-4o), Anthropic Claude 3.5, Google Gemini, Groq, In-Memory Safe Mock Provider |
| **Payments** | [Razorpay](https://razorpay.com/) (Live API & Simulated Local Sandbox) |
| **Monorepo** | NPM Workspaces, TypeScript Project References |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18.18.0` or higher (`v20+` recommended)
- **NPM**: `v9.0.0` or higher
- **PostgreSQL Database** *(optional)*: A Neon serverless Postgres instance or local PostgreSQL (the app includes a robust in-memory mock repository if no database is connected).

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/PrathameshJ15/BusinessOS-AI.git
   cd BusinessOS-AI
   ```

2. **Install all monorepo dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   ```bash
   cp .env.example .env
   ```
   *(Review and modify `.env` as needed; the defaults work out of the box with simulated/mock providers).*

4. **Initialize Database Client:**
   ```bash
   npm run db:generate --workspace=packages/database
   ```
   *(Optional if connecting to a real PostgreSQL database: run `npm run db:push --workspace=packages/database`)*

---

## 🏃 Running the Application

### Development Mode

Run the frontend and backend services:

```bash
# Terminal 1: Start Next.js Frontend (port 3000)
npm run dev

# Terminal 2: Start NestJS Backend API (port 4000)
npm run dev:api
```

Once running:
- 🌐 **Web Application & 3D Landing Page**: [http://localhost:3000](http://localhost:3000)
- 📊 **BusinessOS Dashboard**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- 🚀 **NestJS Backend REST API**: [http://localhost:4000/api](http://localhost:4000/api)
- 📄 **Interactive Swagger OpenAPI Docs**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

### Building for Production

Compile all workspaces:
```bash
npm run build
```

Perform static type checking across the entire monorepo:
```bash
npm run typecheck
```

---

## ⚙️ Environment Variables Reference

A `.env.example` template is provided in the repository root:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Application environment mode | `development` |
| `PORT` | Frontend application port | `3000` |
| `DATABASE_URL` | PostgreSQL / Neon pooled database connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `JWT_SECRET` | Secret key used for signing & verifying bearer auth tokens | `super-secret-businessos-jwt-key...` |
| `NEXTAUTH_SECRET` | Secret used for NextAuth session encryption | `super-secret-nextauth-session-key...` |
| `NEXTAUTH_URL` | Base canonical URL for NextAuth | `http://localhost:3000` |
| `AI_PROVIDER` | Active AI provider (`openai`, `anthropic`, `gemini`, `groq`, `mock`) | `openai` |
| `OPENAI_API_KEY` | OpenAI API Secret Key | `sk-proj-...` |
| `ANTHROPIC_API_KEY` | Anthropic Claude API Key | `sk-ant-...` |
| `GEMINI_API_KEY` | Google Gemini API Key | `AIzaSy...` |
| `GROQ_API_KEY` | Groq High-Speed Inference API Key | `gsk_...` |
| `RAZORPAY_MODE` | Payment processing mode (`SIMULATION` or `LIVE`) | `SIMULATION` |
| `RAZORPAY_KEY_ID` | Razorpay Key ID | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret | `rzp_test_...` |
| `NEXT_PUBLIC_API_URL` | URL of the NestJS backend accessed by the client | `http://localhost:4000/api` |

---

## 📡 REST API & Swagger Documentation

When the backend API is running (`npm run dev:api`), full interactive API documentation is available at:
👉 **`http://localhost:4000/api/docs`**

### Key Endpoints

| Endpoint | Method | Role Permission | Description |
| :--- | :---: | :---: | :--- |
| `/api/auth/me` | `GET` | Authenticated | Fetch active user identity, tenant profile, and assigned permissions |
| `/api/dashboard/overview` | `GET` | `org:read` | Executive dashboard stats, revenue metrics, and pulse data |
| `/api/customers` | `GET` | `customers:read` | Retrieve organization customer records |
| `/api/customers` | `POST` | `customers:write` | Register new customer contact profile |
| `/api/customers/leads` | `GET` | `customers:read` | Retrieve sales pipeline leads and stages |
| `/api/bookings` | `GET` | `bookings:read` | Fetch appointment calendar |
| `/api/bookings` | `POST` | `bookings:write` | Schedule appointment with automatic slot conflict check |
| `/api/marketing/campaigns` | `GET` | `marketing:read` | List broadcast campaigns |
| `/api/marketing/campaigns` | `POST` | `marketing:write` | Dispatch campaign via Email, SMS, or WhatsApp |
| `/api/marketing/reviews/:id/reply` | `POST` | `marketing:write` | Submit response to Google/Yelp review |
| `/api/websites` | `GET` | `website:read` | Retrieve visual block layout |
| `/api/websites/blocks/:id` | `PATCH` | `website:write` | Update block content and styling |
| `/api/websites/publish` | `POST` | `website:write` | Toggle live publishing of website |
| `/api/ai/messages` | `POST` | `ai:execute` | Submit conversational command to Saarthi AI engine |
| `/api/tasks` | `GET` | `org:read` | Fetch operational task list |

---

## 🔒 Security & Multi-Tenant Guard

BusinessOS AI enforces multi-tenancy at every level:
1. **Server-Side Tenant Derivation**: Every authenticated request resolves the user's `organizationId` from validated session tokens.
2. **Untrusted Payload Stripping**: Frontend payloads cannot manually specify or override `organizationId`, preventing Insecure Direct Object References (IDOR).
3. **Role & Permission Enforcers**: All endpoints are protected via `@RequirePermission()` and `@UseGuards(AuthGuard, PermissionsGuard)`.
4. **Action Confirmation**: Dangerous AI actions (e.g. mass marketing broadcasts) are placed in a `PENDING_APPROVAL` status until explicitly confirmed by an authorized user.

---

## 🧪 Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| **Run Web** | `npm run dev` | Starts Next.js frontend in development mode |
| **Run API** | `npm run dev:api` | Starts NestJS API in development mode |
| **Build All** | `npm run build` | Compiles all packages and applications |
| **Type Check** | `npm run typecheck` | Validates TypeScript types across all workspaces |
| **Lint** | `npm run lint` | Runs ESLint across all projects |
| **Prisma Generate** | `npm run db:generate -w packages/database` | Generates the Prisma client library |
| **Prisma Push** | `npm run db:push -w packages/database` | Pushes the Prisma schema to PostgreSQL |
| **Prisma Studio** | `npm run db:studio -w packages/database` | Opens Prisma Studio web visualizer |

---

## 👥 Authors & Acknowledgments

- **Project Lead**: [Prathamesh Jadhav](https://github.com/PrathameshJ15)
- **Built for**: Modern businesses and enterprises seeking an AI-first operational backbone.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
