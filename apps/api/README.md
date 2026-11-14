# Rječnik API

FastAPI service for the Rječnik dictionary.

## Development

```bash
cd apps/api
cp .env.example .env
uv sync
uv run fastapi dev app/main.py   # http://localhost:8000/docs
uv run ruff check . && uv run ruff format .
```

## Docker

```bash
docker compose up --build        # http://localhost:8000/api/health
```
