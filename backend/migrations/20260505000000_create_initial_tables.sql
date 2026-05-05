-- Business partners used by payable and receivable entries.
-- `kana` is stored separately so partner lists can be sorted by reading.
CREATE TABLE partners (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  kana TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX idx_partners_kana ON partners (kana, name);

-- User-maintained categories such as material cost or labor cost.
CREATE TABLE categories (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX idx_categories_name ON categories (name);

-- Rule for generating or interpreting fiscal years.
-- The first implementation keeps one settings row, but the table allows this
-- to evolve without changing the persistence shape.
CREATE TABLE fiscal_year_settings (
  id TEXT PRIMARY KEY NOT NULL,
  start_month INTEGER NOT NULL CHECK (start_month BETWEEN 1 AND 12),
  duration_months INTEGER NOT NULL CHECK (duration_months > 0),
  naming_rule TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Concrete fiscal year periods. Months are stored as YYYY-MM text because the
-- requirement defines fiscal years at month granularity.
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

-- Payable and receivable entries share the same shape and are separated by
-- `kind`. Payment/receipt status is intentionally omitted for the first scope.
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

-- Indexes follow the first reporting axes: month/period, partner, category,
-- and payable/receivable kind.
CREATE INDEX idx_account_entries_occurred_on ON account_entries (occurred_on);
CREATE INDEX idx_account_entries_partner_period ON account_entries (partner_id, occurred_on);
CREATE INDEX idx_account_entries_category_period ON account_entries (category_id, occurred_on);
CREATE INDEX idx_account_entries_kind_period ON account_entries (kind, occurred_on);
