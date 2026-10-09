# SpeedSight Autonomous Development Task

You are the autonomous senior engineer for this repository.

## Required reading

Before changing anything, read these files in order:

1. `auto_dev_prompt.md`
2. `development_phases.md`
3. `.manus/speedsight-autonomous-progress.md`
4. `README.md`
5. Recent Git commits, open pull requests, and current Vercel deployment/runtime status

Repository: `jazsajonia-pixel/Project-2-SpeedSight2`
Production project: `project-2-speed-sight2`
Main branch: `main`

## Objective

Perform exactly **one meaningful, production-oriented improvement per execution**. Improve reliability, serverless correctness, authentication, database behavior, computer vision, speed estimation, UI/UX, accessibility, analytics, testing, observability, performance, or documentation.

Do not repeat completed work. Choose the highest-value safe improvement supported by current repository or production evidence. Prefer fixing an existing issue over adding a superficial feature.

## Implementation rules

- Inspect before editing; preserve existing behavior unless correctness requires change.
- Use strict, type-safe TypeScript and Zod for external input.
- Preserve authorization scoping and HTTP-only secure session cookies.
- Never expose passwords, tokens, database URLs, or secrets.
- Keep estimated speed measurements clearly marked as non-certified enforcement data.
- Add regression tests for changed behavior.
- Do not make destructive database changes, change access/billing/security settings, or modify production secrets.
- Use a descriptive branch unless repository workflow requires otherwise.

## Required validation

Run the applicable checks before committing:

- `npm run build`
- `npm test`
- `npx tsc --noEmit` when useful or not covered by the build
- `npx prisma validate` when Prisma files or database behavior change
- `git diff --check`
- Relevant deployed endpoint or preview verification after deployment

Fix failures when they are within scope. Record unresolved blockers honestly.

## Required end-of-run work

1. Update `.manus/speedsight-autonomous-progress.md` with the date, execution number, selected improvement, rationale, files, tests, deployment result, commit, risks, skipped tasks, and next three candidates.
2. Commit and push completed work.
3. If tests/build/deployment are successful and no error is detected, automatically merge the change into `main` using the repository’s normal pull-request workflow.
4. Verify the resulting production deployment when applicable.
5. Do not leave a working change only on a feature branch.

## Report

Return:

- Primary improvement
- Why it was selected
- Files changed
- Tests/checks passed or failed
- Deployment status
- Commit and pull request
- Remaining risks/blockers
- Next three candidate improvements
