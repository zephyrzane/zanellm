package admin

import "testing"

func TestInferModelType_ImageModels(t *testing.T) {
	for _, modelID := range []string{
		"gpt-image-2",
		"gpt-image-latest",
		"gpt-image-1.5",
		"chatgpt-image-latest",
		"dall-e-3",
	} {
		if got := inferModelType(modelID); got != "image" {
			t.Fatalf("inferModelType(%q) = %q, want image", modelID, got)
		}
	}
}

func TestWithOpenAIImageModels(t *testing.T) {
	got := withOpenAIImageModels("openai", []string{"gpt-5.5", "gpt-image-1"})
	seen := map[string]bool{}
	for _, id := range got {
		if seen[id] {
			t.Fatalf("duplicate model id %q in %v", id, got)
		}
		seen[id] = true
	}
	for _, id := range []string{"gpt-5.5", "gpt-image-2", "gpt-image-latest", "gpt-image-1.5", "gpt-image-1", "chatgpt-image-latest", "dall-e-3", "dall-e-2"} {
		if !seen[id] {
			t.Fatalf("missing model id %q in %v", id, got)
		}
	}
}

func TestImportedModelAliases_ImageLatest(t *testing.T) {
	if got := importedModelAliases("gpt-image-2"); got != "gpt-image-latest" {
		t.Fatalf("importedModelAliases(gpt-image-2) = %q, want gpt-image-latest", got)
	}
	if got := importedModelAliases("gpt-image-1.5"); got != "" {
		t.Fatalf("importedModelAliases(gpt-image-1.5) = %q, want empty", got)
	}
}
