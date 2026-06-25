# Stage 1: Build UI (arch-independent, runs on build platform)
FROM --platform=$BUILDPLATFORM node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293 AS ui-builder
WORKDIR /app/ui
COPY ui/package.json ui/package-lock.json ./
RUN npm ci
COPY ui/ ./
RUN npm run build

# Stage 2: Build Go binary (cross-compiles on build platform)
FROM --platform=$BUILDPLATFORM golang:1.26-alpine@sha256:3ad57304ad93bbec8548a0437ad9e06a455660655d9af011d58b993f6f615648 AS go-builder
ARG TARGETOS
ARG TARGETARCH
RUN apk add --no-cache git
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
COPY --from=ui-builder /app/ui/dist ./ui/dist
ARG VERSION=0.0.21
RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build \
    -ldflags="-s -w -X 'github.com/zanellm/zanellm/internal/api/health.Version=${VERSION}'" \
    -o /zanellm ./cmd/zanellm

# Stage 3: Runtime
FROM alpine:3.24@sha256:28bd5fe8b56d1bd048e5babf5b10710ebe0bae67db86916198a6eec434943f8b
RUN apk upgrade --no-cache \
    && apk add --no-cache ca-certificates tzdata \
    && addgroup -S zanellm && adduser -S -G zanellm zanellm \
    && mkdir -p /data && chown zanellm:zanellm /data
COPY --from=go-builder /zanellm /usr/local/bin/zanellm
VOLUME ["/data"]
ENV ZANELLM_DATABASE_DSN=/data/zanellm.db
EXPOSE 8080 8443
USER zanellm
ENTRYPOINT ["zanellm"]
