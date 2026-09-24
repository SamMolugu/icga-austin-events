# ICGA Austin Events

ICGA Austin Events helps the masjid community publish programs, collect registrations, track charitable giving, and understand participation from one place.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/event-platform` — React/Vite public ICGA event directory and organizer dashboard
- `artifacts/api-server` — Express API routes and signed GitHub webhook receiver
- `lib/api-spec/openapi.yaml` — source of truth for the API contract
- `lib/db/src/schema` — Drizzle/Postgres schema for events, registrations, donations, activity, and notification preferences
- `.github/workflows/ci.yml` and `Dockerfile` — repeatable verification and container build

## Architecture decisions

- The frontend and backend share generated OpenAPI hooks and Zod schemas so form payloads stay aligned.
- Event registration is capacity-aware: full events accept waitlisted registrations without inflating the confirmed count.
- Donation totals are recorded on both the donation ledger and the event summary for fast dashboard reads.
- GitHub webhooks require `GITHUB_WEBHOOK_SECRET`; CI runs codegen, typechecking, and the frontend build on every push and pull request.

## Product

ICGA visitors can browse and search upcoming masjid programs, open event details, register, and save a confirmation. Organizers can manage events, monitor registrations, track donations against community goals, review recent activity, and control notification preferences.

## User preferences

- The platform should remain friendly to a free-tier deployment serving 100+ users.

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after changing `lib/api-spec/openapi.yaml`.
- Production schema changes should go through the platform publish flow rather than startup-time DDL.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
