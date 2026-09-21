# Cycle of Chart — Dedicated Admin Operations Console

A completely separate, standalone Operations & Admin Panel for Cycle of Chart, located at `D:\cycle of admin main`.

## Key Capabilities
- **Executive KPI Analytics**: Live tracking of verified revenue (BDT), pending verification volume, total student count, and support resolution rates.
- **Manual Payment Verification Queue**: 1-click approval for bKash, Nagad, and Rocket payments with automatic entitlement grants, or rejection with customer notifications.
- **Student & Access Management**: Search students, update security roles (`user`, `support`, `admin`), and grant course bundle entitlements directly into the live database.
- **Free eBooks & PDF Library CMS**: Publish institutional strategy guides, upload custom PDF documents, manage bilingual metadata, and toggle publishing states.
- **Founder & Owner Profile CMS**: Edit founder details, trading methodology, photo, social links, and view a live responsive preview with an animated RGB border matching the public home page.
- **Support Desk Operations**: View student inquiries, manage status (`open`, `in_progress`, `resolved`), and respond to tickets.
- **Gateway & Notice Settings**: Live management of bKash, Nagad, and Rocket merchant numbers and broadcast announcements.
- **Security Audit Trail**: Real-time event log recording administrative operations with timestamps.
- **Zero Friction Access**: Direct access without login barriers.

## Getting Started

### Standalone Execution:
```bash
# Navigate to the folder
cd "D:\cycle of admin main"

# Start the dev server (runs on port 3001)
pnpm dev
```

### From Cycle-web-main:
```bash
# In D:\Cycle-web-main:
pnpm run dev:admin
```

The admin console is accessible at:
👉 `http://localhost:3001`
