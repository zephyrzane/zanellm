package admin

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/zanellm/zanellm/internal/apierror"
	"github.com/zanellm/zanellm/internal/db"
	"github.com/zanellm/zanellm/internal/provider"
	voidredis "github.com/zanellm/zanellm/internal/redis"
	"github.com/zanellm/zanellm/pkg/crypto"
)

type providerAccountRequest struct {
	Name              string          `json:"name"`
	Provider          string          `json:"provider"`
	AuthType          string          `json:"auth_type"`
	BaseURL           string          `json:"base_url"`
	Secret            string          `json:"secret,omitempty"`
	Priority          int             `json:"priority"`
	Weight            int             `json:"weight"`
	ConcurrencyLimit  int             `json:"concurrency_limit"`
	RequestsPerMinute int             `json:"requests_per_minute"`
	TokensPerMinute   int             `json:"tokens_per_minute"`
	Extra             json.RawMessage `json:"extra,omitempty"`
}

type updateProviderAccountRequest struct {
	Name              *string         `json:"name"`
	Provider          *string         `json:"provider"`
	AuthType          *string         `json:"auth_type"`
	BaseURL           *string         `json:"base_url"`
	Secret            *string         `json:"secret"`
	Priority          *int            `json:"priority"`
	Weight            *int            `json:"weight"`
	ConcurrencyLimit  *int            `json:"concurrency_limit"`
	RequestsPerMinute *int            `json:"requests_per_minute"`
	TokensPerMinute   *int            `json:"tokens_per_minute"`
	IsActive          *bool           `json:"is_active"`
	Schedulable       *bool           `json:"schedulable"`
	Status            *string         `json:"status"`
	ErrorMessage      *string         `json:"error_message"`
	RateLimitedUntil  *string         `json:"rate_limited_until"`
	QuotaResetAt      *string         `json:"quota_reset_at"`
	Extra             json.RawMessage `json:"extra,omitempty"`
}

type providerAccountResponse struct {
	ID                string          `json:"id"`
	Name              string          `json:"name"`
	Provider          string          `json:"provider"`
	AuthType          string          `json:"auth_type"`
	BaseURL           string          `json:"base_url"`
	SecretHint        string          `json:"secret_hint"`
	Priority          int             `json:"priority"`
	Weight            int             `json:"weight"`
	ConcurrencyLimit  int             `json:"concurrency_limit"`
	RequestsPerMinute int             `json:"requests_per_minute"`
	TokensPerMinute   int             `json:"tokens_per_minute"`
	IsActive          bool            `json:"is_active"`
	Schedulable       bool            `json:"schedulable"`
	Status            string          `json:"status"`
	ErrorMessage      *string         `json:"error_message,omitempty"`
	RateLimitedUntil  *string         `json:"rate_limited_until,omitempty"`
	QuotaResetAt      *string         `json:"quota_reset_at,omitempty"`
	LastUsedAt        *string         `json:"last_used_at,omitempty"`
	LastTestedAt      *string         `json:"last_tested_at,omitempty"`
	Extra             json.RawMessage `json:"extra"`
	CreatedAt         string          `json:"created_at"`
	UpdatedAt         string          `json:"updated_at"`
}

type paginatedProviderAccountsResponse struct {
	Data    []providerAccountResponse `json:"data"`
	HasMore bool                      `json:"has_more"`
	Cursor  string                    `json:"next_cursor,omitempty"`
}

type importProviderModelsResponse struct {
	Imported []string `json:"imported"`
	Updated  []string `json:"updated"`
	Skipped  []string `json:"skipped"`
}

type upstreamModelsResponse struct {
	Data []struct {
		ID string `json:"id"`
	} `json:"data"`
}

func providerAccountAAD(id string) []byte {
	return []byte("provider_account:" + id)
}

func secretHint(secret string) string {
	secret = strings.TrimSpace(secret)
	if secret == "" {
		return ""
	}
	if len(secret) <= 8 {
		return "****"
	}
	return secret[:4] + "..." + secret[len(secret)-4:]
}

func extraJSON(raw json.RawMessage) (string, error) {
	if len(raw) == 0 {
		return "{}", nil
	}
	var v any
	if err := json.Unmarshal(raw, &v); err != nil {
		return "", err
	}
	out, err := json.Marshal(v)
	if err != nil {
		return "", err
	}
	return string(out), nil
}

