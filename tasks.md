# 実装タスク

## 方針

最初にプロジェクト土台を整えたあと、取引先マスタをフロントエンドから DB まで通す薄い縦割りとして実装する。

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

- [x] アーキテクチャ骨格を作る
  - [x] `backend/src/domain` を作る
  - [x] `backend/src/application` を作る
  - [x] `backend/src/infrastructure` を作る
  - [x] `backend/src/interface` を作る
  - [x] React 側の `features` を作る
  - [x] React 側の `lib/api` を作る
  - [x] React 側の `lib/mock-api` を作る

- [x] DB とマイグレーションを整備する
  - [x] `sqlx` を導入する
  - [x] SQLite 接続を実装する
  - [x] `backend/migrations` を作る
  - [x] アプリ起動時にマイグレーションを実行する
  - [x] 初期テーブルを作る
    - [x] `partners`
    - [x] `categories`
    - [x] `account_entries`
    - [x] `fiscal_year_settings`
    - [x] `fiscal_years`

- [x] 型安全な Tauri 連携を整備する
  - [x] `specta` を導入する
  - [x] `tauri-specta` を導入する
  - [x] TypeScript binding 生成を設定する
  - [x] 小さい command で疎通確認する

- [x] Vite dev 単体モードを整備する
  - [x] API クライアント層を作る
  - [x] Tauri binding 実装を作る
  - [x] mock / in-memory 実装を作る
  - [x] Vite dev で mock 実装に差し替える
  - [x] issue #27 の開発用 seed データ投入コマンドを追加する

- [x] 取引先マスタを実装する
  - [x] domain model を作る
  - [x] repository trait を作る
  - [x] sqlx repository 実装を作る
  - [x] mock repository 実装を作る
  - [x] usecase を作る
  - [x] Tauri command を作る
  - [x] React の一覧画面を作る
  - [x] React の追加・編集・削除 UI を作る
  - [x] 読み仮名ソートを実装する
  - [x] ユースケースのテストを書く
  - [x] React 側のテストを書く
  - [x] issue #25 の画面案を元に取引先追加・編集モーダルを実装する

- [x] 種別マスタを実装する
  - [x] domain model を作る
  - [x] repository trait を作る
  - [x] sqlx repository 実装を作る
  - [x] mock repository 実装を作る
  - [x] usecase を作る
  - [x] Tauri command を作る
  - [x] React の一覧画面を作る
  - [x] React の追加・編集・削除 UI を作る
  - [x] テストを書く

- [x] 事業年度設定を実装する
  - [x] `fiscal_year_settings` の読み書きを実装する
  - [x] `fiscal_years` の読み書きを実装する
  - [x] 基本ルールから年度を自動生成する
  - [x] 年度期間の重複チェックを実装する
  - [x] React の設定画面を作る
  - [x] テストを書く
  - [x] issue #29 の画面案を元に種別と年度をまとめた設定タブを実装する
  - [x] fiscal_year_settings / fiscal_years テーブルを廃止し、`settings` テーブルに統合する

- [x] 買掛・売掛明細を実装する
  - [x] domain model を作る
  - [x] repository trait を作る
  - [x] sqlx repository 実装を作る
  - [x] mock repository 実装を作る
  - [x] usecase を作る
  - [x] Tauri command を作る
  - [x] React の一覧画面を作る
  - [x] React の追加・編集・削除 UI を作る
  - [x] issue #23 の画面案を元に買掛・売掛共通画面を作り直す
  - [x] issue #35 の App / AppCard 固有スタイルを CSS Modules 化する
  - [x] テストを書く

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
