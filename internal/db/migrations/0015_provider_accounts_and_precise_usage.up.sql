-- =============================================================================
-- Migration: 0015_provider_accounts_and_precise_usage.up.sql
-- =============================================================================
-- Adds upstream account records inspired by 9router/sub2api/New API routing
-- models, plus extra append-only usage dimensions for precise gateway metrics.

CREATE TABLE provider_accounts (
    id                    TEXT PRIMARY KEY,
    name                  TEXT NOT NULL,
    provider              TEXT NOT NULL,
    auth_type             TEXT NOT NULL DEFAULT 'api_key',
    base_url              TEXT NOT NULL DEFAULT '',
    secret_encrypted      TEXT,
    secret_hint           TEXT NOT NULL DEFAULT '',
    priority              INTEGER NOT NULL DEFAULT 50,
    weight                INTEGER NOT NULL DEFAULT 1,
    concurrency_limit     INTEGER NOT NULL DEFAULT 0,
    requests_per_minute   INTEGER NOT NULL DEFAULT 0,
    tokens_per_minute     INTEGER NOT NULL DEFAULT 0,
    is_active             INTEGER NOT NULL DEFAULT 1,
    schedulable           INTEGER NOT NULL DEFAULT 1,
    status                TEXT NOT NULL DEFAULT 'active',
    error_message         TEXT,
    rate_limited_until    TEXT,
    quota_reset_at        TEXT,
    last_used_at          TEXT,
    last_tested_at        TEXT,
    extra                 TEXT NOT NULL DEFAULT '{}',
    created_at            TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at            TEXT
);

CREATE INDEX idx_provider_accounts_provider
    ON provider_accounts (provider, is_active, schedulable, priority)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_provider_accounts_status
    ON provider_accounts (status, updated_at)
    WHERE deleted_at IS NULL;

ALTER TABLE usage_events ADD COLUMN upstream_account_id TEXT NOT NULL DEFAULT '';
ALTER TABLE usage_events ADD COLUMN provider TEXT NOT NULL DEFAULT '';
ALTER TABLE usage_events ADD COLUMN route_name TEXT NOT NULL DEFAULT '';
ALTER TABLE usage_events ADD COLUMN endpoint TEXT NOT NULL DEFAULT '';
ALTER TABLE usage_events ADD COLUMN cache_read_tokens INTEGER NOT NULL DEFAULT 0;
ALTER TABLE usage_events ADD COLUMN cache_write_tokens INTEGER NOT NULL DEFAULT 0;
ALTER TABLE usage_events ADD COLUMN reasoning_tokens INTEGER NOT NULL DEFAULT 0;
ALTER TABLE usage_events ADD COLUMN retry_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE usage_events ADD COLUMN fallback_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE usage_events ADD COLUMN upstream_status_code INTEGER NOT NULL DEFAULT 0;
ALTER TABLE usage_events ADD COLUMN error_class TEXT NOT NULL DEFAULT '';

CREATE INDEX idx_usage_provider_time
    ON usage_events (provider, created_at)
    WHERE provider != '';

CREATE INDEX idx_usage_account_time
    ON usage_events (upstream_account_id, created_at)
    WHERE upstream_account_id != '';
