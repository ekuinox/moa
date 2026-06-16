# moa

Windows で動作する出納帳ソフトです。

現在はプロトタイプリリースに向けて、買掛・売掛管理を中心に実装しています。取引先・種別・事業年度設定、買掛・売掛明細の登録、年度 / 月次 / 取引先 / 種別フィルタ表示、CSV 出力、印刷に対応しています。

出納帳機能は今後追加予定です。実装予定や進捗は GitHub Issues / Pull Requests で管理します。

## 技術スタック

- Tauri v2
- Rust
- React + TypeScript + Vite
- SQLite + sqlx
- SWR
- pnpm
- just
- mise

## ディレクトリ構成

```text
backend/   Tauri / Rust 側
frontend/  React / TypeScript 側
```

関連ドキュメント:

- `requirements.md`: 要件、技術方針、設計判断
- `CONTRIBUTING.md`: 開発ルール、チェック、コーディング規約
- GitHub Issues / Pull Requests: 実装予定と進捗

## WSL (Ubuntu) での追加準備

WSL2 (Ubuntu) 上で開発する場合は、下記「セットアップ」の前に Linux 側へ Tauri のシステム依存ライブラリを導入します。

```bash
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.1-dev build-essential curl wget file \
  libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev pkg-config
```

> Ubuntu 22.04 など古い環境では `libwebkit2gtk-4.1-dev` の代わりに `libwebkit2gtk-4.0-dev` を使います。

アプリ内の日本語が豆腐（□）になる場合は、日本語フォントを導入します。

```bash
sudo apt install -y fonts-noto-cjk fonts-noto-color-emoji
```

この後、続けて下記「セットアップ」（`mise install` 〜）を実施します。

## セットアップ

mise を有効にして、必要なツールをインストールします。

```bash
mise install
```

依存関係を解決し、Tauri command の TypeScript binding を生成します。

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

Vite dev server だけで起動したい場合は次を使います。Tauri command の代わりに mock / in-memory API が使われます。

```bash
just frontend-dev
```

開発用 SQLite は既定で `.dev/moa.sqlite3` を使います。seed データを入れ直す場合は次を使います。

```bash
just db-drop
just db-seed
```

## よく使うコマンド

```bash
just refresh       # dependencies install / cargo fetch / binding generation
just validate      # format, lint, deny, typecheck, test
just ci            # refresh, validate
just deny          # pnpm audit / cargo-deny
just test-e2e      # Playwright E2E
just storybook     # Storybook 起動
just build         # Tauri build
```

## デバッグ情報

設定タブには、調査用に以下の情報を表示します。

- バージョン
- コミットハッシュ
- ビルド日時
- DB パス

コミットハッシュは `MOA_COMMIT_HASH`、`GITHUB_SHA`、`git rev-parse --short HEAD` の順に解決します。
