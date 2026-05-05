# 実装タスク

## 方針

最初にプロジェクト土台を整えたあと、取引先マスタをフロントエンドから DB まで通す薄い縦切りとして実装する。

## タスク

- [x] プロジェクト土台を作る
  - [x] Tauri + React + Vite + TypeScript の構成を作る
  - [x] Rust 側ディレクトリ名を `backend` にする
  - [x] `mise.toml` を追加する
  - [x] mise で just を管理する
  - [x] `Justfile` に標準タスクを設定する
    - [x] `just dev`
    - [x] `just build`
    - [x] `just fmt`
    - [x] `just lint`
    - [x] `just deny`
    - [x] `just typecheck`
    - [x] `just test`
    - [x] `just storybook`
    - [x] `just test-e2e`
    - [x] `just validate`
    - [x] `just refresh`
    - [x] `just ci`
  - [x] `rust-toolchain.toml` を追加する
  - [x] pnpm を使う
  - [x] Biome を導入する
  - [x] Vitest + React Testing Library を導入する
  - [x] Storybook を導入する
  - [x] Playwright を導入する

- [ ] アーキテクチャ骨格を作る
  - [ ] `backend/src/domain` を作る
  - [ ] `backend/src/application` を作る
  - [ ] `backend/src/infrastructure` を作る
  - [ ] `backend/src/interface` を作る
  - [ ] React 側の `features` を作る
  - [ ] React 側の `lib/api` を作る
  - [ ] React 側の `lib/mock-api` を作る

- [ ] DB とマイグレーションを整備する
  - [ ] `sqlx` を導入する
  - [ ] SQLite 接続を実装する
  - [ ] `backend/migrations` を作る
  - [ ] アプリ起動時にマイグレーションを実行する
  - [ ] 初期テーブルを作る
    - [ ] `partners`
    - [ ] `categories`
    - [ ] `account_entries`
    - [ ] `fiscal_year_settings`
    - [ ] `fiscal_years`

- [ ] 型安全な Tauri 連携を整備する
  - [ ] `specta` を導入する
  - [ ] `tauri-specta` を導入する
  - [ ] TypeScript binding 生成を設定する
  - [ ] 小さい command で疎通確認する

- [ ] Vite dev 単体モードを整備する
  - [ ] API クライアント層を作る
  - [ ] Tauri binding 実装を作る
  - [ ] mock / in-memory 実装を作る
  - [ ] Vite dev で mock 実装に差し替える

- [ ] 取引先マスタを実装する
  - [ ] domain model を作る
  - [ ] repository trait を作る
  - [ ] sqlx repository 実装を作る
  - [ ] mock repository 実装を作る
  - [ ] usecase を作る
  - [ ] Tauri command を作る
  - [ ] React の一覧画面を作る
  - [ ] React の追加・編集・削除 UI を作る
  - [ ] 読み仮名ソートを実装する
  - [ ] ユースケースのテストを書く
  - [ ] React 側のテストを書く

- [ ] 種別マスタを実装する
  - [ ] domain model を作る
  - [ ] repository trait を作る
  - [ ] sqlx repository 実装を作る
  - [ ] mock repository 実装を作る
  - [ ] usecase を作る
  - [ ] Tauri command を作る
  - [ ] React の一覧画面を作る
  - [ ] React の追加・編集・削除 UI を作る
  - [ ] テストを書く

- [ ] 事業年度設定を実装する
  - [ ] `fiscal_year_settings` の読み書きを実装する
  - [ ] `fiscal_years` の読み書きを実装する
  - [ ] 基本ルールから年度を自動生成する
  - [ ] 年度期間の重複チェックを実装する
  - [ ] React の設定画面を作る
  - [ ] テストを書く

- [ ] 買掛・売掛明細を実装する
  - [ ] domain model を作る
  - [ ] repository trait を作る
  - [ ] sqlx repository 実装を作る
  - [ ] mock repository 実装を作る
  - [ ] usecase を作る
  - [ ] Tauri command を作る
  - [ ] React の一覧画面を作る
  - [ ] React の追加・編集・削除 UI を作る
  - [ ] テストを書く

- [ ] 一覧・フィルタ・集計を実装する
  - [ ] 月次表示を作る
  - [ ] 事業年度表示を作る
  - [ ] 取引先別表示を作る
  - [ ] 種別別表示を作る
  - [ ] 取引先ごとの期間別表を作る
  - [ ] テストを書く

- [ ] CSV 出力と印刷を実装する
  - [ ] 表示中の表を CSV 出力する
  - [ ] 表示中の表を印刷する
  - [ ] 印刷用 CSS を整える
  - [ ] テストを書く

- [ ] Storybook を拡充する
  - [ ] 共通 UI 部品の stories を追加する
  - [ ] フォーム部品の stories を追加する
  - [ ] 一覧テーブル周辺の stories を追加する

- [ ] E2E を拡充する
  - [ ] アプリ起動相当の表示確認を書く
  - [ ] 取引先追加の E2E を書く
  - [ ] 種別追加の E2E を書く
  - [ ] 買掛または売掛明細追加の E2E を書く
  - [ ] 一覧フィルタの E2E を書く
  - [ ] CSV 出力操作の E2E を書く