func providerAccountToResponse(a *db.ProviderAccount) providerAccountResponse {
	raw := json.RawMessage(a.Extra)
	if !json.Valid(raw) {
		raw = json.RawMessage(`{}`)
	}
	return providerAccountResponse{
		ID:                a.ID,
		Name:              a.Name,
		Provider:          a.Provider,
		AuthType:          a.AuthType,
		BaseURL:           a.BaseURL,
		SecretHint:        a.SecretHint,
		Priority:          a.Priority,
		Weight:            a.Weight,
		ConcurrencyLimit:  a.ConcurrencyLimit,
		RequestsPerMinute: a.RequestsPerMinute,
		TokensPerMinute:   a.TokensPerMinute,
		IsActive:          a.IsActive,
		Schedulable:       a.Schedulable,
		Status:            a.Status,
		ErrorMessage:      a.ErrorMessage,
		RateLimitedUntil:  a.RateLimitedUntil,
		QuotaResetAt:      a.QuotaResetAt,
		LastUsedAt:        a.LastUsedAt,
		LastTestedAt:      a.LastTestedAt,
		Extra:             raw,
		CreatedAt:         a.CreatedAt,
		UpdatedAt:         a.UpdatedAt,
	}
}

func providerModelsURL(account *db.ProviderAccount) (string, error) {
	baseURL := account.BaseURL
	baseURL = strings.TrimRight(strings.TrimSpace(baseURL), "/")
	if baseURL == "" {
		return "", fmt.Errorf("base_url is required")
	}
	u, err := url.Parse(baseURL)
	if err != nil || u.Scheme == "" || u.Host == "" {
		return "", fmt.Errorf("base_url must be an absolute URL")
	}
	if strings.HasSuffix(strings.TrimRight(u.Path, "/"), "/models") {
		return u.String(), nil
	}
	path := strings.TrimRight(u.Path, "/")
	if account.Provider == "anthropic" && path == "" {
		path = "/v1"
	}
	u.Path = path + "/models"
	u.RawQuery = ""
	u.Fragment = ""
	return u.String(), nil
}

func adapterProvider(accountProvider string) string {
	if provider.ValidProviders[accountProvider] {
		return accountProvider
	}
	return "custom"
}

func inferModelType(modelID string) string {
	lower := strings.ToLower(modelID)
	switch {
	case strings.Contains(lower, "embedding") || strings.Contains(lower, "embed"):
		return "embedding"
	case strings.Contains(lower, "rerank"):
		return "reranking"
	case strings.Contains(lower, "whisper") || strings.Contains(lower, "transcrib"):
		return "audio_transcription"
	case strings.Contains(lower, "tts"):
		return "tts"
	case strings.HasPrefix(lower, "gpt-image") ||
		strings.Contains(lower, "image") ||
		strings.Contains(lower, "imagen") ||
		strings.Contains(lower, "dall-e"):
		return "image"
	default:
		return "chat"
	}
}

var openAIImageModelIDs = []string{
	"gpt-image-2",
	"gpt-image-latest",
	"gpt-image-1.5",
	"gpt-image-1",
	"gpt-image-1-mini",
	"chatgpt-image-latest",
	"dall-e-3",
	"dall-e-2",
}

func includeOpenAIImageCatalog(providerName string) bool {
	switch providerName {
	case "openai", "openai_responses", "custom":
		return true
	default:
		return false
	}
}

func withOpenAIImageModels(providerName string, modelIDs []string) []string {
	if !includeOpenAIImageCatalog(providerName) {
		return modelIDs
	}
	seen := make(map[string]struct{}, len(modelIDs)+len(openAIImageModelIDs))
	out := make([]string, 0, len(modelIDs)+len(openAIImageModelIDs))
	for _, id := range modelIDs {
		id = strings.TrimSpace(id)
		if id == "" {
			continue
		}
		if _, ok := seen[id]; ok {
			continue
		}
		seen[id] = struct{}{}
		out = append(out, id)
	}
	for _, id := range openAIImageModelIDs {
		if _, ok := seen[id]; ok {
			continue
		}
		seen[id] = struct{}{}
		out = append(out, id)
	}
	return out
}

func importedModelAliases(modelID string) string {
	switch modelID {
	case "gpt-image-2":
		return "gpt-image-latest"
	default:
		return ""
	}
}

func (h *Handler) decryptProviderAccountSecret(account *db.ProviderAccount) (string, error) {
	if account.SecretEncrypted == nil || *account.SecretEncrypted == "" {
		return "", nil
	}
	secret, err := crypto.DecryptString(*account.SecretEncrypted, h.EncryptionKey, providerAccountAAD(account.ID))
	if err != nil {
		return "", err
	}
	return secret, nil
}

