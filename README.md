# SpeedSight — Phases 1–4

SpeedSight currently provides a responsive traffic-analytics **sample UI**, a PostgreSQL REST API, and secure account authentication. Existing screens intentionally use `src/lib/demoData.ts`; they are not measurements or a view of each user's database records. The API independently returns only records owned by the signed-in user. Seed records belong only to the development demo account.

**Phase 5 is not implemented:** no camera access/getUserMedia, computer vision, vehicle detection or tracking engine, speed calculation, calibration mathematics, WebSockets, live monitoring, image storage, evidence snapshots, PDF/CSV generation, or AI traffic analysis. Monitoring controls and calibration previews are UI placeholders. Saved reports are metadata only.

## Architecture

- Frontend: Vite, React 19, TypeScript, React Router, TanStack Query, React Hook Form, Zod, Lucide React, existing Tailwind v4 styles.
- API: Hono in `api/index.ts`, Zod input schemas, shared server-side Prisma client in `api/utils/prisma.ts`. PostgreSQL is the persistent store. No permanent Node process is required in production.
- Authentication: bcrypt (cost 10), random 256-bit opaque session tokens, SHA-256 token hashes in PostgreSQL, seven-day expiry. Raw tokens are set only in HttpOnly cookies (`SameSite=Lax`, `Path=/`, explicit expiry, `Secure` in production), never returned in JSON or stored in localStorage. Passwords exceeding bcrypt's 72-byte UTF-8 limit are rejected.
- `GET /api/auth/me` is the authoritative TanStack Query current-user state. Login/registration refetch it; logout invalidates the database session and clears private query caches. Protected API 401 responses clear the user; focus/periodic checks detect expiry. Network failures have a retry state rather than being treated as successful logout.
- Ownership comes from the authenticated session. Direct resources filter `userId`; detections, reports, and session traffic summaries enforce nested session ownership. JSON writes check browser Origin against `APP_URL`. All API responses disable caching; unexpected server failures are logged server-side and return generic structured errors.
- Shared `DataTable` and `EmptyState` components preserve the Phase 2 table design. Filtering the sample session list can display the empty state.

Public routes: `/`, `/login`, `/register`.
Protected routes: `/dashboard`, `/monitoring`, `/sessions`, `/detections`, `/analytics`, `/reports`, `/camera-profiles`, `/calibration`, `/settings`.

## Environment and development

