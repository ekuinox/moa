# 出納帳ソフト 要件定義

## 目的

Windows で動作する、出納・買掛・売掛を管理できるデスクトップアプリを作る。

## 関連ドキュメント

- 実装タスクは `tasks.md` に記録する。

## 優先度

1. 買掛管理
2. 売掛管理
3. 出納管理

## 機能要件

### 買掛・売掛管理

- 買掛と売掛を管理できる。
- 買掛・売掛は以下の切り口で表示できる。
  - 月次
  - 事業年度
  - 取引先
  - 種別
- 取引先ごとに、買掛・売掛の表を期間ごとに確認できる。
- 取引先には読み仮名を登録できる。
- 取引先は読み仮名でソートできる。
- 買掛・売掛表の取引先一覧から、取引先の追加・編集モーダルを開ける。
- 事業年度は月単位で期間を指定できる。
- 入金済み・支払済みなどの状態管理は初期実装では不要。
- 将来的に状態管理を追加できる余地は残す。

### 買掛・売掛明細

- 買掛・売掛には以下の項目を持たせる。
  - 発生日
  - 取引先
  - 種別
  - 摘要
  - 金額

### 種別管理

- 買掛・売掛の種別を追加・削除できる。
- 種別の例:
  - 材料費
  - 工賃

### 帳票・出力

- CSV 出力が必要。
- 表示している表をそのまま CSV 出力できる。
- 表示している表をそのまま印刷できる。
- Excel 出力は初期実装では不要。
- PDF 出力の要否は未確定。

### 起動制御

- アプリは同時起動できないようにする。

### データ永続化

- 管理データは SQLite などで永続化する。
- 永続化するファイル数は極力少なくする。

## 技術要件

- 候補:
  - Tauri
  - Rust
  - React
- ユーザーは Rust / React を読める。
- 他の技術のほうが要件に適している場合は検討する。
- 主な配布対象は Windows とする。
- 開発環境として macOS でも `just refresh`、`just dev`、`just db-drop`、`just db-seed` を実行できるようにする。

## 技術方針案

現時点では、Tauri + Rust + React + TypeScript + SQLite が要件に合っている可能性が高い。

- Windows デスクトップアプリとして配布しやすい。
- Rust 側で SQLite、ファイルロック、同時起動防止、バックアップ処理を堅く実装できる。
- React 側で一覧・絞り込み・集計表示を作りやすい。
- SQLite の単一 DB ファイルに業務データを集約しやすい。
- CSV 出力は、表示中の表データをフロントエンドまたは Rust 側で CSV 化して保存する。
- 印刷は、フロントエンドで印刷専用 DOM を用意し、`window.print()` で OS/WebView の印刷プレビューへ渡す方針を第一候補にする。
- 画面は凝った独自デザインではなく、一般的な業務アプリとして分かりやすい見た目にする。

## 詳細技術選定案

### アプリ基盤

- Tauri v2 を使う。
- フロントエンドは React + TypeScript + Vite を使う。
- パッケージマネージャーは pnpm を第一候補にする。
- フロントエンド側のツールバージョンは mise で管理する。

### Tauri と React の連携

- React から Rust 側の処理を呼ぶ方法は、Tauri command を基本にする。
- 型安全性を高めるため、`tauri-specta` + `specta` を採用候補にする。
- Rust 側の command、引数、戻り値の型から TypeScript binding を生成し、React 側は生成された関数を呼ぶ。
- `trpc` は TypeScript バックエンド向けのため、Rust/Tauri 構成では初期採用しない。
- `rspc` は Rust で型安全な RPC を組めるが、今回の初期実装では Tauri command 中心のほうが構成が単純なため保留にする。

### アーキテクチャ

