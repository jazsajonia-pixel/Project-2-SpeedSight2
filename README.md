# SpeedSight - Vehicle Speed Monitoring & Traffic Analytics

SpeedSight is a browser-based traffic analytics project for reviewing vehicle detections, monitoring sessions, camera profiles, and reports. Its computer-vision foundation processes a local camera stream or video file in the browser, keeping the media on the device rather than uploading it to the server.

The current baseline combines a React and TypeScript interface with a Hono API and PostgreSQL persistence. Vehicle detection and tracking are available in the browser; calibrated speed measurement is **not yet connected** and must not be used for legal enforcement.

---

## Current Project Baseline (Phases 1–5)

- **Phase 1 & 2:** Frontend baseline with Vite, React 19, TypeScript, Tailwind CSS v4, Lucide icons, and responsive UI navigation shell (`/`, `/login`, `/register`, `/dashboard`, `/monitoring`, `/sessions`, `/detections`, `/analytics`, `/reports`, `/camera-profiles`, `/calibration`, `/settings`).
- **Phase 3:** PostgreSQL database schema with Prisma ORM v5, seed dataset, and Hono REST API handlers.
- **Phase 4:** Server-managed HTTP-only session authentication, password hashing (`bcryptjs`), and user resource authorization scoping.
- **Phase 5 (Computer Vision Foundation):**
  - In-browser local video stream processing using `@tensorflow/tfjs` and `@tensorflow-models/coco-ssd` (MobileNet v2).
  - Real browser camera access via `navigator.mediaDevices.getUserMedia()` with device enumeration and MediaStream track cleanup.
  - Local video file playback support for offline testing without server file uploads.
  - Multi-class vehicle detection (`car`/`sedan`, `truck`, `bus`, `motorcycle`) with real model confidence scores and bounding boxes.
  - IoU (Intersection over Union) frame-to-frame vehicle tracking ID association.
  - Controlled, throttled detection loop (default target 10 FPS) with a configurable minimum confidence score.
  - Live bounding boxes, fullscreen preview, local frame capture, and CSV export of currently tracked vehicles.
  - Dashboard, session, detection, camera profile and report screens show saved records or honest empty states; simulated fixture data and public demo mode have been removed.
- **Calibration guidance:** Explains reference distances, crossing time, perspective limitations and a worked example. Calibration is not yet wired into speed output.
- *Disclaimer: Vehicle recognition can miss or misclassify vehicles. SpeedSight does not currently provide calibrated speed measurement and is NOT certified for legal speed enforcement.*

## Autonomous Development

Scheduled autonomous runs should read [`auto_dev_prompt.md`](./auto_dev_prompt.md) first. That file contains the concise execution contract, validation requirements, non-repetition rules, and reporting format. The longer roadmap and future improvement phases are maintained in [`development_phases.md`](./development_phases.md). Completed work is tracked in [`.manus/speedsight-autonomous-progress.md`](./.manus/speedsight-autonomous-progress.md).

---

## Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL / Neon database connection string (e.g. `postgresql://user:pass@ep-host.neon.tech/dbname?sslmode=require`).
- Prisma defaults an unset `connection_limit` to `1` per serverless instance; explicitly configured pool settings are preserved.
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

- `GET /api/health` - API and database status; returns HTTP 503 with `status: "degraded"` when the database is unavailable or does not respond within 2.5 seconds
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
