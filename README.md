# SpeedSight - Vehicle Speed Monitoring & Traffic Analytics

SpeedSight is a browser-based vehicle speed monitoring and traffic analytics platform built with Vite, React, TypeScript, Tailwind CSS, Hono, and Prisma/PostgreSQL.

---

## Tech Stack & Architecture

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, TanStack Query, React Hook Form, Zod.
- **Backend / REST API:** Node.js, TypeScript, Hono API framework (Vercel serverless compatible).
- **Database Layer:** Prisma ORM v5 with PostgreSQL driver.
- **Validation:** Zod schemas.

---

## Directory Structure

```text
/
├── api/                  # Hono REST API handlers, schemas, and middleware
│   ├── middleware/       # API error middleware
│   └── schemas/          # Zod request validation schemas
├── prisma/               # Prisma ORM schema & seed file
│   ├── schema.prisma     # PostgreSQL models & enums
│   └── seed.ts           # Demo database seed script
├── src/                  # React + TypeScript frontend
│   ├── components/       # Reusable UI components & layouts
│   ├── pages/            # Page components (Dashboard, Monitoring, etc.)
│   ├── services/         # Typed API client & TanStack Query hooks
│   └── types/            # TypeScript interfaces
├── .env.example          # Environment variables template
└── README.md
```

---

## Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `DATABASE_URL` is set to your PostgreSQL instance.

### 3. Prisma Database Migration & Client Generation
```bash
npx prisma generate
npx prisma db push
```

### 4. Database Seeding
Populate initial demo data:
```bash
npx tsx prisma/seed.ts
```

### 5. Running the Application
```bash
# Development server
npm run dev

# Run unit tests
npm test

# Build check & TypeScript check
npm run build
npx tsc --noEmit
```

---

## REST API Endpoints

- `GET /api/health` - API and database status
- `GET /api/sessions` - List monitoring sessions
- `POST /api/sessions` - Create monitoring session
- `GET /api/sessions/:id` - Get monitoring session
- `PATCH /api/sessions/:id` - Update monitoring session
- `DELETE /api/sessions/:id` - Delete monitoring session
- `GET /api/cameras` - List camera configurations
- `POST /api/cameras` - Create camera configuration
- `GET /api/calibrations` - List calibration profiles
- `POST /api/calibrations` - Create calibration profile
- `GET /api/speed-thresholds` - List speed threshold profiles
- `POST /api/speed-thresholds` - Create speed threshold profile
- `GET /api/detections` - List vehicle detections
- `GET /api/dashboard/stats` - Calculated aggregate dashboard statistics
- `GET /api/reports` - List saved reports

---

*Note: Authentication (Phase 4) and In-Browser Computer Vision Tracking (Phase 5) are deferred to subsequent development phases.*