- Clean Architecture の考え方を取り入れる。
- ただし小規模なデスクトップアプリとして、過度な抽象化は避ける。
- 業務ルールを Tauri command、SQL、React component に直接書かない。
- Rust 側は domain / application / infrastructure / interface の層に分ける。
- 依存方向は外側から内側へ向ける。
- domain 層は Tauri、SQLite、sqlx に依存しない。
- application 層はユースケースを表現する。
- infrastructure 層は SQLite / sqlx など外部技術の実装を持つ。
- interface 層は Tauri command と TypeScript binding 用の DTO を持つ。
- 初期実装では repository trait は必要な範囲だけ定義する。
- 単純なCRUDでも、将来の集計・CSV・印刷・出納連携を見越してユースケース単位で整理する。
- application 層のユースケースは repository trait を受け取り、mock 実装を注入してテストできるようにする。
- 業務ロジックは SQLite なしでユニットテストできるようにする。

### Rust 側の想定構成

```text
backend/src/
  domain/
    models/
    value_objects/
  application/
    use_cases/
    ports/
  infrastructure/
    db/
    repositories/
    migrations/
  interface/
    commands/
    dto/
  lib.rs
```

- Tauri の Rust 側ディレクトリ名は `backend` を使う。
- Tauri の設定で標準の `src-tauri` ではなく `backend` を指定する。

### フロントエンド側の想定構成

```text
frontend/
  src/
    app/
    features/
      partners/
      categories/
      account-entries/
      fiscal-years/
    lib/
      api/
      mock-api/
      formatters/
    components/
      ui/
      layout/
```

### データ取得・キャッシュ

- React 側のサーバー状態管理には SWR を採用候補にする。
- 一覧取得やマスタ取得は `useSWR` で読み込む。
- 追加・更新・削除後は `mutate` で表示中データを再検証する。
- DB はローカル SQLite なので、SWR の自動再検証設定は控えめにする。

### UI

- shadcn/ui + Tailwind CSS を使う。
- shadcn/ui は Vite 向けセットアップを使う。
- アイコンは lucide-react を使う。
- 業務アプリとして、一覧、フィルタ、フォーム、ダイアログを中心にした落ち着いた見た目にする。

### lint / format

- フロントエンドの lint / format は Biome を第一候補にする。
- TypeScript の型チェックは `tsc --noEmit` で行う。
- フロントエンドの TypeScript target / lib は `ES2025` に揃える。
- Rust の format は rustfmt を使う。
- Rust の lint は clippy を使う。
- package script と mise task の両方から実行できるようにする。
- Rust toolchain は `rust-toolchain.toml` で固定する。

### フロントエンドテスト

- Vitest を導入する。
- React Testing Library を導入する。
- UI コンポーネント、日付・金額表示、フィルタ条件、CSV 変換などをテスト対象にする。
- E2E より軽い回帰テストとして使う。

### Storybook

- Storybook を導入する。
- React + Vite 向けの `@storybook/react-vite` を使う。
- 初期は共通UI部品、フォーム部品、一覧テーブル周辺を Storybook の対象にする。
- 画面全体よりも、再利用コンポーネントの確認と回帰防止を主目的にする。

### E2E

- E2E は Playwright を採用候補にする。
- 初期は主要導線に絞る。
  - アプリ起動
  - 取引先の追加
  - 種別の追加
  - 買掛または売掛明細の追加
  - 一覧フィルタ
  - CSV 出力操作
- Tauri アプリそのものの E2E は少し複雑になるため、まずは Vite dev server 上のフロントエンド E2E から整備する。

### Vite dev 単体での動作確認

- Tauri として起動しなくても、Vite dev server だけで画面の動作確認をある程度できるようにする。
- Tauri dev の SQLite には、開発時に既存データを削除して seed データを投入できるコマンドを用意する。
- SQLite の保存先は `MOA_DATABASE_PATH` 環境変数で差し替えできるようにする。
- `MOA_DATABASE_PATH` が未指定の場合は、Tauri のアプリデータディレクトリ配下に保存する。
- 開発用 seed コマンドは `MOA_DATABASE_PATH` が未指定の場合は失敗させる。
- `just dev`、`just db-drop`、`just db-seed` ではプロジェクト内 `.dev/moa.sqlite3` を開発用 SQLite として使う。
- React からデータアクセスする処理は、Tauri command を直接呼ばず、アプリ内の API クライアント層を経由する。
- API クライアント層は、本番時は Tauri command binding を呼ぶ。
- Vite dev 単体起動時は、モックまたはインメモリ実装を使えるようにする。
- Storybook、Vitest、Playwright は原則として Vite dev 側の実装で動かせるようにする。

