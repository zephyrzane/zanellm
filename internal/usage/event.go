// Package usage provides async usage event logging for the proxy hot path.
// Events are enqueued via Log() (non-blocking) and written to the database
// in batches by a background goroutine.
package usage

// Event represents a single proxy request for usage tracking. All fields are
// populated by the proxy handler immediately after the response is sent; none
// of them are computed inside the logger.
type Event struct {
	// KeyID is the unique identifier of the API key that made the request.
	KeyID string
	// KeyType is the category of the key: user_key, team_key, or sa_key.
	KeyType string
	// OrgID is the organization the key belongs to.
	OrgID string
	// TeamID is the team the key is scoped to. Empty if not team-scoped.
	TeamID string
	// UserID is the user the key belongs to. Empty if not user-scoped.
	UserID string
	// ServiceAccountID is the service account the key belongs to. Empty if not a SA key.
	ServiceAccountID string
	// ModelName is the canonical upstream model name that actually served the request.
	// When fallback is active, this is the fallback model's name.
	ModelName string
	// RequestedModelName is the model name the client originally requested.
	// Equal to ModelName when no fallback occurred. Empty for legacy events.
	RequestedModelName string
	// UpstreamAccountID is the provider account or deployment identity that served the request.
	UpstreamAccountID string
	// Provider is the upstream provider family that served the request.
	Provider string
	// RouteName is the logical route or fallback chain name used for this request.
	RouteName string
	// Endpoint is the OpenAI-compatible endpoint, for example /v1/chat/completions.
	Endpoint string
	// PromptTokens is the number of input tokens consumed.
	PromptTokens int
	// CompletionTokens is the number of output tokens produced.
	CompletionTokens int
	// CacheReadTokens is the number of discounted cache-read input tokens.
	CacheReadTokens int
	// CacheWriteTokens is the number of cache-write input tokens.
	CacheWriteTokens int
	// ReasoningTokens is the number of reasoning tokens reported by the upstream.
	ReasoningTokens int
	// TotalTokens is the sum of prompt and completion tokens.
	TotalTokens int
	// CostEstimate is the estimated cost in USD, or nil if pricing is not configured.
	CostEstimate *float64
	// DurationMS is the total request duration in milliseconds.
	DurationMS int
	// TTFT_MS is the time to first token in milliseconds. Nil for non-streaming requests.
	TTFT_MS *int
	// TokensPerSecond is the generation throughput. Nil when unavailable.
	TokensPerSecond *float64
	// StatusCode is the HTTP status code returned to the client.
	StatusCode int
	// RetryCount is the number of same-route retry attempts before success/failure.
	RetryCount int
	// FallbackCount is the number of fallback route hops before success/failure.
	FallbackCount int
	// UpstreamStatusCode is the final HTTP status returned by the upstream.
	UpstreamStatusCode int
	// ErrorClass is a stable low-cardinality error category for metrics.
	ErrorClass string
	// RequestID is the per-request trace ID set by the request ID middleware.
	// It correlates the usage record with the proxy access log and audit log.
	RequestID string
}
