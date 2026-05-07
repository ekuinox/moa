-- 買掛・売掛の明細で使用する取引先。
-- 読み仮名順で並べ替えられるように `kana` を分けて保持する。
CREATE TABLE partners (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  kana TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX idx_partners_kana ON partners (kana, name);

-- 材料費や工賃など、利用者が管理する買掛・売掛の種別。
CREATE TABLE categories (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX idx_categories_name ON categories (name);

-- アプリ全体に対する設定をまとめて保持する単一行テーブル。
-- 列を増やすことで設定項目を追加できるよう、シングルトン制約 (`id = 'default'`) を入れておく。
--
-- JSON ファイルで持つ案も検討したが、要件の「永続化するファイル数は極力少なくする」を
-- 優先し、業務データと同じ SQLite に格納する。CHECK 制約で値域を担保しやすい点、
-- sqlx / migrations / Tauri command の既存パターンをそのまま流用できる点もこの選択の理由。
-- 設定が入れ子構造になったり、ユーザーに外部編集させたくなった時点で再検討する。
CREATE TABLE settings (
  id TEXT PRIMARY KEY NOT NULL DEFAULT 'default' CHECK (id = 'default'),
  fiscal_year_start_month INTEGER NOT NULL DEFAULT 4 CHECK (fiscal_year_start_month BETWEEN 1 AND 12),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- 設定はテーブル作成時に既定値で 1 行だけ用意する。
INSERT INTO settings (id) VALUES ('default');

-- 買掛・売掛の明細。
-- 買掛と売掛は同じ項目を持つため `kind` で区別する。
-- 入金済み・支払済みなどの状態は初期スコープでは保持しない。
-- 種別 (category) は明細あたり 0 個以上を許容するため `account_entry_categories` で多対多で表現する。
CREATE TABLE account_entries (
  id TEXT PRIMARY KEY NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('payable', 'receivable')),
  occurred_on TEXT NOT NULL,
  partner_id TEXT NOT NULL,
  description TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount >= 0),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (partner_id) REFERENCES partners (id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 初期の表示軸である期間、取引先、買掛・売掛区分に合わせたインデックス。
CREATE INDEX idx_account_entries_occurred_on ON account_entries (occurred_on);
CREATE INDEX idx_account_entries_partner_period ON account_entries (partner_id, occurred_on);
CREATE INDEX idx_account_entries_kind_period ON account_entries (kind, occurred_on);

-- 明細と種別の多対多関連。1 明細あたり 0 個以上の種別を持つことができる。
CREATE TABLE account_entry_categories (
  account_entry_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  PRIMARY KEY (account_entry_id, category_id),
  FOREIGN KEY (account_entry_id) REFERENCES account_entries (id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories (id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 種別から明細を逆引きする際に効くインデックス。
CREATE INDEX idx_account_entry_categories_category ON account_entry_categories (category_id, account_entry_id);