### mise

- `mise.toml` をリポジトリルートに置く。
- Node.js、pnpm、just のバージョンを mise で固定する。
- フロントエンドプロジェクトは `frontend` ディレクトリに置く。
- 標準タスクは Justfile に定義する。
- 想定タスク:
  - `just dev`
  - `just build`
  - `just lint`
  - `just fmt`
  - `just typecheck`
  - `just test`
  - `just storybook`
  - `just test-e2e`

### データベース

- SQLite を使う。
- DB へのアクセスは Rust 側に寄せる。
- React から SQL を直接実行する Tauri SQL plugin は初期採用しない。
- Rust 側でリポジトリ層またはサービス層を作り、DB 操作を command から呼び出す。
- DB 操作は infrastructure 層の repository 実装に閉じ込める。
- application 層は repository trait に依存する。
- Tauri command は application 層のユースケースを呼び出すだけにする。
- Rust からの DB アクセスは `sqlx` を第一候補にする。
- `SqlitePool` を Tauri state として管理し、各 command から共有する。
- SQLite のマイグレーションは `sqlx::migrate!` を使う。
- マイグレーション SQL は `backend/migrations` に置く。
- アプリ起動時にマイグレーションを実行する。
- ORM 候補として Toasty も検討したが、初期実装では採用しない方針にする。
- Toasty は Preview 段階で API が安定していないため、業務アプリの初期DB層としては `sqlx` のほうを優先する。
- アプリ全体の設定は単一行の `settings` テーブルに保存する。
- 事業年度の開始月は `settings.fiscal_year_start_month` で管理する。
- 事業年度は開始月から12ヶ月単位で論理的に区切る (専用テーブルは持たない)。
- 買掛・売掛明細には事業年度 ID を直接持たせず、発生日と開始月から対象年度を判定する。
- 開始月の変更により、既存明細の表示年度が変わる可能性を許容する。

### 初期データモデル案

- `partners`: 取引先。
- `categories`: 買掛・売掛の種別。
- `account_entries`: 買掛・売掛明細。
- `settings`: アプリ全体の設定 (単一行)。
- `account_entries` には `kind` を持たせ、買掛と売掛を区別する。

### 初期テーブル案

#### `partners`

取引先を管理する。

| カラム | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `id` | TEXT | Yes | UUID |
| `name` | TEXT | Yes | 取引先名 |
| `kana` | TEXT | Yes | 読み仮名。ソートに使う |
| `created_at` | TEXT | Yes | 作成日時 |
| `updated_at` | TEXT | Yes | 更新日時 |

#### `categories`

買掛・売掛の種別を管理する。

| カラム | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `id` | TEXT | Yes | UUID |
| `name` | TEXT | Yes | 種別名 |
| `created_at` | TEXT | Yes | 作成日時 |
| `updated_at` | TEXT | Yes | 更新日時 |

#### `account_entries`

買掛・売掛明細を管理する。

| カラム | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `id` | TEXT | Yes | UUID |
| `kind` | TEXT | Yes | `payable` または `receivable` |
| `occurred_on` | TEXT | Yes | 発生日。`YYYY-MM-DD` |
| `partner_id` | TEXT | Yes | 取引先 ID |
| `category_id` | TEXT | Yes | 種別 ID |
| `description` | TEXT | Yes | 摘要 |
| `amount` | INTEGER | Yes | 金額。円単位の整数 |
| `created_at` | TEXT | Yes | 作成日時 |
| `updated_at` | TEXT | Yes | 更新日時 |

#### `settings`

アプリ全体に対する設定を 1 行だけ保持する。

