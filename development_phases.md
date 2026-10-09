# SpeedSight Development Phases and Future Improvement Plan

This document is the long-term engineering roadmap for autonomous and human-assisted SpeedSight development. It is a prioritization guide, not permission to make unsafe or speculative changes. Each autonomous execution must select one scoped improvement, validate it, and record the result in `.manus/speedsight-autonomous-progress.md`.

## Product principles

- SpeedSight is an operator-oriented traffic monitoring and analytics application.
- Computer-vision results and speed measurements are estimates for analytics and are **not legally certified speed enforcement**.
- Real camera/video processing should remain distinguishable from demo data.
- User data must be scoped by authenticated user and protected by secure server-managed sessions.
- Production changes must remain buildable, testable, deployable, observable, and reversible.
- Prefer small, measurable improvements over broad rewrites.

## Phase 0 — Engineering baseline and release safety

Maintain the foundation before adding capabilities:

- Keep `npm run build`, `npm test`, TypeScript checks, and Prisma validation healthy.
- Keep the Vercel Hono serverless adapter compatible with Web Request/Response semantics.
- Keep API error responses predictable and avoid leaking implementation details.
- Track production health, runtime errors, deployment state, and bundle output.
- Maintain `.manus/speedsight-autonomous-progress.md` as the source of completed work.
- Keep environment-variable and database setup documented without committing secrets.
- Add focused regression tests for every production bug fixed.

## Phase 1 — Authentication and authorization hardening

Improve account and session reliability without weakening security:

- Test registration, login, logout, current-user lookup, malformed bodies, invalid credentials, missing cookies, expired sessions, and duplicate accounts.
- Confirm cookie attributes: HTTP-only, secure in production, appropriate SameSite and path settings, and bounded lifetime.
- Ensure every protected resource is scoped to the authenticated user.
- Improve validation and safe error messages for authentication endpoints.
- Add rate limiting or abuse controls only when compatible with the deployment architecture.
- Never log passwords, session tokens, authorization headers, or database credentials.

## Phase 2 — Database and Prisma production reliability

Make PostgreSQL/Neon behavior reliable in Vercel serverless execution:

- Keep health checks bounded and dependency-aware.
- Investigate connection latency, pooling, cold starts, and intermittent timeouts.
- Prefer a serverless-compatible pooled connection string and document the required Vercel environments.
- Use migrations or a safe schema initialization process; never perform destructive production changes automatically.
- Add indexes based on observed query patterns and verify query plans before changing schema.
- Avoid N+1 queries and excessive response payloads.
- Add useful, non-sensitive error classification and monitoring.

## Phase 3 — API correctness and observability

Strengthen the Hono REST API:

- Validate every external request with Zod.
- Standardize success, validation, authentication, authorization, not-found, conflict, and server-error responses.
- Verify pagination, filtering, sorting, limits, and date-range handling.
- Preserve idempotency where retries are possible.
- Add request correlation or safe operational metadata when useful.
- Test Vercel request/response compatibility, cookies, JSON bodies, and multi-value response headers.
- Keep API health and deployment verification reproducible.

## Phase 4 — Monitoring workflow and operator UX

Improve the workflow used during a monitoring session:

- Make camera selection, permission errors, source setup, calibration, start, pause, resume, and stop states clear.
- Provide useful loading, empty, success, degraded, and error states.
- Preserve responsive desktop, tablet, and mobile behavior.
- Ensure semantic HTML, labels, keyboard access, visible focus, and sufficient contrast.
- Clearly identify real CV mode, local video mode, and demo mode.
- Avoid unnecessary animation and avoid blocking the main UI thread.
- Handle camera and object-URL cleanup reliably.

## Phase 5 — Computer vision foundation

Improve detection reliability without pretending to provide certified enforcement:

