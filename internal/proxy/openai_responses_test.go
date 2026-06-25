package proxy

import (
	"bytes"
	"testing"

	"github.com/zanellm/zanellm/internal/jsonx"
)

func TestOpenAIResponsesTransformRequest(t *testing.T) {
	a := &OpenAIResponsesAdapter{}
	body := []byte(`{
		"model":"gpt-5.5",
		"messages":[
			{"role":"system","content":"be exact"},
			{"role":"user","content":"say ok"}
		],
		"stream":true,
		"max_tokens":16
	}`)

	out, err := a.TransformRequest(body, Model{})
	if err != nil {
		t.Fatalf("TransformRequest() error = %v", err)
	}

	var got struct {
		Model           string `json:"model"`
		Instructions    string `json:"instructions"`
		Stream          bool   `json:"stream"`
		Store           bool   `json:"store"`
		MaxOutputTokens int    `json:"max_output_tokens"`
		Input           []struct {
			Role    string `json:"role"`
			Content string `json:"content"`
		} `json:"input"`
	}
	if err := jsonx.Unmarshal(out, &got); err != nil {
		t.Fatalf("unmarshal transformed request: %v\n%s", err, out)
	}
	if got.Model != "gpt-5.5" || got.Instructions != "be exact" || !got.Stream || got.Store || got.MaxOutputTokens != 16 {
		t.Fatalf("unexpected transformed request: %+v", got)
	}
	if len(got.Input) != 1 || got.Input[0].Role != "user" || got.Input[0].Content != "say ok" {
		t.Fatalf("unexpected input: %+v", got.Input)
	}
}

func TestOpenAIResponsesTransformResponse(t *testing.T) {
	a := &OpenAIResponsesAdapter{}
	body := []byte(`{
		"id":"resp_123",
		"model":"gpt-5.5",
		"created_at":1771771771,
		"output":[{"type":"message","content":[{"type":"output_text","text":"zanellm-ok"}]}],
		"usage":{
			"input_tokens":11,
			"output_tokens":3,
			"total_tokens":14,
			"input_tokens_details":{"cached_tokens":5},
			"output_tokens_details":{"reasoning_tokens":2}
		}
	}`)

	out, err := a.TransformResponse(body)
	if err != nil {
		t.Fatalf("TransformResponse() error = %v", err)
	}

	var got struct {
		Object  string `json:"object"`
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
			FinishReason string `json:"finish_reason"`
		} `json:"choices"`
		Usage struct {
			PromptTokens     int `json:"prompt_tokens"`
			CompletionTokens int `json:"completion_tokens"`
			TotalTokens      int `json:"total_tokens"`
			PromptDetails    struct {
				CachedTokens int `json:"cached_tokens"`
			} `json:"prompt_tokens_details"`
			CompletionDetails struct {
				ReasoningTokens int `json:"reasoning_tokens"`
			} `json:"completion_tokens_details"`
		} `json:"usage"`
	}
	if err := jsonx.Unmarshal(out, &got); err != nil {
		t.Fatalf("unmarshal transformed response: %v\n%s", err, out)
	}
	if got.Object != "chat.completion" || got.Choices[0].Message.Content != "zanellm-ok" || got.Choices[0].FinishReason != "stop" {
		t.Fatalf("unexpected transformed response: %+v", got)
	}
	if got.Usage.PromptTokens != 11 || got.Usage.CompletionTokens != 3 || got.Usage.TotalTokens != 14 ||
		got.Usage.PromptDetails.CachedTokens != 5 || got.Usage.CompletionDetails.ReasoningTokens != 2 {
		t.Fatalf("unexpected usage: %+v", got.Usage)
	}
}

func TestOpenAIResponsesTransformStreamLine(t *testing.T) {
	a := &OpenAIResponsesAdapter{}
	lines := [][]byte{
		[]byte(`data: {"type":"response.created","response":{"id":"resp_123","model":"gpt-5.5","created_at":1771771771}}`),
		[]byte(`data: {"type":"response.output_text.delta","delta":"zanellm"}`),
		[]byte(`data: {"type":"response.output_text.delta","delta":"-ok"}`),
		[]byte(`data: {"type":"response.completed","response":{"id":"resp_123","model":"gpt-5.5","created_at":1771771771,"usage":{"input_tokens":4,"output_tokens":2,"total_tokens":6}}}`),
	}

	var out [][]byte
	for _, line := range lines {
		got, err := a.TransformStreamLine(line)
		if err != nil {
			t.Fatalf("TransformStreamLine() error = %v", err)
		}
		out = append(out, got...)
	}

	joined := bytes.Join(out, []byte("\n"))
	if !bytes.Contains(joined, []byte(`"role":"assistant"`)) {
		t.Fatalf("missing assistant role chunk:\n%s", joined)
	}
	if !bytes.Contains(joined, []byte(`"content":"zanellm"`)) || !bytes.Contains(joined, []byte(`"content":"-ok"`)) {
		t.Fatalf("missing delta chunks:\n%s", joined)
	}
	if !bytes.Contains(joined, []byte(`data: [DONE]`)) {
		t.Fatalf("missing DONE:\n%s", joined)
	}
	if ui := a.StreamUsage(); ui.PromptTokens != 4 || ui.CompletionTokens != 2 || ui.TotalTokens != 6 {
		t.Fatalf("StreamUsage() = %+v", ui)
	}
}
