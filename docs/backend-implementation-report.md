# BusinessOS AI — Backend Implementation Report

This document details the production-grade NestJS backend implementation, database schema, multi-tenant isolation controls, RBAC security matrix, AI abstraction engine, and API integration specifications for **BusinessOS AI**.

---

## 1. Backend Architecture & Monorepo Setup

```
apps/api/src/
├── main.ts                     # NestJS bootstrap main entry & Swagger setup
├── app.module.ts               # Root NestJS module importing domain modules
├── common/                     # Cross-cutting security, guards, & decorators
│   ├── decorators/             # @CurrentUser, @RequirePermission
│   └── guards/                 # AuthGuard, PermissionsGuard
├── auth/                       # Authentication & Session verification (/api/auth/me, /api/auth/login)
├── customers/                  # Customer CRM & Pipeline routes (/api/customers, /api/customers/leads)
├── bookings/                   # Appointments & Slot conflict detection (/api/bookings, /api/bookings/services)
├── marketing/                  # Multi-channel campaigns & Google Reviews (/api/marketing/campaigns, /api/marketing/reviews)
├── websites/                   # AI Website builder & block editing (/api/websites)
├── ai/                         # Saarthi AI engine & multi-provider adapter (/api/ai/messages)
├── dashboard/                  # Executive metrics & pulse overview (/api/dashboard/overview)
├── tasks/                      # Operational task list management (/api/tasks)
└── tests/                      # Tenant isolation & security test suite
```

---

## 2. Database Schema (PostgreSQL / Neon & Prisma ORM)

The data model is declared in `packages/database/prisma/schema.prisma` and enforced in `BusinessOSRepository`:

- **Tenant Core**: `User`, `Organization`, `Membership`, `BusinessProfile`
- **CRM & Pipeline**: `Customer`, `Lead`, `CustomerActivity`, `Note`
- **Bookings & Rosters**: `Booking`, `Service`, `Staff`
- **Marketing & Funnels**: `Campaign`, `Review`, `Website`
- **Billing & Operations**: `Invoice`, `Subscription`, `Task`, `Notification`, `Integration`

---

## 3. Multi-Tenant Isolation & Security Strategy

### Tenant Context Resolution
- The server extracts `organizationId` from verified JWT / Session Bearer tokens (`request.user.organizationId`).
- All database queries (`getCustomers`, `getBookings`, `getWebsite`, `getCampaigns`) filter explicitly by `organizationId`.
- Untrusted frontend payload parameters specifying `organizationId` are ignored to prevent IDOR (Insecure Direct Object Reference) vulnerabilities.

---

## 4. RBAC Permission Matrix

| Role | Access Level | Granted Permissions |
| :--- | :--- | :--- |
| **OWNER** | Full Control | `org:read`, `org:write`, `customers:read`, `customers:write`, `bookings:read`, `bookings:write`, `marketing:read`, `marketing:write`, `website:read`, `website:write`, `ai:execute`, `billing:manage`, `settings:manage` |
| **MANAGER** | Operational | `org:read`, `customers:read`, `customers:write`, `bookings:read`, `bookings:write`, `marketing:read`, `marketing:write`, `website:read`, `ai:execute` |
| **STAFF** | Restricted | `org:read`, `customers:read`, `bookings:read`, `bookings:write`, `ai:execute` |

Guards enforced via NestJS decorators `@RequirePermission('customers:write')` and `@UseGuards(AuthGuard, PermissionsGuard)`.

---

## 5. Multi-Provider AI Abstraction Layer

- **Supported AI Providers**: OpenAI, Anthropic Claude, Google Gemini, Groq.
- **Provider Interface**: `IAIService` in `@businessos/ai`.
- **Tool Safety & Audit Logging**: Read actions (LTV queries, booking schedules) execute automatically; sensitive write actions (mass campaign broadcasts) generate structured confirmation cards requiring user explicit verification before dispatching.

---

## 6. REST API Endpoints & Swagger Documentation

- **Base URL**: `http://localhost:4000/api`
- **Swagger OpenAPI Docs**: `http://localhost:4000/api/docs`

| Endpoint | Method | Role Permission Required | Description |
| :--- | :---: | :---: | :--- |
| `/api/auth/me` | `GET` | Authenticated Session | Get active user, tenant, role, and permissions |
| `/api/dashboard/overview` | `GET` | `org:read` | Executive dashboard stats & revenue metrics |
| `/api/customers` | `GET` | `customers:read` | Fetch organization customer records |
| `/api/customers` | `POST` | `customers:write` | Register new client profile |
| `/api/customers/leads` | `GET` | `customers:read` | Fetch pipeline leads |
| `/api/bookings` | `GET` | `bookings:read` | Get scheduled appointments |
| `/api/bookings` | `POST` | `bookings:write` | Schedule appointment with slot conflict check |
| `/api/marketing/campaigns` | `GET` | `marketing:read` | Get broadcast campaigns |
| `/api/marketing/campaigns` | `POST` | `marketing:write` | Dispatch campaign broadcast |
| `/api/marketing/reviews/:id/reply` | `POST` | `marketing:write` | Reply to Google review |
| `/api/websites` | `GET` | `website:read` | Fetch website block layout |
| `/api/websites/blocks/:id` | `PATCH` | `website:write` | Update visual block content |
| `/api/websites/publish` | `POST` | `website:write` | Toggle live publishing |
| `/api/ai/messages` | `POST` | `ai:execute` | Execute natural language command |
| `/api/tasks` | `GET` | `org:read` | Fetch operational tasks |

---

## 7. Frontend API Integration Client Layer

Created in `apps/web/src/lib/api/`:
- `client.ts`: Typed fetch wrapper with Bearer token header injection and error handling.
- `auth.ts`: Authentication & current-user session methods.
- `customers.ts`: Customer CRM & Lead pipeline methods.
- `bookings.ts`: Appointment scheduling & conflict detection methods.
- `campaigns.ts`: Marketing broadcast & review response methods.
- `websites.ts`: Website block editor & publishing methods.
- `ai.ts`: Multi-model AI query execution methods.
- `dashboard.ts`: Dashboard pulse metrics & task list methods.

---

## 8. Verification & Build Confirmation

1. **NestJS API Build**:
   - `npm run build` in `apps/api`: **Passed with Code 0** (`tsc` compilation successful).
2. **Next.js Web App Build**:
   - `npm run build` in `apps/web`: **Passed with Code 0** (All 11 static & dynamic routes prerendered cleanly).
3. **Multi-Tenant Isolation Tests**:
   - Verified that Organization B cannot read or mutate Organization A data.
