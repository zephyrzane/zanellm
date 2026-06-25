package proxy

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/zanellm/zanellm/internal/jsonx"
)

// OpenAIResponsesAdapter lets OpenAI-compatible chat clients use an upstream
// that exposes only the OpenAI Responses API.
type OpenAIResponsesAdapter struct {
	streamID      string
	streamModel   string
	streamCreated int64
	streamUsage   UsageInfo
}

type responsesChatRequest struct {
	Model               string                      `json:"model"`
	Messages            []responsesMessage          `json:"messages"`
	Stream              bool                        `json:"stream,omitempty"`
	MaxTokens           *int                        `json:"max_tokens,omitempty"`
	MaxCompletionTokens *int                        `json:"max_completion_tokens,omitempty"`
	Temperature         *float64                    `json:"temperature,omitempty"`
	TopP                *float64                    `json:"top_p,omitempty"`
	Input               jsonx.RawMessage            `json:"input,omitempty"`
	Instructions        string                      `json:"instructions,omitempty"`
	Extra               map[string]jsonx.RawMessage `json:"-"`
}

type responsesMessage struct {
	Role    string           `json:"role"`
	Content jsonx.RawMessage `json:"content"`
}

type responsesCreateRequest struct {
	Model           string   `json:"model"`
	Input           any      `json:"input"`
	Instructions    string   `json:"instructions,omitempty"`
	Stream          bool     `json:"stream,omitempty"`
	Store           bool     `json:"store"`
	MaxOutputTokens *int     `json:"max_output_tokens,omitempty"`
	Temperature     *float64 `json:"temperature,omitempty"`
	TopP            *float64 `json:"top_p,omitempty"`
}

// TransformRequest converts Chat Completions JSON into the Responses create
// shape. If the caller already sent a Responses-shaped body, it is forwarded.
func (a *OpenAIResponsesAdapter) TransformRequest(body []byte, _ Model) ([]byte, error) {
	var raw map[string]jsonx.RawMessage
	if err := jsonx.Unmarshal(body, &raw); err != nil {
		return nil, fmt.Errorf("openai responses transform request: unmarshal: %w", err)
	}
	if _, ok := raw["input"]; ok {
		return body, nil
	}

	var req responsesChatRequest
	if err := jsonx.Unmarshal(body, &req); err != nil {
		return nil, fmt.Errorf("openai responses transform request: unmarshal chat: %w", err)
	}
	if req.Model == "" {
		return nil, fmt.Errorf("openai responses transform request: model is required")
	}
	if len(req.Messages) == 0 {
		return nil, fmt.Errorf("openai responses transform request: messages are required")
	}

	input := make([]map[string]any, 0, len(req.Messages))
	var instructions []string
	for _, msg := range req.Messages {
		role := strings.ToLower(msg.Role)
		if role == "system" || role == "developer" {
			if text := rawContentText(msg.Content); text != "" {
				instructions = append(instructions, text)
			}
			continue
		}
		if role == "" {
			role = "user"
		}
		input = append(input, map[string]any{
			"role":    role,
			"content": rawContentValue(msg.Content),
		})
	}
	if len(input) == 0 {
		input = append(input, map[string]any{
			"role":    "user",
			"content": strings.Join(instructions, "\n\n"),
		})
		instructions = nil
	}

	maxOutputTokens := req.MaxCompletionTokens
	if maxOutputTokens == nil {
		maxOutputTokens = req.MaxTokens
	}

	out := responsesCreateRequest{
		Model:           req.Model,
		Input:           input,
		Instructions:    strings.Join(instructions, "\n\n"),
		Stream:          req.Stream,
		Store:           false,
		MaxOutputTokens: maxOutputTokens,
		Temperature:     req.Temperature,
		TopP:            req.TopP,
	}
	encoded, err := jsonx.Marshal(out)
	if err != nil {
		return nil, fmt.Errorf("openai responses transform request: marshal: %w", err)
	}
	return encoded, nil
}

