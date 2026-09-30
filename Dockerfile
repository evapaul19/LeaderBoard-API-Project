# Backend image for leaderboard-api-project.
#   build:  docker build --no-cache -t leaderboard-backend .
#   run:    docker run --rm -p 8000:8000 --env-file .env leaderboard-backend
#
# Design notes -- every choice below is derived from this repository, not assumed:
#
#   * Python 3.12   : pyproject.toml sets requires-python = ">=3.12" and
#                     .python-version pins 3.12.
#   * Entry point   : src/main.py defines `app`, so the ASGI target is
#                     src.main:app. The duplicate root main.py and the
#                     leaderboard-api-project console script are placeholders
#                     and are NOT the API entry point.
#   * uv            : uv.lock is the dependency source of truth and
#                     pyproject.toml requires uv_build>=0.12.17,<0.13.0, so uv
#                     is pinned to 0.12.21 instead of :latest for reproducibility.
#   * Alembic       : alembic/env.py imports src.config, so alembic.ini and
#                     alembic/ must exist in the image for `alembic upgrade head`.
#   * psycopg2-binary bundles its own libpq, so no build toolchain is required
#                     on the slim base image.

FROM python:3.12-slim

# uv is a distroless image containing only the binaries, so the binaries are
# copied out of it rather than installing uv with pip.
COPY --from=ghcr.io/astral-sh/uv:0.12.21 /uv /uvx /bin/

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_LINK_MODE=copy \
    UV_PROJECT_ENVIRONMENT=/app/.venv \
    UV_FROZEN=1

WORKDIR /app

# ---------------------------------------------------------------------------
# Dependency layers
#
# Dependencies are synced in two steps so that editing application code does not
# re-resolve or re-link the 32 third-party packages:
#
#   1. install third-party dependencies only, without building this project;
#   2. copy the sources, then install the project itself.
#
# Step 1 is invalidated only by pyproject.toml, uv.lock or README.md, so a
# rebuild after editing a route re-runs only the cheap step 2.
#
# README.md is required here, and deliberately so: `uv sync` installs this
# project itself through uv_build, and uv_build reads `readme = "README.md"`
# from pyproject.toml. Verified by building without it, which fails with
#   "failed to open file `/app/README.md`".
# It is a build input only; nothing reads it at run time.
# ---------------------------------------------------------------------------
COPY pyproject.toml uv.lock README.md ./

RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project --no-dev

COPY src ./src

# Installs the project itself (no third-party work, so it is fast).
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev

# ---------------------------------------------------------------------------
# Runtime layer: migrations only. No environment file and no credentials are
# copied in; every value is injected at run time by the caller or Compose.
# ---------------------------------------------------------------------------
COPY alembic.ini ./
COPY alembic ./alembic

# Serve unprivileged.
#
# The venv is created by root during `uv sync`, so it is handed over to the
# runtime user. Without this, the repository's documented
# `docker compose exec backend uv run alembic upgrade head` fails with
# "Permission denied" when `uv run` re-syncs and rewrites the console scripts
# in /app/.venv/bin.
RUN useradd --create-home --uid 10001 appuser \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Liveness only: GET / answers without touching PostgreSQL, so this reports
# whether the ASGI app is serving, not whether the database is reachable.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD ["/app/.venv/bin/python", "-c", "import sys,urllib.request; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/', timeout=4).status == 200 else 1)"]

# The venv binary is invoked directly rather than through `uv run`, so start-up
# performs no lockfile re-resolution and needs no network access. src.main is
# resolved against WORKDIR via Uvicorn's default --app-dir.
CMD ["/app/.venv/bin/uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
