# ZaneLLM
From [artemisia hub's team](tg.me/https://t.me/artemisia_hub/)
<p align="center">
  <img src="ui/public/logo-zanellm.png" alt="ZaneLLM" width="96" />
</p>

<p align="center"><strong>AD INTELLECTUM PER PORTAM SECURAM</strong></p>

`zanellm` is a local LLM gateway for developer tools, API accounts, model routes, and usage tracking.

It gives you one local endpoint, encrypted upstream provider credentials, local API keys, model import, routing, playground testing, usage metrics, and profile themes.

<img width="1672" height="941" alt="readme-img" src="https://github.com/user-attachments/assets/1f5cc084-94a2-4a81-8815-a1087909a92b" />

## Installation

### Requirements

- [Go](https://go.dev/) 1.24+
- [Node.js](https://nodejs.org/) 20+
- [npm](https://www.npmjs.com/)

### Procedure

1. Clone this repository to your machine.
2. Run `npm --prefix ui install` to install the UI dependencies.
3. Run `npm --prefix ui run build` to build the UI.
4. Run `go build ./cmd/zanellm` to build the server.

## Usage

### Development Server

```bash
export ZANELLM_ENCRYPTION_KEY="$(openssl rand -base64 32)"
export ZANELLM_ADMIN_KEY="$(openssl rand -base64 32)"
go run ./cmd/zanellm
```

Open:

```text
http://127.0.0.1:8080
```

### Default Login

The default local password is:

```text
3214
```

Change it from Profile after first login.

### Local API Endpoint

Use the local endpoint from OpenAI-compatible tools:

```bash
export OPENAI_BASE_URL="http://127.0.0.1:8080/v1"
export OPENAI_API_KEY="your-local-zanellm-key"
```

Local API keys are created in the Accounts & API page.

### Docker

```bash
docker run --rm -p 8080:8080 \
  -e ZANELLM_ENCRYPTION_KEY="$(openssl rand -base64 32)" \
  -e ZANELLM_ADMIN_KEY="$(openssl rand -base64 32)" \
  -v zanellm_data:/data \
  ghcr.io/zephyrzane/zanellm:latest
```

### Persistent Local Run

```bash
export ZANELLM_DATABASE_DSN="./zanellm.db"
export ZANELLM_ENCRYPTION_KEY="replace-with-a-stable-32-byte-secret"
export ZANELLM_ADMIN_KEY="replace-with-a-stable-bootstrap-secret"
./zanellm
```

## Features

### Accounts & API

Store upstream provider accounts, API channels, CLI login metadata, local API keys, and encrypted credentials.

### Providers

ZaneLLM works with OpenAI-compatible providers and common upstream APIs, including OpenAI, Anthropic, Gemini, OpenRouter, DeepSeek, Kimi, Qwen, Z.ai, Mistral, Groq, xAI, Cohere, Perplexity, Together, Fireworks, NVIDIA, SambaNova, Ollama, vLLM, and custom endpoints.

### Model Types

Routes can be configured for chat, responses, embeddings, reranking, completions, images, audio transcription, and audio speech where the upstream supports them.

### Developer Tools

Use ZaneLLM with Codex CLI, Claude Code, OpenCode, Hermes Agent, OpenAI SDK-compatible apps, and tools that accept `OPENAI_BASE_URL` and `OPENAI_API_KEY`.

### Usage

The app tracks request counts, token usage, cached tokens, estimated cost, latency, retries, fallbacks, and model/provider breakdowns.

### Themes

Profile settings include picture-based colors, Nippon color palettes, and light/dark mode.

## Development

### Structure

- `cmd/zanellm/` contains the server entrypoint.
- `internal/` contains API, routing, provider, database, auth, and usage logic.
- `ui/` contains the React interface.
- `docs/` contains provider and API documentation.

### Check

1. Run `go test ./...` before publishing.
2. Run `npm --prefix ui run lint`.
3. Run `npm --prefix ui run build`.
4. Run `npm --prefix ui run test -- --run`.
5. Open the affected page and verify layout, theme mode, provider icons, and API/account flows.

## Security

- Prompt and response bodies are not persisted by design.
- Upstream secrets are encrypted with `ZANELLM_ENCRYPTION_KEY`.
- Keep `ZANELLM_ENCRYPTION_KEY` stable for existing encrypted provider secrets.
- Do not commit `zanellm.db`, `.env`, upstream API keys, local API keys, or private credentials.
- Put ZaneLLM behind HTTPS before exposing it outside localhost.

## License

Business Source License 1.1. See [LICENSE](LICENSE).
