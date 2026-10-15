CREATE TABLE IF NOT EXISTS fund_entries (
    id TEXT PRIMARY KEY,
    entry_type TEXT NOT NULL
        CHECK (entry_type IN ('donation', 'expense')),
    amount_piasters INTEGER NOT NULL
        CHECK (amount_piasters > 0),
    currency TEXT NOT NULL DEFAULT 'EGP'
        CHECK (currency = 'EGP'),
    description TEXT NOT NULL,
    entry_date TEXT NOT NULL,

    donor_private_name TEXT,
    donor_display_name TEXT,
    donor_name_visibility TEXT NOT NULL DEFAULT 'anonymous'
        CHECK (donor_name_visibility IN ('anonymous', 'public')),
    payee_name TEXT,

    created_at TEXT NOT NULL
        DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL
        DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_fund_entries_date
    ON fund_entries(entry_date, created_at);

CREATE TABLE IF NOT EXISTS fund_month_settings (
    month TEXT PRIMARY KEY,
    target_piasters INTEGER NOT NULL DEFAULT 0
        CHECK (target_piasters >= 0),
    opening_balance_piasters INTEGER NOT NULL DEFAULT 0
        CHECK (opening_balance_piasters >= 0),
    updated_at TEXT NOT NULL
        DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS admin_audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_email TEXT NOT NULL,
    action TEXT NOT NULL,
    entry_id TEXT,
    details TEXT,
    created_at TEXT NOT NULL
        DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_created_at
    ON admin_audit_log(created_at);
