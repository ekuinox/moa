# Agent Instructions

## Start Here

- Read `requirements.md` before making product or architecture changes.
- Read `tasks.md` before choosing the next implementation step.
- Use `CONTRIBUTING.md` for detailed development rules.

## Documentation

- Update `requirements.md` when requirements, technical decisions, or database design change.
- Update `tasks.md` when implementation progress changes.
- Keep completed tasks checked with `- [x]`.
- Split large design notes into `docs/` when the single requirements file becomes hard to review.

## Architecture

- The Tauri Rust project directory is `backend`, not `src-tauri`.
- Follow the Clean Architecture direction documented in `requirements.md`.
- Keep domain and application logic independent from Tauri, SQLite, and sqlx.
- Do not put business rules directly in Tauri commands, SQL, or React components.
- Application use cases should depend on repository traits so tests can inject mock or in-memory implementations.
- Keep the app usable in Vite dev mode without starting Tauri where practical.

## Frontend

- Use React + TypeScript + Vite.
- Use shadcn/ui + Tailwind CSS for UI.
- Use SWR for server state.
- Route data access through `frontend/src/lib/api` or equivalent.
- Do not call generated Tauri bindings directly from React components.
- Keep Storybook, Vitest, and Playwright able to run against the Vite dev experience where practical.

## Backend

- Use Rust with the toolchain pinned by `rust-toolchain.toml`.
- Use SQLite through `sqlx`.
- Keep migrations under `backend/migrations`.
- Run migrations on application startup.
- Prefer explicit SQL for queries and reports.

## Checks

- Use Justfile tasks once they are available.
- Before committing, run the relevant checks for touched code.
- For documentation-only changes, review the rendered Markdown mentally and keep links accurate.

## Commits

- Always include a `Co-authored-by` trailer in commit messages.
- Set the value to match the coding agent you are using.

```text
Co-authored-by: Codex <codex@openai.com>
Co-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```
