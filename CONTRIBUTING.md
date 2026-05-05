# Development Rules

## 開発の進め方

- 要件や設計判断が変わったら `requirements.md` を更新する。
- 実装順や作業状況は `tasks.md` を更新する。
- 完了したタスクは `tasks.md` のチェックを入れる。
- DB 設計やアーキテクチャの詳細は、実装が進んだら `docs/` へ分割する。

## コミット前のチェック

コミットを作成する前に、できるだけ以下を実行してください。

```bash
just refresh
just fmt
just lint
just deny
just typecheck
just test
cargo fmt --check
cargo clippy
cargo test
```

コミットメッセージには必ず `Co-authored-by` trailer を付けてください。

```text
Co-authored-by: Codex <codex@openai.com>
```

プロジェクト整備後は、まとめて実行できるタスクを用意します。

```bash
just validate
```

`just validate` には以下を含める想定です。

- フロントエンドの format チェック
- フロントエンドの lint
- TypeScript 型チェック
- Vitest
- Rust format チェック
- Rust clippy
- Rust test

CI と同じ確認を行う場合は以下を実行してください。

```bash
just ci
```

## プッシュ前のチェック

プッシュ前には、通常のチェックに加えて E2E も実行してください。

```bash
just test-e2e
```

Storybook を触った場合は、Storybook の起動確認も行ってください。

```bash
just storybook
```

## ツール管理

- フロントエンド側のツールは `mise.toml` で管理する。
- 標準タスクは `Justfile` で管理する。
- Rust toolchain は `rust-toolchain.toml` で固定する。
- パッケージマネージャーは pnpm を使う。
- Node.js / pnpm のバージョンを変更した場合は `requirements.md` も確認する。

## 依存の管理

- 新しい依存を追加する際は、できるだけ最新の安定版を確認する。
- 依存を追加する理由が薄い場合は、既存の標準ライブラリや導入済みの依存で足りないか確認する。
- フロントエンドの依存は pnpm で追加する。
- フロントエンドの依存やコマンドは `frontend/` を対象にする。
- Rust の依存は `backend/Cargo.toml` に追加する。
- DB アクセスは原則 `sqlx` を使う。
- React から SQLite や Tauri SQL plugin を直接使わない。

## アーキテクチャ

Clean Architecture の考え方を取り入れます。

Rust 側は以下の層に分けます。

```text
backend/src/
  domain/
  application/
  infrastructure/
  interface/
```

- `domain` は Tauri、SQLite、sqlx に依存しない。
- `application` はユースケースと repository trait を持つ。
- `infrastructure` は sqlx / SQLite など外部技術の実装を持つ。
- `interface` は Tauri command、DTO、TypeScript binding 用の境界を持つ。
- Tauri command、SQL、React component に業務ルールを直接書かない。
- 業務ロジックは mock repository を注入してテストできるようにする。

React 側は Tauri command を component から直接呼ばず、API クライアント層を経由します。

```text
frontend/
  src/
    features/
    lib/api/
    lib/mock-api/
    components/
```

- Tauri 起動時は generated binding を呼ぶ。
- Vite dev 単体起動時は mock / in-memory 実装を使う。
- Storybook、Vitest、Playwright はできるだけ Vite dev 側で動くようにする。

## Rust コードを書くとき

### コード品質

- Clippy の警告は可能な限り解消する。
- 不要な警告を許可する場合は、理由をコメントで明記する。
- コードは rustfmt でフォーマットする。
- 外部に公開する構造体やフィールドには、必要に応じて doc comment を書く。

### import の書き方

`use` はおおむね以下の順でまとめます。

- `std`
- 外部クレート
- `crate`
- `super`
- `self`

```rust
use std::path::PathBuf;

use anyhow::{Context as _, Result};
use sqlx::SqlitePool;
use tracing::info;

use crate::application::use_cases::ListPartners;

use self::dto::PartnerDto;
```

トレイトメソッドだけを使う import は `as _` を使います。

### モジュール内の書き方

- 外部に公開している関数や構造体をファイルの上部に置く。
- 公開しない補助関数や補助型は下部に置く。
- 構造体の `impl` は、可能な範囲で構造体定義の近くに置く。
- `fn main()` や Tauri setup から近いものほど浅い位置に置く。

### テスト

- domain / application の業務ロジックは SQLite なしでテストする。
- repository trait に mock / in-memory 実装を注入してユースケースをテストする。
- Rust の単体テストは `mod tests` 内に書く。

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn creates_partner() {
        assert!(true);
    }
}
```

### エラーメッセージ

- tracing やログなど開発者向けのメッセージは原則英文で書く。
- ユーザーの目に入るアプリ内メッセージは日本語で書く。

## フロントエンドコードを書くとき

- UI は shadcn/ui + Tailwind CSS を使う。
- アイコンは lucide-react を使う。
- データ取得は SWR を使う。
- 追加・更新・削除後は `mutate` で再検証する。
- 業務ロジックを React component に閉じ込めない。
- 日付、金額、CSV 変換、フィルタ条件などはテストしやすい純粋関数に寄せる。
- Vite dev 単体で確認できる状態を保つ。

## DB とマイグレーション

- SQLite を使う。
- DB アクセスは Rust の `infrastructure` 層に閉じ込める。
- マイグレーション SQL は `backend/migrations` に置く。
- マイグレーション SQL に書くコメントは、日本語で記述する。
- アプリ起動時に `sqlx::migrate!` でマイグレーションを適用する。
- テーブルや制約を変更した場合は `requirements.md` の DB 設計も更新する。

## ドキュメント

- ユーザーと合意した要件は `requirements.md` に残す。
- 実装順や進捗は `tasks.md` に残す。
- 技術選定を変えた場合は、理由も短く残す。
- 大きくなった設計メモは `docs/` へ分割する。