func (h *Handler) fetchProviderModelIDs(ctx context.Context, account *db.ProviderAccount, secret string) ([]string, error) {
	modelsURL, err := providerModelsURL(account)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, modelsURL, nil)
	if err != nil {
		return nil, err
	}
	if secret = strings.TrimSpace(secret); secret != "" {
		if account.Provider == "anthropic" {
			req.Header.Set("x-api-key", secret)
			req.Header.Set("anthropic-version", "2023-06-01")
		} else {
			req.Header.Set("Authorization", "Bearer "+secret)
		}
	}
	req.Header.Set("Accept", "application/json")

	client := &http.Client{Timeout: 20 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(io.LimitReader(resp.Body, 4<<20))
	if err != nil {
		return nil, err
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("upstream models returned %d: %s", resp.StatusCode, strings.TrimSpace(string(body)))
	}

	var parsed upstreamModelsResponse
	if err := json.Unmarshal(body, &parsed); err != nil {
		return nil, err
	}
	seen := map[string]struct{}{}
	ids := make([]string, 0, len(parsed.Data))
	for _, item := range parsed.Data {
		id := strings.TrimSpace(item.ID)
		if id == "" {
			continue
		}
		if _, ok := seen[id]; ok {
			continue
		}
		seen[id] = struct{}{}
		ids = append(ids, id)
	}
	return ids, nil
}

func (h *Handler) upsertImportedModel(ctx context.Context, account *db.ProviderAccount, secret string, modelID string) (string, error) {
	modelType := inferModelType(modelID)
	modelProvider := adapterProvider(account.Provider)
	baseURL := strings.TrimRight(account.BaseURL, "/")
	encrypted := ""

	existing, err := h.DB.GetModelByName(ctx, modelID)
	if err == nil {
		if secret != "" {
			enc, encErr := crypto.EncryptString(secret, h.EncryptionKey, modelAAD(existing.ID))
			if encErr != nil {
				return "", encErr
			}
			encrypted = enc
		}
		params := db.UpdateModelParams{
			Provider:  &modelProvider,
			ModelType: &modelType,
			BaseURL:   &baseURL,
		}
		if aliases := importedModelAliases(modelID); aliases != "" {
			params.Aliases = &aliases
		}
		if secret != "" {
			params.APIKeyEncrypted = &encrypted
		}
		updated, updateErr := h.DB.UpdateModel(ctx, existing.ID, params)
		if updateErr != nil {
			return "", updateErr
		}
		plaintext := secret
		if plaintext == "" {
			var decErr error
			plaintext, decErr = h.decryptModelAPIKey(updated)
			if decErr != nil {
				plaintext = ""
			}
		}
		h.Registry.AddModel(dbModelToProxy(updated, plaintext, h.resolveFallbackName(ctx, updated.FallbackModelID)))
		return "updated", nil
	}
	if !errors.Is(err, db.ErrNotFound) {
		return "", err
	}

	created, err := h.DB.CreateModel(ctx, db.CreateModelParams{
		Name:             modelID,
		Provider:         modelProvider,
		ModelType:        &modelType,
		BaseURL:          baseURL,
		MaxContextTokens: 0,
		Source:           "provider_account",
		Aliases:          importedModelAliases(modelID),
	})
	if err != nil {
		if errors.Is(err, db.ErrConflict) {
			return "skipped", nil
		}
		return "", err
	}
	if secret != "" {
		enc, encErr := crypto.EncryptString(secret, h.EncryptionKey, modelAAD(created.ID))
		if encErr != nil {
			return "", encErr
		}
		created, err = h.DB.UpdateModel(ctx, created.ID, db.UpdateModelParams{APIKeyEncrypted: &enc})
		if err != nil {
			return "", err
		}
	}
	h.Registry.AddModel(dbModelToProxy(created, secret, ""))
	return "imported", nil
}

