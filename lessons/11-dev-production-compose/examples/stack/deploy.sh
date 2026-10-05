#!/usr/bin/env bash
# Single-host update, not a rolling or zero-downtime deployment.
set -euo pipefail
cd -- "$(dirname -- "$0")"
reference=${1:?Usage: deploy.sh registry/image@sha256:digest [--proxy]}
mode=${2:-direct}
if [[ ! "$reference" =~ ^[a-z0-9][a-z0-9._/-]*@sha256:[a-f0-9]{64}$ ]]; then
  echo "Expected an explicit lowercase image reference with a sha256 digest" >&2
  exit 2
fi
for file in compose.yaml compose.prod.yaml frontend.conf .env; do
  if [[ ! -f "$file" ]]; then echo "Missing deployment file: $file" >&2; exit 2; fi
done
# Linux VPS: protect the stack from simultaneous manual/CI updates.
exec 9>.deploy.lock
flock -n 9 || { echo "Another deployment is running" >&2; exit 1; }
pending=$(mktemp .release.pending.XXXXXX)
trap 'rm -f -- "$pending"' EXIT
printf 'API_IMAGE=%s\n' "$reference" > "$pending"
chmod 600 "$pending"
# Shell values override env-file interpolation intentionally for this candidate.
export API_IMAGE="$reference"
compose=(docker compose --env-file .env --env-file "$pending" -f compose.yaml -f compose.prod.yaml)
if [[ "$mode" == "--proxy" ]]; then
  [[ -f compose.proxy.yaml ]] || { echo "Missing compose.proxy.yaml" >&2; exit 2; }
  compose+=(-f compose.proxy.yaml)
elif [[ "$mode" != "direct" ]]; then
  echo "Unknown deployment mode" >&2; exit 2
fi
"${compose[@]}" config --quiet
"${compose[@]}" pull
"${compose[@]}" up -d --no-build --wait --wait-timeout 120
# Verify through the host-only frontend and then the app's response contract.
curl --fail --silent --show-error --retry 5 --retry-connrefused --retry-delay 1 http://127.0.0.1:8088/api/health >/dev/null
"${compose[@]}" exec -T api node -e "fetch('http://127.0.0.1:3000/health').then(async r => { const b = await r.json(); if (!r.ok || b.status !== 'ok') process.exit(1); }).catch(() => process.exit(1))"
"${compose[@]}" ps
# Record the selected reference only after verification succeeds.
if [[ -f .release.env ]]; then cp -- .release.env .previous-release.env; fi
mv -- "$pending" .release.env
trap - EXIT
printf 'Verified deployment reference saved in .release.env\n'
