# moa

Windows で動作する出納帳ソフトです。

まずは買掛・売掛管理を優先して実装し、取引先別・月次・事業年度・種別ごとの表示、CSV 出力、印刷に対応していく予定です。

## 技術スタック

- Tauri v2
- Rust
- React + TypeScript + Vite
- SQLite
- pnpm
- just
- mise

## ディレクトリ構成

```text
backend/   Tauri / Rust 側
frontend/  React / TypeScript 側
```

要件と実装順は以下にあります。

- `requirements.md`
- `tasks.md`

## セットアップ

mise を有効にして、必要なツールをインストールします。

```bash
mise install
```

依存関係を解決します。

```bash
just refresh
```

Playwright のブラウザをインストールします。

```bash
pnpm --dir frontend exec playwright install chromium
```

## 開発

Tauri アプリとして起動します。

```bash
just dev
```

Vite dev server だけで起動したい場合は次を使います。

```bash
just frontend-dev
```

## よく使うコマンド

```bash
just validate       # format, lint, typecheck, test
just ci             # refresh, validate, build
just test-e2e       # Playwright E2E
just storybook      # Storybook 起動
just build          # Tauri build
```
