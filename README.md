# ICGA Austin Events

ICGA Austin Events is a community scheduling and registration platform for the Islamic Center of Greater Austin (ICGA). It helps the Austin masjid community discover programs, register for events, track attendance, coordinate giving, and keep organizers informed.

## What it includes

- Public ICGA event calendar with search and category filters
- Event detail pages with registration and capacity-aware waitlists
- Registration confirmation pages
- Clerk-powered sign-in/sign-up with organizer-only access to the admin workspace
- Organizer dashboard with attendance, registration, giving, and activity metrics
- Attendance workspace with attendee lists, confirmed headcount, capacity usage, and waitlist counts
- Event creation, editing, publishing, and completion
- Marketing planner with event-linked email, social, WhatsApp, and website touchpoints
- Donation ledger with charity and community-fund tracking
- Notification preference controls for reminders, registration alerts, giving updates, and weekly summaries
- Signed GitHub webhook receiver at `POST /api/webhooks/github`
- OpenAPI-first API with generated React Query hooks and Zod validation
- PostgreSQL persistence through Drizzle ORM
- GitHub Actions CI and a production Dockerfile

## Local development

### Requirements

- Node.js 24+
- pnpm 10+
- PostgreSQL

The Replit project provides `DATABASE_URL` for the development database.

### Install

```bash
pnpm install
```

### Generate API clients

The OpenAPI document is the source of truth:

```bash
pnpm --filter @workspace/api-spec run codegen
```

Run this again any time `lib/api-spec/openapi.yaml` changes.

### Apply the database schema

```bash
pnpm --filter @workspace/db run push
```

### Run the app

The configured workflows run the API and web app:

```bash
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/event-platform run dev
```

The web app is served at `/` and the API is served at `/api`.

Create an organizer account at `/sign-up`. Signed-in organizers can open the dashboard, manage events, review attendance, record giving, and plan campaign touchpoints. Public visitors can still browse and register without an account.

### Verification

```bash
pnpm run typecheck
pnpm --filter @workspace/event-platform run build
```

## Project structure

```text
artifacts/
  api-server/       Express API and GitHub webhook receiver
  event-platform/   React + Vite ICGA web app
lib/
  api-spec/         OpenAPI source contract
  api-client-react/ Generated React Query client
  api-zod/          Generated Zod schemas
  db/               Drizzle schema and database client
.github/workflows/
  ci.yml            Codegen, typecheck, and frontend build pipeline
Dockerfile          Multi-stage API container
```

## API surface

The main API routes are:

- `GET /api/events`
- `POST /api/events`
- `GET /api/events/:eventId`
- `PATCH /api/events/:eventId`
- `POST /api/registrations`
- `GET /api/registrations/:registrationId`
- `GET /api/registrations?eventId=:eventId` (organizer-only attendee list)
- `GET /api/donations`
- `POST /api/donations`
- `GET /api/analytics/overview`
- `GET /api/analytics/activity`
- `GET /api/notifications/preferences`
- `PATCH /api/notifications/preferences`
- `GET /api/marketing/plans?eventId=:eventId`
- `POST /api/marketing/plans`
- `PATCH /api/marketing/plans/:planId`
- `DELETE /api/marketing/plans/:planId`
- `POST /api/webhooks/github`

Health check:

```text
GET /api/healthz
```

## GitHub webhook

Configure a GitHub repository webhook to send `application/json` push events to:

```text
https://YOUR_PUBLISHED_DOMAIN/api/webhooks/github
```

Set `GITHUB_WEBHOOK_SECRET` in the deployment environment. The receiver validates GitHub's `x-hub-signature-256` header and records accepted webhook activity in the organizer feed.

## CI/CD

`.github/workflows/ci.yml` runs on pushes to `main` and pull requests. It:

1. Installs dependencies with the frozen lockfile
2. Regenerates the OpenAPI clients
3. Runs the workspace typecheck
4. Builds the frontend

## Container build

The API has a multi-stage production container:

```bash
docker build -t icga-austin-events .
docker run --rm -p 5000:5000 \
  -e DATABASE_URL="$DATABASE_URL" \
  -e SESSION_SECRET="$SESSION_SECRET" \
  -e GITHUB_WEBHOOK_SECRET="$GITHUB_WEBHOOK_SECRET" \
  icga-austin-events
```

For a public deployment, use a managed PostgreSQL database and a container host that supports HTTPS, environment secrets, and health checks. The app is designed to keep application state in PostgreSQL so it can scale beyond the first 100 community users.

## Publishing and custom URL

Publish the web artifact from the Replit Publishing tool. Publishing provides HTTPS and a public `*.replit.app` address. A custom ICGA domain can be attached from the publishing domain settings after the app is published.

Before publishing:

- Confirm the development database is seeded
- Choose the public visibility setting
- Add `GITHUB_WEBHOOK_SECRET` if GitHub webhooks will be enabled
- Add the custom domain and complete its DNS verification

## Current ICGA calendar seed

The demo database is seeded from the official ICGA event calendar at [austinmosque.org/calendar](https://austinmosque.org/calendar), including:

- Sisters’ Circle With Imam Dawood
- Brothers Quran Halaqa
- Brothers’ Fajr Quran Halaqa

Treat the official ICGA calendar as the source of truth and update event records from the organizer workspace when dates, times, or locations change.

## Product identity

- Name: **ICGA Austin Events**
- Community: **Islamic Center of Greater Austin**
- Primary use: masjid programs, prayer-related events, learning, youth activities, service, registration, and community giving