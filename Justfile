set shell := ["powershell.exe", "-NoProfile", "-Command"]

default:
    just --list

refresh:
    pnpm --dir frontend install --frozen-lockfile
    cargo fetch --manifest-path backend/Cargo.toml
    cargo run --manifest-path backend/Cargo.toml --bin export_bindings -- frontend/src/lib/api/bindings.generated.ts

dev:
    pnpm --dir frontend tauri dev

build:
    pnpm --dir frontend tauri build

frontend-dev:
    pnpm --dir frontend dev

fmt:
    biome format --write frontend
    cargo fmt --manifest-path backend/Cargo.toml

lint:
    biome check frontend
    cargo clippy --manifest-path backend/Cargo.toml --all-targets --all-features -- -D warnings

deny:
    pnpm --dir frontend audit
    cargo deny --manifest-path backend/Cargo.toml check

typecheck:
    pnpm --dir frontend typecheck

test:
    pnpm --dir frontend test
    cargo test --manifest-path backend/Cargo.toml

storybook:
    pnpm --dir frontend storybook

build-storybook:
    pnpm --dir frontend build-storybook

test-e2e:
    pnpm --dir frontend test:e2e

tauri-info:
    pnpm --dir frontend tauri info

db-drop:
    $db = Join-Path $env:APPDATA "dev.ekuinox.moa\moa.sqlite3"; if (Test-Path $db) { sqlx database drop -y --database-url "sqlite:///$($db.Replace('\', '/'))" } else { Write-Output "Database not found: $db" }

validate: fmt lint deny typecheck test

ci: refresh validate deny build
