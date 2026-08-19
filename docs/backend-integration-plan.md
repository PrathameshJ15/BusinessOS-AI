# BusinessOS AI — Backend Integration Plan & Repository Audit

This document outlines the architecture, entity mappings, API contracts, multi-tenancy controls, and step-by-step backend implementation roadmap for **BusinessOS AI**.

---

## 1. Existing Frontend & Workspace Architecture

### Monorepo Structure
```
BusinessOS-AI/
├── apps/
│   ├── web/               # Next.js 14 (App Router) Frontend
│   └── api/               # NestJS REST API Server
├── packages/
│   ├── ui/                # Shared React UI Components & Design System
│   ├── database/          # Prisma ORM Schema & Mock Data Repositories
│   ├── auth/              # Auth Types, Session Management & RBAC Helpers
│   ├── ai/                # AI Abstraction Layer (OpenAI, Anthropic, Gemini, Groq)
│   ├── shared/            # Shared TypeScript Interfaces & DTO Types
│   └── config/            # Shared Tailwind & TypeScript Configs
└── docs/                  # Architectural Documentation & Integration Plans
```

### Frontend State Management & API Layer
- **State Provider**: `AppContext.tsx` (`AppProvider`) manages transient domain state, active session, theme persistence (`dark` class toggle), and client-side notifications.
- **Current Data Source**: Mock data imported from `@businessos/database` (`mockCustomers`, `mockBookings`, `mockLeads`, `mockCampaigns`, `mockReviews`, `mockWebsite`, `mockInvoices`).
- **UI Styling**: Tailwind CSS with Emerald (`#059669` / `#10B981`) & Zinc (`#09090b` / `#18181b`) visual theme, Framer Motion for animations, Lucide React icons.

---

## 2. Identified Frontend Features & Required API Mappings

| UI Module / Screen | Existing Frontend Route | UI Components & Forms | Required Backend API Endpoints |
| :--- | :--- | :--- | :--- |
| **Authentication & Me** | `/` & Header | Session switch, User Avatar | `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me` |
| **Business Command Center** | `/dashboard` | Metrics grid, Quick Actions, Activity feed, Tasks | `GET /api/dashboard/overview`, `GET /api/tasks`, `PATCH /api/tasks/:id` |
| **Customer CRM & Pipeline** | `/dashboard/customers` | Client table, Search, LTV sorting, 360° Drawer, Add Client modal | `GET /api/customers`, `POST /api/customers`, `PATCH /api/customers/:id`, `GET /api/leads`, `PATCH /api/leads/:id` |
| **Smart Bookings** | `/dashboard/bookings` | Appointment table, Staff roster, Service catalog, Booking modal | `GET /api/bookings`, `POST /api/bookings`, `GET /api/services`, `GET /api/staff` |
| **Marketing Broadcasts** | `/dashboard/marketing` | Campaign list, Broadcast modal, AI Social Post generator, Reviews | `GET /api/campaigns`, `POST /api/campaigns`, `GET /api/reviews`, `POST /api/reviews/:id/reply` |
| **AI Web Builder** | `/dashboard/website` | Visual canvas editor, AI Wizard modal, Lead form capture, Publishing | `GET /api/websites`, `PATCH /api/websites/:id`, `POST /api/websites/:id/publish`, `POST /api/public/websites/:slug/forms` |
| **Saarthi AI Co-Pilot** | `/dashboard/ai` | Multi-model switcher, Interactive chat feed, Tool execution cards | `GET /api/ai/conversations`, `POST /api/ai/messages`, `POST /api/ai/actions/confirm` |
| **Settings & Security** | `/dashboard/settings` | Business Profile form, RBAC permissions matrix, Integrations, Billing | `GET /api/settings/profile`, `PATCH /api/settings/profile`, `GET /api/billing/invoices` |

---

## 3. Database Entities (PostgreSQL via Neon & Prisma ORM)

The PostgreSQL database schema is defined in `packages/database/prisma/schema.prisma` and covers multi-tenant isolation across all models:

1. **Core & Access Control**:
   - `User`: `id`, `email`, `name`, `passwordHash`, `avatarUrl`, `phone`, `createdAt`, `updatedAt`
   - `Organization`: `id`, `name`, `slug`, `logoUrl`, `plan`, `status`, `currency`, `timezone`, `createdAt`, `updatedAt`
   - `Membership`: `id`, `organizationId`, `userId`, `role` (`OWNER` \| `MANAGER` \| `STAFF`), `permissions`, `createdAt`
   - `BusinessProfile`: `id`, `organizationId`, `businessType`, `tagline`, `description`, `phone`, `email`, `address`, `city`, `state`, `zipCode`

