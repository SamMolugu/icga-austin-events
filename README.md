# ICGA Austin Events

ICGA Austin Events is a community scheduling and registration platform for the Islamic Center of Greater Austin (ICGA). It helps the Austin masjid community discover programs, register for events, track attendance, coordinate giving, and keep organizers informed.

## What it includes

- Public ICGA event calendar with search, category filters, modest event photos, and a geometric page background
- Periodic sync from austinmosque.org/calendar and austinmosque.org/support-us
- Event detail pages with registration, approved flyers, and capacity-aware waitlists
- Registration confirmation pages with ticket codes
- Public impact page for program giving, campus development, tickets, and recent gifts
- Clerk-powered sign-in/sign-up with organizer-only access to the admin workspace
- Organizer dashboard with attendance, registration, giving, and activity metrics
- Ticket tracker with unique codes, headcount, waitlist, and door check-in
- Flyer inbox for submitting, approving, or sending artwork back
- Attendance workspace with attendee lists, confirmed headcount, capacity usage, and waitlist counts
- Event creation, editing, publishing, and completion
- Marketing planner with event-linked email, social, WhatsApp, and website touchpoints
- Donation ledger plus public program and development funds
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
pnpm --filter @workspace/scripts run test:images
# Against a running local stack:
pnpm --filter @workspace/scripts run test
pnpm --filter @workspace/scripts run test:responsive
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
- `GET /api/organizer/events` (organizer-only; drafts, published, and completed)
- `POST /api/events`
- `GET /api/events/:eventId`
- `PATCH /api/events/:eventId`
- `POST /api/registrations`
- `GET /api/registrations/:registrationId`
- `GET /api/registrations?eventId=:eventId` (organizer-only attendee list)
- `GET /api/donations`
- `POST /api/donations`
- `POST /api/organizer/sync` (organizer-only refresh from austinmosque.org)
- `GET /api/impact`
- `GET /api/funds`
- `POST /api/funds/:fundId/gifts` (organizer-only)
- `GET /api/flyers`
- `POST /api/flyers` (organizer-only)
- `PATCH /api/flyers/:flyerId` (organizer-only)
- `POST /api/registrations/:registrationId/check-in` (organizer-only)
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

The production image serves the website and the API on one port. Postgres stays outside the image.

```bash
cp .env.example .env
# Fill in the passwords and Clerk keys in .env, then:
docker compose up --build
```

The app listens at `http://localhost:5000`. Compose applies the database schema before the app starts, and an empty database is seeded with the ICGA calendar.

To build the image by itself:

```bash
docker build -t icga-austin-events .
docker run --rm -p 5000:5000 \
  -e PORT=5000 \
  -e DATABASE_URL="$DATABASE_URL" \
  -e SESSION_SECRET="$SESSION_SECRET" \
  -e CLERK_PUBLISHABLE_KEY="$CLERK_PUBLISHABLE_KEY" \
  -e CLERK_SECRET_KEY="$CLERK_SECRET_KEY" \
  -e GITHUB_WEBHOOK_SECRET="$GITHUB_WEBHOOK_SECRET" \
  -e CLIENT_DIST=/app/client \
  icga-austin-events
```

Clerk keys used by the browser are baked in at image build time. Pass them as build args when the image is built for a public host:

```bash
docker build -t icga-austin-events \
  --build-arg VITE_CLERK_PUBLISHABLE_KEY="$VITE_CLERK_PUBLISHABLE_KEY" \
  --build-arg VITE_CLERK_PROXY_URL="$VITE_CLERK_PROXY_URL" \
  .
```

## Releases and Replit

Updates ship from a `release/*` branch. Open a pull request into `main`. CI builds the Docker image on that pull request and again when the branch lands on `main`. A push to `main` is what publishes the Replit deployment. Do not push release work straight to `main`.

Before the first production deploy, connect this GitHub repository to the Replit app and add these secrets to the GitHub `production` environment:

- `REPLIT_REPL_ID`
- `REPLIT_DEPLOY_TOKEN` from [replit.com/account](https://replit.com/account#api-tokens)

The deploy workflow reads those secrets at runtime. They are not stored in the repository.

## Publishing and custom URL

Publish the web artifact from the Replit Publishing tool. Publishing provides HTTPS and a public `*.replit.app` address. A custom ICGA domain can be attached from the publishing domain settings after the app is published.

Before publishing:

- Confirm the development database is seeded
- Choose the public visibility setting
- Add `GITHUB_WEBHOOK_SECRET` if GitHub webhooks will be enabled
- Add the custom domain and complete its DNS verification

## Current ICGA calendar seed

The demo database is seeded on API startup when the events table is empty, using programs from the official ICGA event calendar at [austinmosque.org/calendar](https://austinmosque.org/calendar), including:

- Sisters’ Circle With Imam Dawood
- Brothers Quran Halaqa
- Brothers’ Fajr Quran Halaqa

Treat the official ICGA calendar as the source of truth and update event records from the organizer workspace when dates, times, or locations change.

## Product identity

- Name: **ICGA Austin Events**
- Community: **Islamic Center of Greater Austin**
- Primary use: masjid programs, prayer-related events, learning, youth activities, service, registration, and community giving