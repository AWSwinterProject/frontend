# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CoreON Frontend — a vanilla HTML/CSS/JavaScript intranet application (no framework, no bundler, no npm). It's a multi-page application where each feature is a separate HTML file with inline `<script>` tags.

## Development

There is no build system. To develop locally, serve the files with any static file server (or open HTML files directly). Production deployment uses Docker with nginx:

```bash
docker build -t coreon-front .
```

CI/CD runs via GitHub Actions (`.github/workflows/ci.yaml`): pushes to `main` build a Docker image and push it to AWS ECR (`ap-northeast-2`, repo `coreon-front`).

## Architecture

### Backend Microservices

The frontend talks to multiple backend services on different ports:

| Service | Port | Base Path |
|---------|------|-----------|
| Auth | 8080 | `/api/auth` |
| Member | 8081 | `/api/member` |
| Notice | 8082 | `/api/notice` |
| Board | 8085 | `/api/board` |
| FAQ | (proxied) | `/api/faq` |

All API calls use `fetch()` with `credentials: "include"` for session cookie auth.

### Page/Module Structure

- `auth/` — Login, registration, logout
- `main/` — Post-login dashboard, shared header component
- `board/` — Posts CRUD, attachments, notices (with search/filter)
- `member/` — User profile editing
- `faq/` — FAQ chat interface
- `assets/` — Shared JS utilities (`app-header.js` for header loading/session, `edit-member.js`)

### Key Patterns

- **Header injection**: `assets/app-header.js` dynamically fetches `/main/header.html` and injects it, then populates user session info.
- **Session state**: User data stored in `sessionStorage` (username, id). No client-side state library.
- **URL params**: Page-to-page data passing uses query parameters (e.g., `detail.html?id=<boardId>`).
- **Inline styles**: CSS is duplicated per page using CSS custom properties (`--primary`, `--bg`, `--surface`, etc.). No shared stylesheet.
- **Helper in board/detail**: A `fetchJson()` wrapper handles JSON parsing with error recovery — other pages use raw `fetch()`.

### Auth Flow

`index.html` → `auth/login.html` → `main/loginmain.html` (authenticated)
Logout clears `sessionStorage` and calls `/api/auth/logout`.

### Design Tokens (CSS Variables)

```
--primary: #1f4bd8   --bg: #f5f7fb      --surface: #ffffff
--text: #1f2937      --muted: #6b7280   --line: #e5e7eb
--radius: 14px       --ok: #166534      --warn: #b45309
```

Font: system stack with `"Noto Sans KR"` for Korean support.
