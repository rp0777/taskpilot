# TaskPilot

A Kanban task management app built with Next.js + Nest.js + Supabase.

## Project Structure

- `apps/web` — Next.js 14 frontend (App Router, Tailwind CSS)
- `apps/api` — Nest.js backend (REST API, Prisma ORM)
- `packages/shared` — Shared types and utilities

## Development

```bash
npm install          # Install all dependencies
npm run dev          # Start both apps (turbo)
npm run build        # Build both apps
npm run db:migrate   # Run Prisma migrations
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
```

## Database

- PostgreSQL via Supabase
- ORM: Prisma (schema at `apps/api/prisma/schema.prisma`)

## API Documentation

Swagger UI available at http://localhost:4000/api/docs when running the API.

## Branches

- `main` — Production branch. Only merge via PR with passing CI.
- `dev` — Development branch. Feature branches merge here first.

## Agent Workflows

This project uses Claude Code agents for automation:
- **agent:dev** — Development tasks, feature implementation
- **agent:qa** — Testing, bug verification, test writing
- **agent:deploy** — Deployment and infrastructure
- **agent:pm** — Project management, issue triage

### Agent Labels
- Issues labeled `agent:dev` are picked up by development agents
- Issues labeled `agent:qa` trigger QA testing workflows
- PRs require CI to pass before merge