func (h *Handler) importProviderModels(ctx context.Context, account *db.ProviderAccount) (importProviderModelsResponse, error) {
	var result importProviderModelsResponse
	secret, err := h.decryptProviderAccountSecret(account)
	if err != nil {
		return result, fmt.Errorf("decrypt provider account secret: %w", err)
	}
	modelIDs, err := h.fetchProviderModelIDs(ctx, account, secret)
	if err != nil {
		return result, err
	}
	modelIDs = withOpenAIImageModels(account.Provider, modelIDs)
	for _, modelID := range modelIDs {
		action, upsertErr := h.upsertImportedModel(ctx, account, secret, modelID)
		if upsertErr != nil {
			h.Log.WarnContext(ctx, "import provider model failed", slog.String("model", modelID), slog.String("error", upsertErr.Error()))
			result.Skipped = append(result.Skipped, modelID)
			continue
		}
		switch action {
		case "imported":
			result.Imported = append(result.Imported, modelID)
		case "updated":
			result.Updated = append(result.Updated, modelID)
		default:
			result.Skipped = append(result.Skipped, modelID)
		}
	}
	if h.Redis != nil {
		if pubErr := h.Redis.PublishInvalidation(ctx, voidredis.ChannelModels, "reload"); pubErr != nil {
			h.Log.WarnContext(ctx, "import provider models: publish invalidation", slog.String("error", pubErr.Error()))
		}
	}
	return result, nil
}

func validateProviderAccount(name, provider, authType string) string {
	if strings.TrimSpace(name) == "" {
		return "name is required"
	}
	if strings.TrimSpace(provider) == "" {
		return "provider is required"
	}
	if authType == "" {
		return ""
	}
	switch authType {
	case "api_key", "oauth", "cli", "session", "none":
		return ""
	default:
		return "auth_type must be one of: api_key, oauth, cli, session, none"
	}
}

func (h *Handler) CreateProviderAccount(c fiber.Ctx) error {
	ctx := c.Context()
	var req providerAccountRequest
	if err := c.Bind().JSON(&req); err != nil {
		return apierror.BadRequest(c, "invalid request body")
	}
	if msg := validateProviderAccount(req.Name, req.Provider, req.AuthType); msg != "" {
		return apierror.BadRequest(c, msg)
	}
	extra, err := extraJSON(req.Extra)
	if err != nil {
		return apierror.BadRequest(c, "extra must be valid JSON")
	}

	account, err := h.DB.CreateProviderAccount(ctx, db.CreateProviderAccountParams{
		Name:              strings.TrimSpace(req.Name),
		Provider:          strings.TrimSpace(req.Provider),
		AuthType:          strings.TrimSpace(req.AuthType),
		BaseURL:           strings.TrimSpace(req.BaseURL),
		Priority:          req.Priority,
		Weight:            req.Weight,
		ConcurrencyLimit:  req.ConcurrencyLimit,
		RequestsPerMinute: req.RequestsPerMinute,
		TokensPerMinute:   req.TokensPerMinute,
		Extra:             extra,
	})
	if err != nil {
		h.Log.ErrorContext(ctx, "create provider account", slog.String("error", err.Error()))
		return apierror.InternalError(c, "failed to create provider account")
	}
	if strings.TrimSpace(req.Secret) != "" {
		enc, encErr := crypto.EncryptString(req.Secret, h.EncryptionKey, providerAccountAAD(account.ID))
		if encErr != nil {
			h.Log.ErrorContext(ctx, "encrypt provider account secret", slog.String("error", encErr.Error()))
			return apierror.InternalError(c, "failed to encrypt provider account secret")
		}
		hint := secretHint(req.Secret)
		account, err = h.DB.UpdateProviderAccount(ctx, account.ID, db.UpdateProviderAccountParams{
			SecretEncrypted: &enc,
			SecretHint:      &hint,
		})
		if err != nil {
			h.Log.ErrorContext(ctx, "store provider account secret", slog.String("error", err.Error()))
			return apierror.InternalError(c, "failed to store provider account secret")
		}
	}
	return c.Status(fiber.StatusCreated).JSON(providerAccountToResponse(account))
}

func (h *Handler) ListProviderAccounts(c fiber.Ctx) error {
	p, err := parsePagination(c)
	if err != nil {
		return apierror.BadRequest(c, err.Error())
	}
	accounts, err := h.DB.ListProviderAccounts(c.Context(), p.Cursor, p.Limit+1)
	if err != nil {
		h.Log.ErrorContext(c.Context(), "list provider accounts", slog.String("error", err.Error()))
		return apierror.InternalError(c, "failed to list provider accounts")
	}
	hasMore := len(accounts) > p.Limit
	if hasMore {
		accounts = accounts[:p.Limit]
	}
	resp := paginatedProviderAccountsResponse{Data: make([]providerAccountResponse, len(accounts)), HasMore: hasMore}
	for i := range accounts {
		resp.Data[i] = providerAccountToResponse(&accounts[i])
	}
	if hasMore && len(accounts) > 0 {
		resp.Cursor = accounts[len(accounts)-1].ID
	}
	return c.JSON(resp)
}

