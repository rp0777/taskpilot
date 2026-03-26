# TaskPilot API

Nest.js REST API for TaskPilot.

## Stack
- Nest.js with TypeScript
- Prisma ORM with PostgreSQL (Supabase)
- Swagger for API docs

## Commands
```bash
npm run start:dev    # Start in watch mode
npm run build        # Build for production
npm run test         # Run unit tests
npm run test:e2e     # Run e2e tests
npx prisma studio    # Open Prisma Studio
npx prisma db push   # Push schema changes
```

## API Endpoints
- `GET/POST /boards` — List/create boards
- `GET/PATCH/DELETE /boards/:id` — Board CRUD
- `GET/POST /columns` — List/create columns
- `PATCH/DELETE /columns/:id` — Column CRUD
- `GET/POST /tasks` — List/create tasks
- `PATCH/DELETE /tasks/:id` — Task CRUD
- `PATCH /tasks/:id/move` — Move task between columns

## Database Schema
See `prisma/schema.prisma` for the full schema. Key models: Board, Column, Task.
