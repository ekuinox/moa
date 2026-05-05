set shell := ["powershell.exe", "-NoProfile", "-Command"]

default:
    just --list

refresh:
    pnpm --dir frontend install --frozen-lockfile
    cargo fetch --manifest-path backend/Cargo.toml

dev:
    pnpm --dir frontend tauri dev

build:
    pnpm --dir frontend tauri build

frontend-dev:
    pnpm --dir frontend dev

fmt:
    pnpm --dir frontend fmt
    cargo fmt --manifest-path backend/Cargo.toml

lint:
    pnpm --dir frontend lint
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

validate: fmt lint deny typecheck test

ci: refresh validate deny build
