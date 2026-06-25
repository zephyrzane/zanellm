# ZaneLLM

<p align="center">
  <img src="ui/public/logo-zanellm.png" alt="ZaneLLM" width="96" />
</p>

<p align="center"><strong>AD INTELLECTUM PER PORTAM SECURAM</strong></p>

Privacy-first local LLM gateway for developers.

ZaneLLM gives one local endpoint for provider accounts, API keys, model routing, usage, and playground testing. It is meant to sit between developer tools and upstream model providers.

## What It Does

- One local endpoint: `http://127.0.0.1:8080/v1`
- OpenAI-compatible chat/completions API
- OpenAI Responses-compatible upstream support
- API account storage with encrypted upstream secrets
- Local API keys for GUIs, TUIs, CLIs, SDKs, and scripts
- Model discovery/import from provider accounts
- Routing, aliases, failover, and account rotation
- Usage metrics: requests, tokens, cached tokens, latency, retries, model/provider breakdowns
- Playground for live model tests
- Guides for Codex CLI, Claude Code, OpenCode, Hermes Agent, and other tools
- Profile-based themes from uploaded picture colors plus Nippon color palettes

## Supported

Providers and compatible APIs:

- OpenAI
- OpenAI Responses-compatible gateways
- Anthropic
- Gemini
- OpenRouter
- DeepSeek
- Kimi
- Qwen
- Z.ai
- Mistral
- Groq
- xAI
- Cohere
- Perplexity
- Together
- Fireworks
- NVIDIA
- SambaNova
- Ollama, vLLM
 and many more

Model types:

- Chat
- Streaming chat
- Responses-style models
- Image models when the upstream exposes a compatible endpoint
- Provider-imported model lists

Developer tools:

- Codex CLI
- Claude Code
- OpenCode
- Hermes Agent
- OpenAI SDK-compatible apps
- Any tool that accepts `OPENAI_BASE_URL` and `OPENAI_API_KEY`

## Privacy

ZaneLLM stores routing and usage metadata. Prompt and response bodies are not persisted by design.

Upstream API keys are encrypted at rest with `ZANELLM_ENCRYPTION_KEY`. Keep that key stable; changing it means existing stored upstream secrets cannot be decrypted.

## Quick Start

```bash
export ZANELLM_ENCRYPTION_KEY="$(openssl rand -base64 32)"
export ZANELLM_ADMIN_KEY="$(openssl rand -base64 32)"

go run ./cmd/zanellm
```

Open:

```text
http://127.0.0.1:8080
```

Default local login password:

```text
3214
```

Change it from Profile after first login.

## Docker

```bash
docker run --rm -p 8080:8080 \
  -e ZANELLM_ENCRYPTION_KEY="$(openssl rand -base64 32)" \
  -e ZANELLM_ADMIN_KEY="$(openssl rand -base64 32)" \
  -v zanellm_data:/data \
  ghcr.io/zephyrzane/zanellm:latest
```

## Persistent Local Run

```bash
export ZANELLM_DATABASE_DSN="./zanellm.db"
export ZANELLM_ENCRYPTION_KEY="replace-with-a-stable-32-byte-secret"
export ZANELLM_ADMIN_KEY="replace-with-a-stable-bootstrap-secret"

./zanellm
```

For PostgreSQL:

```bash
export ZANELLM_DATABASE_DSN="postgres://user:pass@localhost:5432/zanellm?sslmode=disable"
```

## Use From Tools

Use one local key from the ZaneLLM UI:

```bash
export OPENAI_BASE_URL="http://127.0.0.1:8080/v1"
export OPENAI_API_KEY="vl_uk_..."
```

Example:

```bash
curl "$OPENAI_BASE_URL/chat/completions" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "messages": [{"role": "user", "content": "Say hello from ZaneLLM."}]
  }'
```

## Build

```bash
npm --prefix ui install
npm --prefix ui run build
go build ./cmd/zanellm
```

## Test

```bash
go test ./...
npm --prefix ui test -- --run
```

## Security Notes

- Do not commit `zanellm.db`, `.env`, upstream API keys, or local API keys.
- Use a stable `ZANELLM_ENCRYPTION_KEY` from a secret manager in production.
- Rotate local keys from the UI if a tool config leaks.
- Put ZaneLLM behind HTTPS before exposing it outside localhost.

## License

Business Source License 1.1. See [LICENSE](LICENSE).
