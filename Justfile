set shell := ["powershell.exe", "-NoProfile", "-Command"]

default:
    just --list

dev:
    pnpm --dir frontend tauri dev

build:
    pnpm --dir frontend tauri build

frontend-dev:
    pnpm --dir frontend dev

frontend-build:
    pnpm --dir frontend build

fmt:
    pnpm --dir frontend fmt
    cargo fmt --manifest-path backend/Cargo.toml

lint:
    pnpm --dir frontend lint
    cargo clippy --manifest-path backend/Cargo.toml --all-targets --all-features -- -D warnings

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

tauri-build:
    pnpm --dir frontend tauri build --no-bundle

validate: fmt lint typecheck test
