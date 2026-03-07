#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${1:-.env.local}"
WRANGLER_ENV="${2:-}"

get_var() {
  if [[ -f "$ENV_FILE" ]]; then
    val=$(grep -E "^${1}=" "$ENV_FILE" 2>/dev/null | cut -d= -f2- | tr -d '\r' || true)
    if [[ -n "$val" ]]; then
      printf '%s' "$val"
      return
    fi
  fi
  printf '%s' "${!1:-}"
}

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo_root"

VITE_CONVEX_URL=$(get_var "VITE_CONVEX_URL")
VITE_CONVEX_SITE_URL=$(get_var "VITE_CONVEX_SITE_URL")
VITE_SENTRY_DSN=$(get_var "VITE_SENTRY_DSN")

for var in VITE_CONVEX_URL VITE_CONVEX_SITE_URL; do
  val=$(get_var "$var")
  if [[ -z "$val" ]]; then
    echo "Error: $var is empty (set in $ENV_FILE or environment)"
    exit 1
  fi
done

VAR_ARGS=(
  --var "VITE_CONVEX_URL:$VITE_CONVEX_URL"
  --var "VITE_CONVEX_SITE_URL:$VITE_CONVEX_SITE_URL"
)

if [[ -n "$VITE_SENTRY_DSN" ]]; then
  VAR_ARGS+=(--var "VITE_SENTRY_DSN:$VITE_SENTRY_DSN")
fi

DEPLOY_ARGS=("${VAR_ARGS[@]}")
if [[ -n "$WRANGLER_ENV" ]]; then
  DEPLOY_ARGS+=(--env "$WRANGLER_ENV" --name "tastik-dev")
fi

npx wrangler deploy "${DEPLOY_ARGS[@]}"