func (h *Handler) UpdateProviderAccount(c fiber.Ctx) error {
	ctx := c.Context()
	id := c.Params("account_id")
	var req updateProviderAccountRequest
	if err := c.Bind().JSON(&req); err != nil {
		return apierror.BadRequest(c, "invalid request body")
	}
	params := db.UpdateProviderAccountParams{
		Name:              trimStringPtr(req.Name),
		Provider:          trimStringPtr(req.Provider),
		AuthType:          trimStringPtr(req.AuthType),
		BaseURL:           trimStringPtr(req.BaseURL),
		Priority:          req.Priority,
		Weight:            req.Weight,
		ConcurrencyLimit:  req.ConcurrencyLimit,
		RequestsPerMinute: req.RequestsPerMinute,
		TokensPerMinute:   req.TokensPerMinute,
		IsActive:          req.IsActive,
		Schedulable:       req.Schedulable,
		Status:            trimStringPtr(req.Status),
		ErrorMessage:      req.ErrorMessage,
		RateLimitedUntil:  trimStringPtr(req.RateLimitedUntil),
		QuotaResetAt:      trimStringPtr(req.QuotaResetAt),
	}
	if params.Name != nil || params.Provider != nil || params.AuthType != nil {
		name := ""
		provider := ""
		authType := ""
		current, err := h.DB.GetProviderAccount(ctx, id)
		if err == nil {
			name, provider, authType = current.Name, current.Provider, current.AuthType
		}
		if params.Name != nil {
			name = *params.Name
		}
		if params.Provider != nil {
			provider = *params.Provider
		}
		if params.AuthType != nil {
			authType = *params.AuthType
		}
		if msg := validateProviderAccount(name, provider, authType); msg != "" {
			return apierror.BadRequest(c, msg)
		}
	}
	if len(req.Extra) > 0 {
		extra, err := extraJSON(req.Extra)
		if err != nil {
			return apierror.BadRequest(c, "extra must be valid JSON")
		}
		params.Extra = &extra
	}
	if req.Secret != nil {
		if strings.TrimSpace(*req.Secret) == "" {
			empty := ""
			params.SecretEncrypted = &empty
			params.SecretHint = &empty
		} else {
			enc, encErr := crypto.EncryptString(*req.Secret, h.EncryptionKey, providerAccountAAD(id))
			if encErr != nil {
				h.Log.ErrorContext(ctx, "encrypt provider account secret", slog.String("error", encErr.Error()))
				return apierror.InternalError(c, "failed to encrypt provider account secret")
			}
			hint := secretHint(*req.Secret)
			params.SecretEncrypted = &enc
			params.SecretHint = &hint
		}
	}
	account, err := h.DB.UpdateProviderAccount(ctx, id, params)
	if err != nil {
		if errors.Is(err, db.ErrNotFound) {
			return apierror.NotFound(c, "provider account not found")
		}
		h.Log.ErrorContext(ctx, "update provider account", slog.String("error", err.Error()))
		return apierror.InternalError(c, "failed to update provider account")
	}
	return c.JSON(providerAccountToResponse(account))
}

func (h *Handler) DeleteProviderAccount(c fiber.Ctx) error {
	err := h.DB.DeleteProviderAccount(c.Context(), c.Params("account_id"))
	if err != nil {
		if errors.Is(err, db.ErrNotFound) {
			return apierror.NotFound(c, "provider account not found")
		}
		h.Log.ErrorContext(c.Context(), "delete provider account", slog.String("error", err.Error()))
		return apierror.InternalError(c, "failed to delete provider account")
	}
	return c.SendStatus(fiber.StatusNoContent)
}

func (h *Handler) ImportProviderAccountModels(c fiber.Ctx) error {
	ctx := c.Context()
	account, err := h.DB.GetProviderAccount(ctx, c.Params("account_id"))
	if err != nil {
		if errors.Is(err, db.ErrNotFound) {
			return apierror.NotFound(c, "provider account not found")
		}
		h.Log.ErrorContext(ctx, "import provider models: get account", slog.String("error", err.Error()))
		return apierror.InternalError(c, "failed to get provider account")
	}
	result, err := h.importProviderModels(ctx, account)
	if err != nil {
		if strings.Contains(err.Error(), "decrypt provider account secret") {
			return apierror.BadRequest(c, "stored account secret cannot be decrypted; re-enter the account secret")
		}
		return apierror.BadRequest(c, "failed to import provider models: "+err.Error())
	}
	return c.JSON(result)
}

func trimStringPtr(v *string) *string {
	if v == nil {
		return nil
	}
	out := strings.TrimSpace(*v)
	return &out
}
