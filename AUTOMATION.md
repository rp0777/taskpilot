# TaskPilot — Automation Flow

This document describes how GitHub Issues flow from creation to deployment on the Dev environment, and how Claude Code agents are used to automate the entire software development lifecycle.

---

## Overview

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│  Create      │     │  Agent       │     │  PR Created  │     │  Merge to   │     │  Deployed    │
│  Issue       │────▶│  Picks Up    │────▶│  & Reviewed  │────▶│  dev        │────▶│  to Dev      │
│  (GitHub)    │     │  (Claude)    │     │  (GitHub)    │     │  (GitHub)   │     │  (Cloud Run) │
└─────────────┘     └─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘
```

---

## Step-by-Step Flow

### 1. Issue Creation

Issues are created using GitHub Issue Templates in the repository:

| Template | Labels | Purpose |
|----------|--------|---------|
| **Bug Report** | `bug`, `agent:qa` | Report bugs with severity and affected area |
| **Feature Request** | `enhancement`, `agent:dev` | Propose new features with acceptance criteria |
| **Task** | `task`, `agent:dev` | General development tasks |

Issues are added to the **TaskPilot** GitHub Project Board (https://github.com/users/rp0777/projects/1) and assigned:
- **Status**: Todo → In Progress → Done
- **Sprint**: Sprint 1, Sprint 2, Sprint 3, or Backlog
- **Priority**: Critical, High, Medium, Low
- **Type**: Feature, Bug Fix, Chore, Refactor, Hotfix

### 2. Agent Picks Up the Issue

When instructed (e.g., "Pick up issue #9"), the Claude Code agent:

1. **Reads the issue** — fetches title, body, labels, and acceptance criteria via `gh issue view`
2. **Updates the project board** — sets Status to "In Progress"
3. **Creates a branch from `dev`** using the naming convention:

```
feature/<issue-number>-<short-description>   # New features
fix/<issue-number>-<short-description>       # Bug fixes
chore/<issue-number>-<short-description>     # Maintenance tasks
refactor/<issue-number>-<short-description>  # Code refactoring
hotfix/<issue-number>-<short-description>    # Urgent production fixes
```

### 3. Agent Implements the Changes

The agent:

1. **Reads existing code** to understand the codebase context
2. **Implements the changes** according to the issue's acceptance criteria
3. **Verifies the build passes** — runs `next build` or `nest build`
4. **Commits with a conventional message** that includes `Closes #<issue-number>`

```
feat: add dark mode toggle with system preference detection

- ThemeProvider with context, localStorage persistence, and system
  preference detection
- Moon/Sun toggle button in header
- All components styled with Tailwind dark: variant

Closes #9

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

### 4. PR Created and Pushed

The agent:

1. **Pushes the branch** to the remote repository
2. **Creates a Pull Request** targeting `dev` with:
   - Descriptive title
   - Summary of changes
   - Type and area checkboxes
   - Testing notes
   - Checklist (build, tests, lint)
   - `Closes #<issue-number>` to auto-close the issue on merge

### 5. Merge to Dev

The PR is merged to `dev` (either by the agent or after human review). This triggers the **Deploy to Dev** GitHub Actions workflow.

### 6. Automated Deployment to Dev

The `deploy-dev.yml` workflow runs automatically on push to `dev`:

```
Push to dev
    │
    ▼
┌─────────────────────────────────┐
│  Deploy API to Dev              │
│  ┌───────────────────────────┐  │
│  │ 1. Checkout code          │  │
│  │ 2. Auth to GCP            │  │
│  │ 3. Build Docker image     │  │
│  │ 4. Push to Artifact Reg.  │  │
│  │ 5. Deploy to Cloud Run    │  │
│  │ 6. Get API URL            │  │
│  └───────────────────────────┘  │
└────────────────┬────────────────┘
                 │ API URL
                 ▼
┌─────────────────────────────────┐
│  Deploy Web to Dev              │
│  ┌───────────────────────────┐  │
│  │ 1. Checkout code          │  │
│  │ 2. Auth to GCP            │  │
│  │ 3. Build Docker image     │  │
│  │    (with API URL as arg)  │  │
│  │ 4. Push to Artifact Reg.  │  │
│  │ 5. Deploy to Cloud Run    │  │
│  └───────────────────────────┘  │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│  Tag deployment as dev-<sha>    │
└─────────────────────────────────┘
```

**Dev Environment URLs:**
- Frontend: `https://taskpilot-web-dev-k2ah5vchcq-el.a.run.app`
- Backend API: `https://taskpilot-api-dev-k2ah5vchcq-el.a.run.app`
- Swagger Docs: `https://taskpilot-api-dev-k2ah5vchcq-el.a.run.app/api/docs`

### 7. Human Review and Issue Closure

After deployment to dev:

1. **User verifies** the changes on the dev environment
2. **User closes the issue** if everything looks good
3. **Project board** is updated to "Done"

### 8. Production Deployment (Optional)

When ready to promote to production:

1. Create a PR from `dev` → `main`
2. Merge triggers `deploy-prod.yml` which:
   - Builds and deploys to production Cloud Run services (`min-instances=1`)
   - Creates a GitHub Release with version tag `v<date>-<sha>`

---

## Agent Roles

| Agent Label | Role | Automation |
|-------------|------|------------|
| `agent:dev` | Development | Implements features, fixes bugs, writes code |
| `agent:qa` | QA Testing | Verifies bugs, writes tests, validates fixes |
| `agent:deploy` | Deployment | Manages CI/CD, infrastructure, Docker configs |
| `agent:pm` | Project Management | Triages issues, manages sprints, tracks progress |

---

## Infrastructure

```
┌──────────────────────────────────────────────────────┐
│                    GitHub                             │
│  ┌─────────┐  ┌──────────┐  ┌────────────────────┐  │
│  │ Issues   │  │ Project  │  │ Actions (CI/CD)    │  │
│  │ & PRs    │  │ Board    │  │ - ci.yml           │  │
│  │          │  │          │  │ - deploy-dev.yml   │  │
│  │          │  │          │  │ - deploy-prod.yml  │  │
│  └─────────┘  └──────────┘  └────────────────────┘  │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│                Google Cloud Platform                  │
│  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │ Artifact Registry │  │ Cloud Run                │  │
│  │ (Docker images)   │  │ ┌────────────────────┐  │  │
│  │                   │  │ │ taskpilot-api-dev   │  │  │
│  │ api-dev:sha       │  │ │ taskpilot-web-dev   │  │  │
│  │ web-dev:sha       │  │ │ taskpilot-api-prod  │  │  │
│  │ api-prod:sha      │  │ │ taskpilot-web-prod  │  │  │
│  │ web-prod:sha      │  │ └────────────────────┘  │  │
│  └──────────────────┘  └──────────────────────────┘  │
└──────────────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│                    Supabase                           │
│  ┌──────────────────────────────────────────────┐    │
│  │ PostgreSQL Database                           │    │
│  │ Tables: Board, Column, Task                   │    │
│  └──────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

---

## Quick Reference

**To trigger this flow:**
1. Create an issue using a template at https://github.com/rp0777/taskpilot/issues/new/choose
2. Add it to the TaskPilot project board
3. Tell the Claude Code agent: "Pick up issue #<number>"
4. The agent handles everything from branch to deployed PR
5. Review on dev, close the issue when satisfied
