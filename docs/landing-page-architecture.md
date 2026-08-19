# Saarthi AI (सारथी AI) Landing Page Architecture

## Overview
**Saarthi AI** (Hindi: **सारथी AI** — *The trusted guide/companion that drives businesses forward*) public landing page architecture.

It combines editorial typography, controlled colorful module accents, and interactive 3D scene storytelling via React Three Fiber (R3F) without disrupting the existing SaaS dashboard or API engine.

---

## Brand Positioning & Copy Philosophy
- **Primary Headline**: *"Your business has a new Saarthi."*
- **Supporting Headline**: *"One intelligent workspace that understands your business, takes action, and helps you grow."*
- **Core Philosophy**: *"Ask. Saarthi does the work."*
- **Accent Color Palette**:
  - Base: `#0F172A`, `#F8FAFC`, `#020617`
  - Core Accent: `#3B82F6` (Blue)
  - Module Accents:
    - Customer CRM: `Blue` (`#3B82F6`)
    - Revenue & Bookings: `Emerald` (`#10B981`)
    - AI Website Builder: `Amber` (`#F59E0B`)
    - Marketing & Automation: `Violet` (`#8B5CF6`)

---

## Directory & Component Layout

```
apps/web/src/
├── app/
│   └── page.tsx                     <-- Public Saarthi AI Landing Page Entry Point
└── components/
    └── landing/
        ├── Navbar.tsx               <-- Top header navigation & launch CTA
        ├── Hero.tsx                 <-- Editorial hero with embedded 3D scene & Saarthi prompt bar
        ├── AICommand.tsx            <-- Interactive "Ask -> Saarthi does the work" simulator
        ├── BusinessEcosystem.tsx    <-- Module network breakdown (CRM, Website, Marketing, Bookings)
        ├── WorkflowSection.tsx      <-- Ask → Understand → Act interactive pipeline
        ├── ProductPreview.tsx       <-- Interactive SaaS dashboard preview switcher
        ├── IndustrySelector.tsx     <-- Targeted industry solutions (Salons, Clinics, Gyms, etc.)
        ├── IntelligenceSection.tsx  <-- Security, RBAC guard, and provider abstraction overview
        ├── Features.tsx             <-- Detailed editorial feature matrix
        ├── FinalCTA.tsx             <-- High-converting call to action banner
        ├── Footer.tsx               <-- System status & links
        └── 3d/
            ├── SaarthiScene.tsx     <-- R3F Canvas wrapper with fallback loading state
            ├── SaarthiCore.tsx      <-- Central 3D geometric intelligence core
            ├── BusinessNode.tsx     <-- Interactive 3D module nodes surrounding core
            ├── ConnectionLine.tsx   <-- Dynamic bezier/particle data pipelines
            ├── DataParticle.tsx     <-- Ambient particle field
            ├── FloatingMetric.tsx   <-- 3D floating metric cards
            └── CameraController.tsx <-- Smooth camera rotation & mouse parallax
```

---

## 3D Scene Architecture (React Three Fiber)
1. **SaarthiCore**: Interactive icosahedron & octahedron core with pulsing wireframe shader effect.
2. **BusinessNode**: Orbiting 3D geometry nodes representing CRM, Revenue, Marketing, and Website modules.
3. **ConnectionLine**: Vector line streams representing real-time data exchange.
4. **DataParticle**: Ambient background field rendered with low performance impact.
5. **CameraController**: Subtle rotation and mouse-driven camera parallax for depth.

---

## Dashboard Non-Breakage Guarantee
- The public landing page (`apps/web/src/app/page.tsx`) renders independently.
- All `/dashboard/*` routes remain fully intact, typechecked, and operational.