Use Node 24 and npm (the development scripts use Node's `--env-file-if-exists`).

```bash
npm ci
cp .env.example .env
# Edit .env before database commands.
npx prisma generate
npx prisma validate
```

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection URL; use a provider-supported pooled URL for serverless traffic. Never prefix with `VITE_`. |
| `APP_URL` | Exact browser origin, e.g. `http://localhost:5173` or your production HTTPS origin. Used for write-origin checks; set per deployment environment. |
| `AUTH_SECRET` | Reserved and currently **unused**. Custom sessions use random tokens and stored hashes, not signed tokens. |
| `NODE_ENV` | Production enables Secure cookies and disables the demo seed. Managed by the deployment runtime. |

`.env`, `.env.*` (except `.env.example`) and `.vercel` are ignored. Never commit real credentials or expose server secrets as Vite environment variables.

### Database migrations

Three migrations are checked in: the original Phase 3–4 schema baseline, the additional session statuses, and the alignment repair. Enum additions must commit before the new default is used.

**New/empty database:**

```bash
npx prisma migrate deploy
```

**Existing database previously created with `prisma db push`:** back up the database and compare its schema with `prisma/migrations/20261003000000_baseline/migration.sql`. Only if that baseline matches, mark it applied (do not execute its CREATE statements against existing tables), then apply repairs:

```bash
npx prisma migrate resolve --applied 20261003000000_baseline
npx prisma migrate deploy
npx prisma generate
```

If the existing database differs, reconcile it before baselining; do not blindly reset or mark migrations applied. No remote Neon database is assumed migrated by this repository change.

Repair mappings:

- Monitoring `location` becomes `description`; new sessions default to `DRAFT`, with nullable `startedAt`. Existing dates/statuses are preserved. The old monitoring `sourceType` is retired; source configuration belongs to cameras.
- Camera webcam/IP/RTSP types map to `CAMERA`, video files to `VIDEO`; `DEMO` is available. Existing `sourceUrl` text is retained as `description` metadata (never fetched). `processingQuality` defaults to `High`.
- Calibration `distanceMeters` becomes `knownDistance` with unit `m`; old pixel distance and matrix text are preserved inside `calibrationData` JSON as legacy metadata. No calibration calculation is performed.
- Redundant threshold `speedLimit` is retired; classification boundaries are `normalMaximum` and `warningMaximum`. Back up retired fields if used by external consumers.
- A database CHECK enforces `normalMaximum < warningMaximum`. Existing invalid rows must be corrected before the repair migration can succeed. API CREATE and PATCH validate this invariant; PATCH also guards concurrent edits.

For future development schema changes, use `npx prisma migrate dev --name <change>`. `npx prisma db push` is an alternative only for disposable prototypes: it does not apply the custom threshold CHECK or establish migration history, so it is not the supported production upgrade procedure.

### Development seed

```bash
npm run seed
```

Run only against a development database. The script refuses `NODE_ENV=production`, uses stable IDs and transactional upserts, and does not delete other users' records or reset an existing user's password. It creates a small sample user/session/camera/calibration/threshold/detection/event/summary/report dataset. Confidence, bounding boxes, and snapshots are left unset. Repeated seeds do not add duplicates.

Development-only login: `demo@speedsight.local` / `Demo12345!`. This is a public fixture credential, never a production account. Remove old demo duplicates manually if an earlier non-idempotent seed was run; this seed deliberately does not bulk-delete existing data.

### Run locally

Two terminals:

```bash
npm run dev:api  # local Hono adapter at 127.0.0.1:3001, loads .env
npm run dev     # Vite at http://localhost:5173, proxies /api to the local API
```

Open `http://localhost:5173`. The frontend always uses relative `/api/...` URLs. The adapter in `scripts/dev-api.ts` is only for local development. `npm run preview` serves the compiled frontend; it is not an API server.

## API

Errors consistently use `{ "error": { "code": "...", "message": "..." } }`; validation errors include safe field details. IDs are UUIDs. Unauthenticated protected requests return 401; inaccessible resources return 404.

| Resource | Endpoints |
| --- | --- |
| Health | `GET /api/health` (public, includes database availability) |
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` |
| Sessions | `GET/POST /api/sessions`, `GET/PATCH/DELETE /api/sessions/:id` |
| Cameras | `GET/POST /api/cameras`, `GET/PATCH/DELETE /api/cameras/:id` |
| Calibrations | `GET/POST /api/calibrations`, `GET/PATCH/DELETE /api/calibrations/:id` |
| Thresholds | `GET/POST /api/speed-thresholds`, `GET/PATCH/DELETE /api/speed-thresholds/:id` |
| Detections | `GET /api/detections`, `GET /api/detections/:id` |
| Dashboard | `GET /api/dashboard/stats` (aggregates stored records only) |
| Reports | `GET/POST /api/reports`, `GET/DELETE /api/reports/:id` |

Detections accept `sessionId`, `classification` (`NORMAL/WARNING/SPEEDING`), `vehicleType`, `from`, `to`, and `limit` (1–500, default 50). Date bounds are inclusive ISO-8601 timestamps with `Z` or an offset; invalid dates and reversed ranges return 400. Traffic summaries are returned through the owning session detail.

Calibration units are `m`/`ft`; threshold units are `mph`/`km/h`. Camera source types and session status validation come directly from Prisma enums. Frontend API DTOs are in `src/types/api.ts`; sample view models remain separate.

## Verification

```bash
npm test
npm run build
npx tsc --noEmit
npx tsc -b
npx prisma validate
npx prisma generate
npx prisma migrate status  # requires PostgreSQL
curl http://localhost:5173/api/health
```

The root TypeScript config uses project references: `tsc -b` (also run by `npm run build`) checks frontend, backend, tests, development adapter, and seed; `tsc --noEmit` alone does not traverse those references.

Vitest covers password hashing/validation, duplicate registration (including races), invalid credentials, session cookies/expiration, middleware, ownership, logout, safe errors, date filtering, partial/concurrent threshold safeguards, Vercel Web handlers, and current-user query transitions. Prisma is mocked in these unit tests; they do not prove remote connectivity. The repair was also exercised against disposable local PostgreSQL 16 with migrations, repeat seed, two-user ownership, date filters, concurrency, logout, and expiry.

## Vercel deployment

Use the Vite preset, build `npm run build`, output `dist`, Node 24. `api/index.ts` exports Web Standard HTTP method handlers through `@hono/vercel`, compatible with [Vercel's Node function formats](https://vercel.com/docs/functions/runtimes/node-js). `vercel.json` routes `/api/*` to the function before the SPA fallback; keep that ordering. No Edge runtime is used with the Node Prisma/bcrypt implementation. Prisma is generated during installation/build and reused within warm function instances.

Set server environment variables for each deployment. Use HTTPS in production and set `APP_URL` to the exact browser origin (including for previews). Apply migrations as a controlled database deployment step, not on every frontend build. Use a pooled database URL appropriate for your PostgreSQL provider and function concurrency.

Production hardening still requires deployment-level distributed rate limiting for `/api/auth/login` and `/api/auth/register` (e.g. Vercel Firewall rules). No unreliable per-process in-memory limiter is used. Remote Vercel deployment and remote Neon migration require access to those environments; local handler tests are not a deployed-platform verification.