func (a *OpenAIResponsesAdapter) TransformURL(baseURL, upstreamPath string, _ Model) string {
	base := strings.TrimRight(baseURL, "/")
	if upstreamPath == "chat/completions" {
		return base + "/responses"
	}
	return base + "/" + upstreamPath
}

func (a *OpenAIResponsesAdapter) SetHeaders(req *http.Request, _ Model) {
	req.Header.Set("Content-Type", "application/json")
}

type responsesResponse struct {
	ID         string                `json:"id"`
	Model      string                `json:"model"`
	CreatedAt  int64                 `json:"created_at"`
	OutputText string                `json:"output_text"`
	Output     []responsesOutputItem `json:"output"`
	Usage      *responsesUsage       `json:"usage"`
}

type responsesOutputItem struct {
	Type    string                   `json:"type"`
	Content []responsesOutputContent `json:"content"`
}

type responsesOutputContent struct {
	Type string `json:"type"`
	Text string `json:"text"`
}

type responsesUsage struct {
	InputTokens        int `json:"input_tokens"`
	OutputTokens       int `json:"output_tokens"`
	TotalTokens        int `json:"total_tokens"`
	InputTokensDetails *struct {
		CachedTokens int `json:"cached_tokens"`
	} `json:"input_tokens_details"`
	OutputTokensDetails *struct {
		ReasoningTokens int `json:"reasoning_tokens"`
	} `json:"output_tokens_details"`
}

func (a *OpenAIResponsesAdapter) TransformResponse(body []byte) ([]byte, error) {
	var resp responsesResponse
	if err := jsonx.Unmarshal(body, &resp); err != nil {
		return nil, fmt.Errorf("openai responses transform response: unmarshal: %w", err)
	}
	if resp.CreatedAt == 0 {
		resp.CreatedAt = time.Now().Unix()
	}
	content := resp.OutputText
	if content == "" {
		content = collectResponseText(resp.Output)
	}
	out := map[string]any{
		"id":      resp.ID,
		"object":  "chat.completion",
		"created": resp.CreatedAt,
		"model":   resp.Model,
		"choices": []map[string]any{{
			"index": 0,
			"message": map[string]any{
				"role":    "assistant",
				"content": content,
			},
			"finish_reason": "stop",
		}},
	}
	if resp.Usage != nil {
		out["usage"] = responsesUsageToOpenAI(resp.Usage)
	}
	encoded, err := jsonx.Marshal(out)
	if err != nil {
		return nil, fmt.Errorf("openai responses transform response: marshal: %w", err)
	}
	return encoded, nil
}

func (a *OpenAIResponsesAdapter) TransformStreamLine(line []byte) ([][]byte, error) {
	if len(line) == 0 || strings.HasPrefix(string(line), "event:") {
		return nil, nil
	}
	if !strings.HasPrefix(string(line), "data: ") {
		return nil, nil
	}
	data := strings.TrimSpace(string(line[len("data: "):]))
	if data == "[DONE]" {
		return [][]byte{[]byte("data: [DONE]")}, nil
	}

	var evt struct {
		Type     string             `json:"type"`
		Delta    string             `json:"delta"`
		Response *responsesResponse `json:"response"`
	}
	if err := jsonx.Unmarshal([]byte(data), &evt); err != nil {
		return nil, fmt.Errorf("openai responses stream: unmarshal: %w", err)
	}

	switch evt.Type {
	case "response.created":
		if evt.Response != nil {
			a.streamID = evt.Response.ID
			a.streamModel = evt.Response.Model
			a.streamCreated = evt.Response.CreatedAt
		}
		return [][]byte{a.chatChunk(map[string]any{"role": "assistant"}, nil, nil)}, nil
	case "response.output_text.delta":
		if evt.Delta == "" {
			return nil, nil
		}
		return [][]byte{a.chatChunk(map[string]any{"content": evt.Delta}, nil, nil)}, nil
	case "response.completed":
		if evt.Response != nil {
			if evt.Response.Usage != nil {
				a.streamUsage = responsesUsageInfo(evt.Response.Usage)
			}
			if a.streamID == "" {
				a.streamID = evt.Response.ID
			}
			if a.streamModel == "" {
				a.streamModel = evt.Response.Model
			}
			if a.streamCreated == 0 {
				a.streamCreated = evt.Response.CreatedAt
			}
		}
		usage := any(nil)
		if a.streamUsage.TotalTokens > 0 {
			usage = openAIUsageFromInfo(a.streamUsage)
		}
		return [][]byte{
			a.chatChunk(map[string]any{}, stringPtr("stop"), usage),
			[]byte("data: [DONE]"),
		}, nil
	case "response.failed", "response.incomplete":
		return nil, errStreamTransformAborted
	default:
		return nil, nil
	}
}

