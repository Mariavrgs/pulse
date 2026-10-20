# Pulse

Uptime and performance monitoring for web services. Work in progress; see the milestone checklist below.

## Requirements

- Node.js >= 22.12 (see `.nvmrc`)
- pnpm 12 (`corepack enable` or `npm i -g pnpm`)
- Docker with Compose v2

## Quick start

```bash
pnpm install
cp .env.example .env
pnpm infra:up      # Postgres 17 + Redis 7, waits until healthy
pnpm check         # lint + format + typecheck + tests
```

## Milestones

- [x] M0 Foundation
- [ ] M1 Data model + SSRF policy
- [ ] M2 API
- [ ] M3 Worker
- [ ] M4 Incident engine
- [ ] M5 Query API
- [ ] M6 Frontend
- [ ] M7 Load experiment
- [ ] M8 Extras (percentiles, status page, webhooks, ADR)
- [ ] M9 Polish