| カラム | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `id` | TEXT | Yes | 固定値 `default`。シングルトン制約 |
| `fiscal_year_start_month` | INTEGER | Yes | 事業年度の開始月。1-12 |
| `created_at` | TEXT | Yes | 作成日時 |
| `updated_at` | TEXT | Yes | 更新日時 |

### 同時起動防止

- Tauri の single-instance plugin を採用候補にする。

### DB アクセス候補の比較

#### `sqlx`

- 初期採用候補。
- async / await と相性がよい。
- `SqlitePool` を Tauri state として共有しやすい。
- SQL を明示的に書くため、集計・期間条件・CSV対象の一覧取得を制御しやすい。
- `sqlx::migrate!` でマイグレーションを扱える。

#### Toasty

- tokio-rs の async ORM。
- Rust struct に `#[derive(toasty::Model)]` を付けてモデル定義できる。
- SQLite、PostgreSQL、MySQL、DynamoDB に対応している。
- schema 生成や migration CLI の仕組みを持つ。
- 現時点では Preview で、API がまだ安定していない。
- このアプリは長く使う業務アプリのため、初期実装では採用せず、将来再検討に留める。

#### `rusqlite`

- SQLite に絞るならシンプルで堅い候補。
- 同期 API のため、Tauri command から扱う場合は blocking 処理の扱いを設計する必要がある。
- 初期実装では `sqlx` を優先する。

## 未確定事項

### 業務ルール

- 消費税の扱い。
- 事業年度定義の追加・変更・削除時の制約。
- 締日・支払日・入金予定日の扱い。
- 買掛・売掛のステータス。
- 一部支払・一部入金を扱うか。
- 取引先ごとの支払条件・入金条件を持つか。
- 出納と買掛・売掛の消込を行うか。

### データ項目

- 取引先に持たせる項目は、初期実装では名称と読み仮名のみ。
- 種別に持たせる項目。
- 出納明細に持たせる項目。

### 表示・帳票

- 必要な一覧画面。
- 必要な集計画面。
- CSV 出力対象の表。
- PDF 出力の要否。

### 運用

- DB ファイルの保存場所。
- バックアップの要否。
- 複数会社・複数事業の管理要否。
- ユーザー認証や権限管理の要否。
- 詳細技術選定の最終決定。
- Node.js / pnpm の固定バージョン。

## 決定事項

- 事業年度は月単位で期間を指定できる。
- 買掛・売掛明細の基本項目は、発生日、取引先、種別、摘要、金額とする。
- 入金済み・支払済みなどの状態管理は初期実装では不要。
- 取引先の初期項目は名称と読み仮名のみ。
- CSV 出力が必要。
- 表示している表をそのまま CSV 出力できる。
- 表示している表をそのまま印刷できる。
- Excel 出力は初期実装では不要。
- 画面は一般的な業務アプリとして分かりやすい見た目にする。
- Tauri + Rust + React + TypeScript + SQLite の方針は問題ない。
- UI は shadcn/ui + Tailwind CSS を使う。
- フロントエンド側のツールは mise で管理する。
- Rust toolchain は `rust-toolchain.toml` で固定する。
- フロントエンドテストとして Vitest + React Testing Library を導入する。
- Tauri として起動しなくても、Vite dev server だけで画面の動作確認をある程度できるようにする。
- 事業年度は SQLite に年度定義として保存する。
- 事業年度の基本ルールは SQLite に保存する。
- 買掛・売掛明細は、発生日と年度定義の期間から対象事業年度を判定する。
- Rust からの DB アクセスは `sqlx` を第一候補にする。
- DB マイグレーションは `sqlx::migrate!` を第一候補にする。
- Toasty は検討したが、Preview 段階のため初期実装では採用しない。
- Clean Architecture の考え方を取り入れる。
- Rust 側は domain / application / infrastructure / interface の層に分ける。
- application 層のユースケースは mock 注入でテストできるようにする。
- Tauri の Rust 側ディレクトリ名は `backend` を使う。
