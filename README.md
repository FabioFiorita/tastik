[![CI/CD](https://github.com/FabioFiorita/tastik/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/FabioFiorita/tastik/actions/workflows/ci-cd.yml)
[![Playwright E2E](https://github.com/FabioFiorita/tastik/actions/workflows/playwright.yml/badge.svg)](https://github.com/FabioFiorita/tastik/actions/workflows/playwright.yml)

# Tastik

Lists without deadlines.

Tastik is a quiet companion app for people who want lightweight organization without turning every list into a project plan. It supports simple checklists, steppers, calculators, kanban boards, and mixed-item lists, then layers in real-time sync, collaboration, privacy-conscious sharing, and strong account security.

This repository is also a portfolio project. It is meant to show full-stack ownership across product design, frontend architecture, backend modeling, testing strategy, deployment, observability, and modern AI-assisted development workflows.

## Why This Project Matters

I built Tastik to demonstrate more than feature delivery:

- Product thinking: a clear opinionated scope, not a generic CRUD demo.
- Full-stack execution: React 19 + TanStack Start on Cloudflare Workers, backed by Convex and Better Auth.
- Frontend craft: reusable components, mobile-first responsive layouts, and a distinctive UI instead of boilerplate dashboards.
- Maintainability: business logic pushed into hooks, typed boundaries, testable abstractions, and codified repo conventions.
- Operational discipline: CI/CD, observability, E2E coverage, and an agent-friendly development system designed to scale with AI tools.

## Feature Highlights

- Five list types: `simple`, `stepper`, `calculator`, `kanban`, and `multi`.
- Real-time sync across sessions through Convex reactive queries.
- Collaboration with privacy-first nicknames instead of exposing more identity data than necessary.
- Tags, filtering, archive/restore flows, list duplication, and export support.
- Account management with profile image upload, change email, passkeys, and two-factor authentication.
- Public support, privacy, and terms pages shipped as part of the product surface.

## Technical Architecture

### Stack

- React 19
- TanStack Start
- TanStack Router + TanStack Query
- Convex
- Better Auth
- Cloudflare Workers + Wrangler
- Resend
- Sentry
- Bun
- Biome
- Vitest
- Playwright

### Repository Shape

This is the current repository structure, not a monorepo placeholder:

```text
.
├── src/                 # TanStack Start app, routes, components, hooks
├── convex/              # Backend functions, schema, auth, tests
├── e2e/                 # Playwright end-to-end coverage
├── .github/workflows/   # CI/CD and scheduled Playwright workflows
├── scripts/             # Deploy and repo maintenance scripts
└── .agents/             # Agent instructions, reusable skills, command docs
```

## Engineering Quality

One of the main design goals in this codebase is keeping UI components thin and pushing business logic into hooks that are easier to test and mock.

For example, [src/hooks/account/use-passkey-management.ts](src/hooks/account/use-passkey-management.ts) wraps passkey creation, rename, deletion, local editing state, pending state, and toast/error handling behind a small interface consumed by the account dialog. The component renders UI; the hook owns the workflow.

That same boundary shows up across the app:

- Query hooks under `src/hooks/queries/` expose only the data the UI needs instead of leaking raw query results.
- Action hooks under `src/hooks/actions/` wrap mutations with loading state, navigation, metrics, and error handling.
- Convex-backed types are inferred from schema validators instead of duplicated across the frontend.
- Repo instructions in [AGENTS.md](AGENTS.md) explicitly enforce these patterns so they stay consistent over time.

This matters because it makes components easier to reason about, tests easier to write, and future changes safer. It also makes AI-assisted edits more reliable, because the repo has clear architectural seams instead of hidden side effects scattered through JSX.

## Testing And Quality Gates

The repository uses a layered test strategy:

- Unit tests for hooks, utilities, validators, and component behavior.
- Convex backend tests for queries, mutations, permissions, limits, and data workflows.
- Playwright E2E tests for public and authenticated user flows against a deployed environment.

The latest local `bun test:coverage` run produced:

- `268` passing tests
- `91.15%` line coverage
- `91.28%` function coverage
- `90.9%` statement coverage
- `80.49%` branch coverage

Coverage is enforced in [vitest.config.ts](vitest.config.ts) with `80%` thresholds for lines, functions, branches, and statements.

Playwright coverage currently exercises real flows such as:

- Public navigation and auth guards
- Authenticated app shell behavior
- List lifecycle flows
- Item flows across all list types
- Tags and preference management

## CI/CD

Current automation is intentionally documented as it exists today:

- [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml) runs on push to `main` and `development`.
- The CI job runs `bun typecheck`, `bun check`, and `bun test:once`.
- After CI passes, the deploy job builds the app and deploys it to Cloudflare Workers.
- [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml) runs Playwright separately on a weekly schedule against a configured deployed environment.

This means E2E is part of the engineering system, but it is not currently configured as a merge gate. The README reflects that on purpose.

## Agentic Development

Tastik is designed to work well with AI coding agents, but in a constrained, reviewable way.

The repo contains a real agent operating model:

- [AGENTS.md](AGENTS.md) defines repo-wide rules, architecture conventions, testing expectations, and workflow constraints.
- `.agents/skills/` contains reusable, task-specific knowledge packs for domains like Convex, testing, frontend design, auth, Cloudflare, email, and subscription architecture.
- `.agents/commands/` documents repeatable agent workflows such as capturing mistakes and reviewing folders.
- [scripts/sync-skill-symlinks.sh](scripts/sync-skill-symlinks.sh) mirrors skills only for Claude, while Codex and Cursor can read directly from `.agents/skills`.
- [`.husky/pre-commit`](.husky/pre-commit) runs the sync step before checks so the shared agent context does not drift.

This is the important part: the AI workflow is codified as part of the repository, not treated as invisible prompt magic. The repo distinguishes between:

- Stable rules in `AGENTS.md`
- Deep reference material in reusable skills
- Repeatable commands for review and correction loops

That separation makes agent output more predictable and turns AI tooling into part of the engineering process rather than a side channel.

## Skills Showcase

Representative skills in this repo highlight how I approach modern agent-assisted development:

- `tastik-knowledge`: product and domain context for the app so agents understand behavior before editing code.
- `convex-guidelines`: backend conventions, validators, schema patterns, and function structure for safe Convex changes.
- `testing-setup`: project-specific test patterns, mocks, and utilities so new tests match the existing testing system.
- `frontend-design`: stronger UI direction than default component-library output.
- `workers-best-practices`: Cloudflare-specific guardrails for production runtime concerns.
- `stripe-subscription`: an example of capturing a future integration as reusable implementation knowledge instead of burying it in ad-hoc notes.

For me, this is part of the portfolio story too: knowing how to work effectively with agents now includes designing the environment they operate in.

## Local Development

### Requirements

- Bun
- A Convex deployment
- Cloudflare account access for deploys
- Environment variables for auth, app URLs, and optional integrations

### Key Environment Variables

Frontend runtime validation expects:

- `VITE_CONVEX_URL`
- `VITE_CONVEX_SITE_URL`
- `VITE_SENTRY_DSN` (optional)

The auth backend also relies on server-side values such as:

- `SITE_URL`
- `BETTER_AUTH_TRUSTED_ORIGINS`
- `BETTER_AUTH_SECRET`
- provider credentials for optional social login

### Common Commands

```bash
# install
bun install

# local dev
bun dev

# type safety
bun typecheck

# lint + formatting checks
bun check
bun check:write

# tests
bun test:unit
bun test:convex
bun test:coverage
bun test:e2e

# build
bun build

# deploy workers
bun deploy
bun deploy:dev
```

### Deployment Scripts

- [scripts/deploy-worker.sh](scripts/deploy-worker.sh) deploys the web app to Cloudflare Workers.
- [scripts/deploy-convex-and-merge.sh](scripts/deploy-convex-and-merge.sh) documents a simple Convex deploy + branch merge workflow used for this project.

## Extensibility

### Adding Stripe Subscriptions

This app is open source and intentionally structured to support future paid features without rewriting the architecture.

To add subscriptions:

1. Use the `stripe-subscription` skill in your AI assistant.
2. Follow the documented flow for checkout, billing portal, paywall handling, and Convex integration.
3. Adapt the starter implementation to this repo's existing hook patterns, auth boundaries, and backend conventions.

Keeping this as a skill instead of a loose note is deliberate: recurring implementation knowledge belongs in reusable agent tooling.

## Open Source

Tastik is being prepared as a public repository both as a usable product and as a reference implementation for modern full-stack web development.

If you are reading the code to evaluate code quality, the places I would start are:

- `src/hooks/`
- `convex/`
- `e2e/`
- `.agents/`
- `.github/workflows/`

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
