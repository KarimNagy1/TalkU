CREATE TABLE IF NOT EXISTS admin_login_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username_key TEXT NOT NULL,
    attempted_at TEXT NOT NULL
        DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    succeeded INTEGER NOT NULL DEFAULT 0
        CHECK (succeeded IN (0, 1)),
    attempt_id TEXT,
    status TEXT NOT NULL DEFAULT 'failed'
        CHECK (status IN ('pending', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_lookup
    ON admin_login_attempts(username_key, attempted_at);

CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_attempt_id
    ON admin_login_attempts(attempt_id);
