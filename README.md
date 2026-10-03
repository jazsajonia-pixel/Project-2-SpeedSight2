# SpeedSight - Vehicle Speed Monitoring & Traffic Analytics

SpeedSight is a browser-based vehicle speed monitoring and traffic analytics platform built with Vite, React, TypeScript, Tailwind CSS, Hono, and Prisma/PostgreSQL.

---

## Current Project Baseline (Phases 1–4)

- **Phase 1 & 2:** Frontend baseline with Vite, React 19, TypeScript, Tailwind CSS v4, Lucide icons, and responsive UI navigation shell (`/`, `/login`, `/register`, `/dashboard`, `/monitoring`, `/sessions`, `/detections`, `/analytics`, `/reports`, `/camera-profiles`, `/calibration`, `/settings`).
- **Phase 3:** PostgreSQL database schema with Prisma ORM v5, seed dataset, and Hono REST API handlers.
- **Phase 4:** Server-managed HTTP-only session authentication, password hashing (`bcryptjs`), and user resource authorization scoping.
- **Vercel Serverless Integration:** Production deployment configuration using `@hono/vercel` serverless function handlers in `api/index.ts` and rewrite rules in `vercel.json`.

*Note: Phase 5 (In-Browser Computer Vision Tracking) has NOT been implemented yet.*

---

## Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL / Neon database connection string (e.g. `postgresql://user:pass@ep-host.neon.tech/dbname?sslmode=require`).
- `APP_URL`: Application origin (e.g. `http://localhost:5173`).
- `AUTH_SECRET`: Secret key for session encryption / signature hashing.

---

## Development & Verification Commands

```bash
# Install dependencies
npm install

# Validate Prisma schema
npx prisma validate

# Generate Prisma Client
npx prisma generate

# Type check
npx tsc --noEmit

# Run unit and integration tests
npm test

# Production build
npm run build
```

---

## REST API Endpoints

- `GET /api/health` - API and database status
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User sign-in
- `POST /api/auth/logout` - Session invalidation
- `GET /api/auth/me` - Authoritative current user
- `GET/POST/PATCH/DELETE /api/sessions` - Monitoring sessions CRUD
- `GET/POST/PATCH/DELETE /api/cameras` - Camera configurations CRUD
- `GET/POST/PATCH/DELETE /api/calibrations` - Calibration profiles CRUD
- `GET/POST/PATCH/DELETE /api/speed-thresholds` - Speed thresholds CRUD
- `GET /api/detections` - Vehicle detections history (supports `sessionId`, `classification`, `vehicleType`, `from`, `to`, `limit`)
- `GET /api/dashboard/stats` - Calculated aggregate dashboard statistics
- `GET/POST/DELETE /api/reports` - Saved audit reports
