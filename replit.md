# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Project: ስለ ልጅሽ – Selelgesh

A smart child health and digital wellbeing companion app for Ethiopian parents.

### Artifacts

- **selelgesh** (react-vite) — Main web app at `/`
- **api-server** — Express 5 REST API at `/api`

### Features

1. **Authentication** — JWT-based login/register for parents
2. **Dashboard** — Overview of child health with summary stats
3. **Nutrition** — Ethiopian food meal plans (Amharic + English) by age group
4. **Vaccination Tracker** — Ethiopian EPI schedule, completion tracking
5. **Growth Tracker** — Height/weight records with line chart visualization
6. **Screen Time Monitor** — Daily logging with weekly summary
7. **Tips & Guidance** — Parenting tips in Amharic + English
8. **SMS Support** — Simulated SMS reminder system (logged to DB)

### Brand

- Primary: Orange (#F97316)
- Background: Dark charcoal/black
- Typography: Supports Amharic + English

### DB Tables

- `users` — Parent accounts
- `children` — Child profiles (linked to users)
- `nutrition_tips` — Ethiopian foods by age group and meal type
- `vaccinations` — Child vaccination records
- `growth_records` — Height/weight measurements over time
- `screen_time` — Daily screen time logs
- `parenting_tips` — Tips in Amharic + English
- `sms_logs` — Simulated SMS reminder logs

### Auth

Token stored in localStorage as `selelgesh_token`. Simple base64 JWT-like token for demo purposes.
