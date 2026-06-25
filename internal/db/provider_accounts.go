package db

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/google/uuid"
)

const providerAccountSelectColumns = "id, name, provider, auth_type, base_url, secret_encrypted, secret_hint, " +
	"priority, weight, concurrency_limit, requests_per_minute, tokens_per_minute, " +
	"is_active, schedulable, status, error_message, rate_limited_until, quota_reset_at, " +
	"last_used_at, last_tested_at, extra, created_at, updated_at, deleted_at"

type ProviderAccount struct {
	ID                string
	Name              string
	Provider          string
	AuthType          string
	BaseURL           string
	SecretEncrypted   *string
	SecretHint        string
	Priority          int
	Weight            int
	ConcurrencyLimit  int
	RequestsPerMinute int
	TokensPerMinute   int
	IsActive          bool
	Schedulable       bool
	Status            string
	ErrorMessage      *string
	RateLimitedUntil  *string
	QuotaResetAt      *string
	LastUsedAt        *string
	LastTestedAt      *string
	Extra             string
	CreatedAt         string
	UpdatedAt         string
	DeletedAt         *string
}

type CreateProviderAccountParams struct {
	Name              string
	Provider          string
	AuthType          string
	BaseURL           string
	SecretEncrypted   *string
	SecretHint        string
	Priority          int
	Weight            int
	ConcurrencyLimit  int
	RequestsPerMinute int
	TokensPerMinute   int
	Extra             string
}

type UpdateProviderAccountParams struct {
	Name              *string
	Provider          *string
	AuthType          *string
	BaseURL           *string
	SecretEncrypted   *string
	SecretHint        *string
	Priority          *int
	Weight            *int
	ConcurrencyLimit  *int
	RequestsPerMinute *int
	TokensPerMinute   *int
	IsActive          *bool
	Schedulable       *bool
	Status            *string
	ErrorMessage      *string
	RateLimitedUntil  *string
	QuotaResetAt      *string
	Extra             *string
}

func (d *DB) CreateProviderAccount(ctx context.Context, params CreateProviderAccountParams) (*ProviderAccount, error) {
	id, err := uuid.NewV7()
	if err != nil {
		return nil, fmt.Errorf("create provider account: generate id: %w", err)
	}

	authType := params.AuthType
	if authType == "" {
		authType = "api_key"
	}
	weight := params.Weight
	if weight < 1 {
		weight = 1
	}
	priority := params.Priority
	if priority == 0 {
		priority = 50
	}
	extra := params.Extra
	if strings.TrimSpace(extra) == "" {
		extra = "{}"
	}

	p := d.dialect.Placeholder
	query := "INSERT INTO provider_accounts (" +
		"id, name, provider, auth_type, base_url, secret_encrypted, secret_hint, " +
		"priority, weight, concurrency_limit, requests_per_minute, tokens_per_minute, extra, created_at, updated_at" +
		") VALUES (" +
		p(1) + ", " + p(2) + ", " + p(3) + ", " + p(4) + ", " + p(5) + ", " + p(6) + ", " + p(7) + ", " +
		p(8) + ", " + p(9) + ", " + p(10) + ", " + p(11) + ", " + p(12) + ", " + p(13) + ", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"

	selectQuery := "SELECT " + providerAccountSelectColumns + " FROM provider_accounts WHERE id = " + p(1)
	var account *ProviderAccount
	err = d.WithTx(ctx, func(q Querier) error {
		if _, execErr := q.ExecContext(ctx, query,
			id.String(), params.Name, params.Provider, authType, params.BaseURL, params.SecretEncrypted, params.SecretHint,
			priority, weight, params.ConcurrencyLimit, params.RequestsPerMinute, params.TokensPerMinute, extra,
		); execErr != nil {
			return translateError(execErr)
		}
		row := q.QueryRowContext(ctx, selectQuery, id.String())
		var scanErr error
		account, scanErr = scanProviderAccount(row)
		return scanErr
	})
	if err != nil {
		return nil, fmt.Errorf("create provider account: %w", err)
	}
	return account, nil
}

func (d *DB) GetProviderAccount(ctx context.Context, id string) (*ProviderAccount, error) {
	query := "SELECT " + providerAccountSelectColumns + " FROM provider_accounts WHERE id = " + d.dialect.Placeholder(1) + " AND deleted_at IS NULL"
	account, err := scanProviderAccount(d.sql.QueryRowContext(ctx, query, id))
	if err != nil {
		return nil, fmt.Errorf("get provider account %s: %w", id, translateError(err))
	}
	return account, nil
}

func (d *DB) ListProviderAccounts(ctx context.Context, cursor string, limit int) ([]ProviderAccount, error) {
	if limit <= 0 {
		limit = 50
	}
	p := d.dialect.Placeholder
	args := []any{}
	conditions := []string{"deleted_at IS NULL"}
	if cursor != "" {
		conditions = append(conditions, "id > "+p(len(args)+1))
		args = append(args, cursor)
	}
	args = append(args, limit)
	query := "SELECT " + providerAccountSelectColumns + " FROM provider_accounts WHERE " + strings.Join(conditions, " AND ") +
		" ORDER BY id ASC LIMIT " + p(len(args))

	rows, err := d.sql.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("list provider accounts query: %w", err)
	}
	defer rows.Close()

	var accounts []ProviderAccount
	for rows.Next() {
		account, scanErr := scanProviderAccount(rows)
		if scanErr != nil {
			return nil, fmt.Errorf("list provider accounts scan: %w", scanErr)
		}
		accounts = append(accounts, *account)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("list provider accounts rows: %w", err)
	}
	return accounts, nil
}

