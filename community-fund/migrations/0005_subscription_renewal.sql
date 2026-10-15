CREATE TABLE IF NOT EXISTS fund_subscription_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  anchor_date TEXT NOT NULL,
  renewal_interval TEXT NOT NULL CHECK (renewal_interval IN ('monthly', 'yearly')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
