# TaskPilot Web

Next.js 14 frontend for TaskPilot.

## Stack
- Next.js 14 (App Router)
- Tailwind CSS
- @dnd-kit for drag-and-drop
- Axios for API calls

## Commands
```bash
npm run dev     # Start dev server on port 3000
npm run build   # Production build
npm run lint    # Run ESLint
```

## Pages
- `/` — Board list (home page)
- `/board/[id]` — Kanban board view

## Components
- `BoardList` — Grid of board cards
- `KanbanBoard` — Main board with drag-and-drop columns
- `KanbanColumn` — Single column with tasks
- `TaskCard` — Individual task card
- `TaskModal` — Create/edit task dialog
- `CreateBoardModal` — New board dialog

## API
All API calls go through `src/lib/api.ts`. The API base URL is set via `NEXT_PUBLIC_API_URL`.