func (d *DB) UpdateProviderAccount(ctx context.Context, id string, params UpdateProviderAccountParams) (*ProviderAccount, error) {
	set := []string{}
	args := []any{}
	p := d.dialect.Placeholder

	add := func(column string, value any) {
		args = append(args, value)
		set = append(set, column+" = "+p(len(args)))
	}
	if params.Name != nil {
		add("name", *params.Name)
	}
	if params.Provider != nil {
		add("provider", *params.Provider)
	}
	if params.AuthType != nil {
		add("auth_type", *params.AuthType)
	}
	if params.BaseURL != nil {
		add("base_url", *params.BaseURL)
	}
	if params.SecretEncrypted != nil {
		add("secret_encrypted", *params.SecretEncrypted)
	}
	if params.SecretHint != nil {
		add("secret_hint", *params.SecretHint)
	}
	if params.Priority != nil {
		add("priority", *params.Priority)
	}
	if params.Weight != nil {
		add("weight", *params.Weight)
	}
	if params.ConcurrencyLimit != nil {
		add("concurrency_limit", *params.ConcurrencyLimit)
	}
	if params.RequestsPerMinute != nil {
		add("requests_per_minute", *params.RequestsPerMinute)
	}
	if params.TokensPerMinute != nil {
		add("tokens_per_minute", *params.TokensPerMinute)
	}
	if params.IsActive != nil {
		add("is_active", providerAccountBoolToInt(*params.IsActive))
	}
	if params.Schedulable != nil {
		add("schedulable", providerAccountBoolToInt(*params.Schedulable))
	}
	if params.Status != nil {
		add("status", *params.Status)
	}
	if params.ErrorMessage != nil {
		add("error_message", nullableEmptyString(*params.ErrorMessage))
	}
	if params.RateLimitedUntil != nil {
		add("rate_limited_until", nullableEmptyString(*params.RateLimitedUntil))
	}
	if params.QuotaResetAt != nil {
		add("quota_reset_at", nullableEmptyString(*params.QuotaResetAt))
	}
	if params.Extra != nil {
		add("extra", *params.Extra)
	}
	if len(set) == 0 {
		return d.GetProviderAccount(ctx, id)
	}
	set = append(set, "updated_at = CURRENT_TIMESTAMP")
	args = append(args, id)

	updateQuery := "UPDATE provider_accounts SET " + strings.Join(set, ", ") +
		" WHERE id = " + p(len(args)) + " AND deleted_at IS NULL"
	selectQuery := "SELECT " + providerAccountSelectColumns + " FROM provider_accounts WHERE id = " + p(1) + " AND deleted_at IS NULL"

	var account *ProviderAccount
	err := d.WithTx(ctx, func(q Querier) error {
		res, execErr := q.ExecContext(ctx, updateQuery, args...)
		if execErr != nil {
			return translateError(execErr)
		}
		affected, rowsErr := res.RowsAffected()
		if rowsErr != nil {
			return rowsErr
		}
		if affected == 0 {
			return ErrNotFound
		}
		var scanErr error
		account, scanErr = scanProviderAccount(q.QueryRowContext(ctx, selectQuery, id))
		return scanErr
	})
	if err != nil {
		return nil, fmt.Errorf("update provider account %s: %w", id, err)
	}
	return account, nil
}

func (d *DB) DeleteProviderAccount(ctx context.Context, id string) error {
	query := "UPDATE provider_accounts SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = " + d.dialect.Placeholder(1) + " AND deleted_at IS NULL"
	res, err := d.sql.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("delete provider account %s: %w", id, translateError(err))
	}
	affected, err := res.RowsAffected()
	if err != nil {
		return fmt.Errorf("delete provider account %s rows affected: %w", id, err)
	}
	if affected == 0 {
		return fmt.Errorf("delete provider account %s: %w", id, ErrNotFound)
	}
	return nil
}

func scanProviderAccount(row interface{ Scan(dest ...any) error }) (*ProviderAccount, error) {
	var a ProviderAccount
	var isActive, schedulable int
	if err := row.Scan(
		&a.ID, &a.Name, &a.Provider, &a.AuthType, &a.BaseURL, &a.SecretEncrypted, &a.SecretHint,
		&a.Priority, &a.Weight, &a.ConcurrencyLimit, &a.RequestsPerMinute, &a.TokensPerMinute,
		&isActive, &schedulable, &a.Status, &a.ErrorMessage, &a.RateLimitedUntil, &a.QuotaResetAt,
		&a.LastUsedAt, &a.LastTestedAt, &a.Extra, &a.CreatedAt, &a.UpdatedAt, &a.DeletedAt,
	); err != nil {
		if err == sql.ErrNoRows {
			return nil, ErrNotFound
		}
		return nil, err
	}
	a.IsActive = isActive != 0
	a.Schedulable = schedulable != 0
	return &a, nil
}

func providerAccountBoolToInt(v bool) int {
	if v {
		return 1
	}
	return 0
}

func nullableEmptyString(v string) any {
	if v == "" {
		return nil
	}
	return v
}
