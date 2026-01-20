# Repository Guidelines

## Project Structure & Module Organization
- `code/dreambook/` — main Electron + React (Vite) application
  - `src/` — frontend (`pages/`, `components/`, `hooks/`, `styles/`, `assets/`, `shaders/`)
  - `electron/` — Electron main/preload processes
  - `backend/` — Express API for AI chat (`POST /api/dream-chat`)
  - `scripts/` — build + kiosk tooling (see Windows docs)
- `code/docs/` — internal implementation notes and integration guides.
- `desgin/` and `images/` — intentionally gitignored (large design assets).

## Build, Test, and Development Commands
Run these from `code/dreambook/`:
- `corepack enable && yarn install` — install dependencies (Yarn 4 / PnP).
- `yarn dev` — start Vite dev server (`http://localhost:5173`).
- `yarn dev:backend` — start backend dev server (`http://localhost:3000`).
- `yarn electron:dev` — run the Electron app in dev mode (frontend + backend).
- `yarn build` — TypeScript check + build frontend, backend, and Electron bundle.
- `yarn lint` — run ESLint.

Packaging:
- `yarn electron:build:mac` / `yarn electron:build:win` (see `code/dreambook/WINDOWS_BUILD.md`).

## Coding Style & Naming Conventions
- TypeScript runs in `strict` mode; keep types explicit and avoid unused locals/params.
- Match existing style: 2-space indentation, single quotes, and no semicolons.
- Components use `PascalCase` and are typically structured as `src/components/Foo/Foo.tsx` + `Foo.module.css` + `index.ts`.
- Prefer path aliases (`@/`, `@pages/`, `@components/`) defined in `code/dreambook/tsconfig.app.json`.

## Testing Guidelines
- No automated test suite is configured yet. For changes, run `yarn lint` and do a quick smoke test via `yarn electron:dev`.

## Commit & Pull Request Guidelines
- Commit subjects follow an imperative style (e.g., `Add ...`, `Remove ...`, `Exclude ...`); keep them short and scoped.
- PRs should include: what/why summary, how to test, and screenshots for UI changes. Link related issues and call out any config/env changes.

## Security & Configuration Tips
- Never commit secrets. Copy `code/dreambook/backend/.env.example` to `code/dreambook/backend/.env` and set `DEEPSEEK_API_KEY`.
- Build outputs (`dist/`, `dist-electron/`, `release/`) and design folders are gitignored; do not add them to commits.

