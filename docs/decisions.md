# Decision Records (ADR)

## ADR-001: Monorepo Architecture with NPM Workspaces
- **Status**: Accepted
- **Context**: The project requires clean separation of concerns between web frontend, backend API, shared types, UI components, AI abstractions, and database utilities.
- **Decision**: Use `npm workspaces` in the root `package.json` to manage `@businessos/web`, `@businessos/api`, `@businessos/shared`, `@businessos/database`, `@businessos/auth`, `@businessos/ai`, and `@businessos/ui`.

## ADR-002: Multi-Tenant Data Isolation Strategy
- **Status**: Accepted
- **Context**: Security requires zero data leaks across business accounts (tenants).
- **Decision**: Every database entity associated with business data must include an `organization_id` property. All API endpoints and repositories automatically append `where: { organization_id: currentOrgId }` derived from verified auth session headers/JWTs.

## ADR-003: AI Provider Abstraction Interface
- **Status**: Accepted
- **Context**: AI models (OpenAI, Claude, Gemini, Groq) evolve rapidly. Business logic must not depend directly on SDK vendor calls.
- **Decision**: Define an `IAIService` interface in `@businessos/ai` exposing `generateCompletion`, `detectIntent`, and `executeAction`. Abstract provider selection using an environment adapter (`AI_PROVIDER=openai|anthropic|gemini|groq|mock`).

## ADR-004: Payment Adapter & Mock Sandbox Mode
- **Status**: Accepted
- **Context**: Payment credentials must never be hardcoded, and development must operate reliably offline or without real credit card transactions.
- **Decision**: Build a clean `IPaymentService` adapter for Razorpay. Support both `live` and `simulation/mock` mode. In simulation mode, realistic payment flows (order creation, signature verification, invoice generation, webhooks) occur synchronously with visual UI feedback.

## ADR-005: Security & Role-Based Access Control (RBAC)
- **Status**: Accepted
- **Context**: Roles (`OWNER`, `MANAGER`, `STAFF`) require distinct operational boundaries.
- **Decision**: Implement a granular permission checker (`@businessos/auth`). `OWNER` has unrestricted access. `MANAGER` can manage operational data (customers, bookings, campaigns) but cannot alter organization ownership, API keys, or billing settings. `STAFF` can only view/edit assigned tasks and schedules.
