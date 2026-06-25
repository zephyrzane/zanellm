---
title: "Reverse Proxy"
description: "Configure Nginx, Caddy, or Traefik in front of ZaneLLM"
section: deployment
order: 3
---
# Reverse Proxy Configuration

ZaneLLM works behind any reverse proxy (Nginx, Traefik, Caddy, K8s Ingress).

## Nginx

```nginx
location /v1/ {
    proxy_pass http://zanellm:8080;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_buffering off;              # Required for SSE streaming
}

location / {
    proxy_pass http://zanellm:8080;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_buffering off;
}
```

## Caddy

```
zanellm.example.com {
    reverse_proxy zanellm:8080
}
```

Caddy handles TLS automatically via Let's Encrypt.

## Traefik

```yaml
http:
  routers:
    zanellm:
      rule: "Host(`zanellm.example.com`)"
      service: zanellm
      tls:
        certResolver: letsencrypt
  services:
    zanellm:
      loadBalancer:
        servers:
          - url: "http://zanellm:8080"
```

## Important Notes

- **Streaming:** Ensure your reverse proxy does not buffer responses. SSE streaming requires `proxy_buffering off` (Nginx) or equivalent.
- **Timeouts:** Set upstream timeouts high enough for LLM responses (60s+). Short timeouts will kill streaming responses.
- **WebSocket:** Not required. ZaneLLM uses HTTP POST for all proxy and MCP requests.
- **TLS:** Terminate TLS at the reverse proxy or ingress level. ZaneLLM supports TLS on the admin port (`server.admin.tls`) but not on the proxy port.
