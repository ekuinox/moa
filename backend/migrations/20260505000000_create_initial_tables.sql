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

-- 事業年度を生成・解釈するための基本ルール。
-- 初期実装では 1 レコードだけを使うが、永続化の形は将来の拡張を妨げないようにしておく。
CREATE TABLE fiscal_year_settings (
  id TEXT PRIMARY KEY NOT NULL,
  start_month INTEGER NOT NULL CHECK (start_month BETWEEN 1 AND 12),
  duration_months INTEGER NOT NULL CHECK (duration_months > 0),
  naming_rule TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- 実際の事業年度期間。
-- 要件上、事業年度は月単位なので YYYY-MM の文字列として保持する。
CREATE TABLE fiscal_years (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  start_month TEXT NOT NULL,
  end_month TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  CHECK (start_month <= end_month)
);

CREATE INDEX idx_fiscal_years_period ON fiscal_years (start_month, end_month);

-- 買掛・売掛の明細。
-- 買掛と売掛は同じ項目を持つため `kind` で区別する。
-- 入金済み・支払済みなどの状態は初期スコープでは保持しない。
CREATE TABLE account_entries (
  id TEXT PRIMARY KEY NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('payable', 'receivable')),
  occurred_on TEXT NOT NULL,
  partner_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  description TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount >= 0),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (partner_id) REFERENCES partners (id) ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (category_id) REFERENCES categories (id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 初期の表示軸である期間、取引先、種別、買掛・売掛区分に合わせたインデックス。
CREATE INDEX idx_account_entries_occurred_on ON account_entries (occurred_on);
CREATE INDEX idx_account_entries_partner_period ON account_entries (partner_id, occurred_on);
CREATE INDEX idx_account_entries_category_period ON account_entries (category_id, occurred_on);
CREATE INDEX idx_account_entries_kind_period ON account_entries (kind, occurred_on);
