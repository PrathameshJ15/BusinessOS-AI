# BusinessOS AI - Architecture Documentation

## Overview
BusinessOS AI is an AI-first business operating system designed for small and medium businesses (SMBs). It provides unified capabilities across customer management, website building & hosting, automated marketing, booking & appointments, and AI-driven workflow execution.

## System Architecture

```
                                  +---------------------------------------+
                                  |        Web App (Next.js 14+)          |
                                  |   - Dashboard     - Customers         |
                                  |   - Website       - Marketing         |
                                  |   - Bookings      - AI Workspace      |
                                  |   - Settings      - Landing Page      |
                                  +-------------------+-------------------+
                                                      |
                                                      v
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
                 +------------------------------------+------------------------------------+
                 |                                    |                                    |
                 v                                    v                                    v
  +-----------------------------+      +-----------------------------+      +-----------------------------+
  |   Unified AI Service Abstr. |      | Multi-tenant Database Layer |      | Payment Adapter (Razorpay)  |
  | - OpenAI, Claude, Gemini    |      | - Tenant Isolation (Org ID) |      | - Mock/Sim Sandbox          |
  | - Groq                      |      | - Prisma / PostgreSQL       |      | - Webhook Handler           |
  | - Tool / Action Engine      |      +-----------------------------+      +-----------------------------+
  +-----------------------------+
```

## Monorepo Structure

```
BusinessOS-AI/
├── apps/
│   ├── web/                     # Next.js 14 Frontend App Router application
│   └── api/                     # NestJS Backend API service
├── packages/
│   ├── shared/                  # Domain models, schemas, DTOs, constants, permissions
│   ├── database/                # Database schemas, migrations, repositories & mock engine
│   ├── auth/                    # Tenant context, role definitions & permission guards
│   ├── ai/                      # Abstraction layer for OpenAI, Groq, Claude, Gemini & Tool engine
│   ├── ui/                      # Reusable UI component library (Design tokens, glass, buttons, tables)
│   └── config/                  # Shared tsconfig, tailwind, eslint configs
└── docs/                        # Architecture specs and decision logs
```

## Database Multi-Tenant Domain Schema
Core entities configured with strict tenant isolation (`organization_id`):
- `User`: Global credentials, name, email, avatar
- `Organization`: Tenant account, plan (Free, Pro, Enterprise), status
- `Membership`: Connects User to Organization with Role (`OWNER`, `MANAGER`, `STAFF`)
- `Role` & `Permission`: Dynamic and role-based permissions matrix
- `BusinessProfile`: Industry, phone, address, operating hours, brand settings
- `Customer`: Contact info, tags, lifetime value, lead status, last activity
- `Lead`: Sales pipeline status, estimated value, target deal stage
- `CustomerActivity`: Timeline events (booking created, campaign sent, call logged, review submitted)
- `Note`: Internal notes on customer profiles
- `Conversation` & `AIMessage`: Omnichannel communication threads
- `Service`: Offerings, pricing, duration, staff assignments
- `Staff`: Team members, schedules, assigned services
- `Booking`: Scheduled service, status (Pending, Confirmed, Completed, Cancelled), payment status
- `Campaign`: Marketing broadcast (Email/SMS/WhatsApp), audience criteria, performance metrics
- `CampaignRecipient`: Per-recipient message status & engagement
- `Review`: Google/Yelp reviews, rating, customer sentiment, automated AI response status
- `Website` & `WebsitePage` & `WebsiteBlock`: AI website builder blocks, customizable content
- `AIConversation` & `AIAction`: Multi-step command execution history and security audit log
- `Task`: Operational tasks assigned to team members or AI
- `Notification`: In-app and notification preferences
- `Integration`: Third-party tools (Google Business, WhatsApp, Razorpay, Zapier)
- `Subscription` & `Invoice`: Billing history, recurring plan status, Razorpay payment tokens

## Design System Tokens
- Primary: `#0F172A` (Slate 900)
- Accent: `#3B82F6` (Blue 500)
- Background: `#F8FAFC` (Slate 50)
- Dark: `#020617` (Slate 950)
- Visual aesthetic: Modern Apple-inspired minimalism, subtle glass overlays, high legibility typography, fluid micro-interactions.