2. **Customer & Pipeline Management**:
   - `Customer`: `id`, `organizationId`, `name`, `email`, `phone`, `tags`, `status`, `lifetimeValue`, `totalBookings`, `lastActivityAt`, `createdAt`
   - `Lead`: `id`, `organizationId`, `name`, `email`, `phone`, `source`, `stage` (`NEW` \| `QUALIFIED` \| `CONTACTED` \| `WON` \| `LOST`), `estimatedValue`, `createdAt`
   - `CustomerActivity`: `id`, `organizationId`, `customerId`, `type`, `description`, `metadata`, `createdAt`
   - `Note`: `id`, `organizationId`, `customerId`, `authorId`, `content`, `createdAt`

3. **Bookings & Catalog**:
   - `Service`: `id`, `organizationId`, `name`, `description`, `category`, `durationMinutes`, `price`, `isActive`
   - `Staff`: `id`, `organizationId`, `name`, `role`, `email`, `phone`, `isAvailable`
   - `Booking`: `id`, `organizationId`, `customerId`, `customerName`, `customerPhone`, `serviceId`, `serviceName`, `staffId`, `staffName`, `startTime`, `endTime`, `status`, `paymentStatus`, `totalAmount`, `notes`

4. **Marketing & Web Funnels**:
   - `Campaign`: `id`, `organizationId`, `name`, `channel`, `status`, `subject`, `content`, `targetAudience`, `totalRecipients`, `deliveredCount`, `openedCount`, `clickedCount`
   - `Review`: `id`, `organizationId`, `authorName`, `authorAvatar`, `rating`, `platform`, `content`, `sentiment`, `aiSuggestedResponse`, `responseText`
   - `Website`: `id`, `organizationId`, `domainName`, `subdomain`, `isPublished`, `themeColor`, `fontFamily`
   - `Invoice`: `id`, `organizationId`, `invoiceNumber`, `customerName`, `customerEmail`, `amount`, `tax`, `total`, `currency`, `status`, `dueDate`, `razorpayOrderId`

5. **AI Execution & Audit**:
   - `AIConversation`: `id`, `organizationId`, `userId`, `title`, `createdAt`
   - `AIMessage`: `id`, `conversationId`, `role`, `content`, `metadata`, `createdAt`
   - `AIAction`: `id`, `organizationId`, `userId`, `conversationId`, `actionType`, `status`, `input`, `result`, `createdAt`, `completedAt`
   - `AuditLog`: `id`, `organizationId`, `userId`, `action`, `entity`, `entityId`, `metadata`, `createdAt`

---

## 4. Multi-Tenant Isolation & Security Strategy

### 1. Request Tenant Context Extraction
- Authentication middleware / NestJS `AuthGuard` extracts JWT bearer token.
- Token resolves `userId` and active `organizationId` from `Membership`.
- Every service layer call explicitly passes `organizationId`.

### 2. Tenant Isolation Enforcement
- **Rule**: No SQL or Prisma query shall be executed without `where: { organizationId }`.
- **Validation**: Frontend parameters specifying `organizationId` are ignored; `organizationId` is derived exclusively from the verified server-side session.

### 3. Granular RBAC Permissions
- **OWNER**: Unrestricted access to all modules, billing, settings, and staff delegation.
- **MANAGER**: Read/Write access to CRM, Bookings, Marketing, and AI commands; restricted settings edits.
- **STAFF**: Access restricted to assigned bookings, customer lookups, and basic notes.
- **Guard Decorator**: `@RequirePermission('customers:write')` enforced at the controller route handler.

---

## 5. Third-Party Integrations & Adapter Architecture

1. **AI Provider Abstraction Layer (`@businessos/ai`)**:
   - Provider Interface: `IAIService`
   - Supported Providers: **OpenAI**, **Anthropic**, **Google Gemini**, **Groq**
   - Tool Execution Safety: Read actions run automatically; sensitive write actions (e.g. mass campaign send, website publish) trigger structured confirmation cards.

2. **Payment Gateway Abstraction**:
   - Provider: **Razorpay**
   - Initial Mode: Sandbox / Mock integration for order creation (`order_rzp_sim_*`) and automated invoice generation.

---

## 6. Implementation Roadmap

1. **Phase 8A — Database & NestJS Infrastructure**:
   - Set up Prisma Client, Neon PostgreSQL connection strings, and database migrations.
   - Configure NestJS modules in `apps/api/src/` (`auth`, `users`, `organizations`, `customers`, `bookings`, `marketing`, `websites`, `ai`, `billing`).

2. **Phase 8B — API Client Layer in Web App**:
   - Create `apps/web/src/lib/api/` containing typed HTTP fetch clients (`client.ts`, `customers.ts`, `bookings.ts`, `marketing.ts`, `ai.ts`, etc.).
   - Connect `AppContext.tsx` to populate state from NestJS REST API endpoints instead of static mock files.

3. **Phase 8C — End-to-End Verification & Audit Log Report**:
   - Run multi-tenant isolation unit tests and integration tests.
   - Generate `docs/backend-implementation-report.md`.