func (a *OpenAIResponsesAdapter) StreamUsage() UsageInfo {
	return a.streamUsage
}

func (a *OpenAIResponsesAdapter) chatChunk(delta map[string]any, finishReason *string, usage any) []byte {
	if a.streamCreated == 0 {
		a.streamCreated = time.Now().Unix()
	}
	if a.streamID == "" {
		a.streamID = "resp_stream_" + strconv.FormatInt(a.streamCreated, 10)
	}
	chunk := map[string]any{
		"id":      a.streamID,
		"object":  "chat.completion.chunk",
		"created": a.streamCreated,
		"model":   a.streamModel,
		"choices": []map[string]any{{
			"index":         0,
			"delta":         delta,
			"finish_reason": finishReason,
		}},
	}
	if usage != nil {
		chunk["usage"] = usage
	}
	encoded, _ := jsonx.Marshal(chunk)
	return append([]byte("data: "), encoded...)
}

func rawContentValue(raw jsonx.RawMessage) any {
	var v any
	if len(raw) == 0 || jsonx.Unmarshal(raw, &v) != nil {
		return ""
	}
	return v
}

func rawContentText(raw jsonx.RawMessage) string {
	var s string
	if jsonx.Unmarshal(raw, &s) == nil {
		return s
	}
	var parts []struct {
		Type string `json:"type"`
		Text string `json:"text"`
	}
	if jsonx.Unmarshal(raw, &parts) == nil {
		out := make([]string, 0, len(parts))
		for _, p := range parts {
			if p.Text != "" {
				out = append(out, p.Text)
			}
		}
		return strings.Join(out, "\n")
	}
	return ""
}

func collectResponseText(items []responsesOutputItem) string {
	var parts []string
	for _, item := range items {
		for _, content := range item.Content {
			if content.Text != "" {
				parts = append(parts, content.Text)
			}
		}
	}
	return strings.Join(parts, "")
}

func responsesUsageToOpenAI(u *responsesUsage) map[string]any {
	info := responsesUsageInfo(u)
	return openAIUsageFromInfo(info)
}

func responsesUsageInfo(u *responsesUsage) UsageInfo {
	if u == nil {
		return UsageInfo{}
	}
	info := UsageInfo{
		PromptTokens:     u.InputTokens,
		CompletionTokens: u.OutputTokens,
		TotalTokens:      u.TotalTokens,
	}
	if u.InputTokensDetails != nil {
		info.CacheReadTokens = u.InputTokensDetails.CachedTokens
	}
	if u.OutputTokensDetails != nil {
		info.ReasoningTokens = u.OutputTokensDetails.ReasoningTokens
	}
	return info
}

func openAIUsageFromInfo(info UsageInfo) map[string]any {
	return map[string]any{
		"prompt_tokens":     info.PromptTokens,
		"completion_tokens": info.CompletionTokens,
		"total_tokens":      info.TotalTokens,
		"prompt_tokens_details": map[string]any{
			"cached_tokens": info.CacheReadTokens,
		},
		"completion_tokens_details": map[string]any{
			"reasoning_tokens": info.ReasoningTokens,
		},
	}
}

func stringPtr(s string) *string {
	return &s
}
