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

## Database

Schema: `packages/db/prisma/schema.prisma`. Migrations: `packages/db/prisma/migrations`.

```bash
pnpm --filter @pulse/db migrate:deploy   # apply migrations to DATABASE_URL
pnpm --filter @pulse/db migrate:status
```

Some guarantees cannot be expressed in Prisma's schema language and live as hand-written SQL at the end
of the init migration: the partial unique index that allows only one open incident per service, and `CHECK`
constraints on service configuration and check results.

## SSRF policy

`packages/shared/src/net` validates every monitored URL (scheme, credentials, port allowlist, blocked
hostnames, DNS resolution, every resolved IP against blocked ranges including IPv4-embedded IPv6 forms).
`validateTarget()` returns the validated addresses, and the HTTP client must connect to exactly those IPs.

## Milestones

- [x] M0 Foundation
- [x] M1 Data model + SSRF policy
- [ ] M2 API
- [ ] M3 Worker
- [ ] M4 Incident engine
- [ ] M5 Query API
- [ ] M6 Frontend
- [ ] M7 Load experiment
- [ ] M8 Extras (percentiles, status page, webhooks, ADR)
- [ ] M9 Polish