- Keep TensorFlow.js and COCO-SSD loading lazy and browser-only.
- Improve model initialization, retry, cancellation, and user-facing failure states.
- Keep detection loops throttled and avoid overlapping inference calls.
- Improve tracking stability, IoU association, stale-track cleanup, and frame timing.
- Measure confidence and preserve source metadata for auditability.
- Keep video frames local unless an explicit, documented feature requires transmission.
- Add deterministic tests around filtering, tracking, and lifecycle behavior.

## Phase 6 — Calibration and speed-estimation accuracy

Build transparent, testable estimation workflows:

- Make calibration inputs explicit, validated, and persisted per authorized user/profile.
- Support known-distance and perspective-related configuration with clear units.
- Separate pixel movement, elapsed time, calibration ratio, smoothing, and unit conversion into pure functions.
- Handle dropped frames, low confidence, occlusion, camera movement, and insufficient calibration data.
- Show uncertainty or pending states instead of inventing speed values.
- Store the inputs and method needed to audit an estimate.
- Preserve the non-certified measurement disclaimer everywhere estimates are shown.

## Phase 7 — Detection review, sessions, and audit history

Make recorded monitoring data useful:

- Improve session lifecycle, naming, timestamps, status, and ownership.
- Provide detection filtering by session, vehicle type, classification, confidence, time range, and speed status.
- Support review states and clear distinction between observed data and derived estimates.
- Keep deletion and retention behavior explicit and authorized.
- Improve empty states and pagination for large histories.
- Preserve enough audit context for reproducible analysis without storing unnecessary video.

## Phase 8 — Analytics and reporting

Improve operational reporting:

- Make dashboard aggregates correct, scoped, and performant.
- Add transparent definitions for counts, averages, percentiles, threshold violations, and confidence.
- Ensure charts and tables are accessible and usable on small screens.
- Make report generation deterministic and resilient to missing data.
- Include calibration/profile/session context and methodology disclaimers.
- Add export formats only with clear privacy and authorization boundaries.

## Phase 9 — Performance and scalability

Reduce user-visible latency and operational cost:

- Continue route-level code splitting and lazy loading for heavy pages and libraries.
- Track initial JavaScript, asynchronous chunks, CSS, and image sizes.
- Avoid unnecessary React renders and repeated network requests.
- Use caching only when invalidation and authorization are safe.
- Keep serverless functions short-lived and database access bounded.
- Benchmark before and after meaningful performance changes.

## Phase 10 — Quality, accessibility, and developer experience

Improve maintainability and confidence:

- Add tests for high-risk workflows and regressions rather than chasing arbitrary coverage.
- Keep components and services focused and typed.
- Improve README setup, deployment, troubleshooting, and architecture notes.
- Maintain consistent scripts and local development instructions.
- Review dependencies periodically for compatibility, security, and bundle impact.
- Keep changes easy to review, revert, and deploy.

## Autonomous prioritization rules

At the start of every run:

1. Read `auto_dev_prompt.md`, this file, the progress log, README, recent commits, open pull requests, and current deployment/runtime evidence.
2. Compare candidate work against completed improvements and do not repeat it.
3. Prefer a production issue with direct evidence over a speculative feature.
4. Select exactly one primary improvement with a clear success criterion.
5. If a required secret, permission, migration, or external approval is missing, document the blocker and choose a safe independent improvement when possible.
6. Update the progress log even when the chosen work is documentation or maintenance.

## Candidate backlog after the current baseline

These are examples, not a requirement to execute them in order:

1. Diagnose intermittent Neon/Prisma health-check timeouts and verify pooled connection behavior.
2. Add route-level code splitting for non-monitoring pages and measure the resulting initial bundle.
3. Add production-safe authentication endpoint regression coverage.
4. Prevent overlapping detection inferences and add lifecycle tests.
5. Improve monitoring loading/error states and keyboard accessibility.
6. Add transparent calibration and speed-estimation audit metadata.
7. Improve dashboard query performance and pagination for detection history.
