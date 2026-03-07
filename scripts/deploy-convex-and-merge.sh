#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo_root"

echo "Deploying Convex..."
npx convex deploy -y

echo "Convex deploy succeeded. Merging development into main..."
git checkout main
git merge --no-edit development
git push
git checkout development

echo "Done."
