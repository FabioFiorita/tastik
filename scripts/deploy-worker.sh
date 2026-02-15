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
VITE_CLERK_PUBLISHABLE_KEY=$(get_var "VITE_CLERK_PUBLISHABLE_KEY")
VITE_SENTRY_DSN=$(get_var "VITE_SENTRY_DSN")

for var in VITE_CONVEX_URL VITE_CONVEX_SITE_URL VITE_CLERK_PUBLISHABLE_KEY; do
  val=$(get_var "$var")
  if [[ -z "$val" ]]; then
    echo "Error: $var is empty (set in $ENV_FILE or environment)"
    exit 1
  fi
done

VAR_ARGS=(
  --var "VITE_CONVEX_URL:$VITE_CONVEX_URL"
  --var "VITE_CONVEX_SITE_URL:$VITE_CONVEX_SITE_URL"
  --var "VITE_CLERK_PUBLISHABLE_KEY:$VITE_CLERK_PUBLISHABLE_KEY"
)

if [[ -n "$VITE_SENTRY_DSN" ]]; then
  VAR_ARGS+=(--var "VITE_SENTRY_DSN:$VITE_SENTRY_DSN")
fi

CLERK_SECRET_KEY=$(get_var "CLERK_SECRET_KEY")
if [[ -n "$CLERK_SECRET_KEY" ]]; then
  echo "Setting CLERK_SECRET_KEY secret..."
  if [[ -n "$WRANGLER_ENV" ]]; then
    echo "$CLERK_SECRET_KEY" | npx wrangler secret put CLERK_SECRET_KEY --env "$WRANGLER_ENV"
  else
    echo "$CLERK_SECRET_KEY" | npx wrangler secret put CLERK_SECRET_KEY
  fi
else
  echo "Warning: CLERK_SECRET_KEY not set (add to $ENV_FILE or env). Clerk auth may fail."
fi

if [[ -n "$WRANGLER_ENV" ]]; then
  npx wrangler deploy --env "$WRANGLER_ENV" "${VAR_ARGS[@]}"
else
  npx wrangler deploy "${VAR_ARGS[@]}"
fi
