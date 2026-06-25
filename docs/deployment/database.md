---
title: "Database"
description: "SQLite, PostgreSQL setup, and migration between them"
section: deployment
order: 4
---
# Database

## SQLite (Default)

Zero configuration. ZaneLLM creates a SQLite database at `/data/zanellm.db` on first start. Suitable for single-instance deployments.

No driver installation, no connection pooling, no external service. The database file is the only thing you need to back up.

## PostgreSQL

For production deployments with high write throughput or multi-instance setups:

```yaml
database:
  driver: postgres
  dsn: postgres://zanellm:${DB_PASSWORD}@postgres:5432/zanellm?sslmode=require
  max_open_conns: 25
  max_idle_conns: 5
  conn_max_lifetime: 5m
```

PostgreSQL is required when running multiple ZaneLLM instances behind a load balancer. SQLite does not support concurrent writes from multiple processes.

## Migration (SQLite to PostgreSQL)

```bash
zanellm migrate \
  --from sqlite:///data/zanellm.db \
  --to postgres://user:pass@host:5432/zanellm
```

The migration is bidirectional, transactional, and batched. Safe to run against production data. All tables, users, keys, usage events, and configuration are transferred.

## Backup

### SQLite

```bash
# While ZaneLLM is running (SQLite supports concurrent reads)
cp /data/zanellm.db /backup/zanellm-$(date +%Y%m%d).db
```

### PostgreSQL

```bash
pg_dump -U zanellm -h postgres zanellm > backup.sql
```

## When to Switch

| Scenario | Recommendation |
|---|---|
| Single instance | SQLite |
| Multiple instances / replicas | PostgreSQL + Redis |
| Need point-in-time recovery | PostgreSQL |
| Development / testing | SQLite |
| Docker single container | SQLite |
| Kubernetes with multiple pods | PostgreSQL |
