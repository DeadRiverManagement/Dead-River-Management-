#!/usr/bin/env bash
# Start a local OmniRoute gateway and point it at Anthropic. Safe to rerun.
# Source: https://github.com/diegosouzapw/OmniRoute (README, skills/cli-serve, skills/cli-providers, skills/cli-routing)
set -euo pipefail

PORT=20128
BASE_URL="http://localhost:${PORT}"
HEALTH_URL="${BASE_URL}/api/health"
export OMNIROUTE_BASE_URL="${OMNIROUTE_BASE_URL:-$BASE_URL}"

# 1. Install omniroute globally if missing.
if ! command -v omniroute >/dev/null 2>&1; then
  echo "omniroute not found; installing with npm install -g omniroute"
  npm install -g omniroute
fi

# 2. Start the server as a daemon unless it is already answering.
if curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
  echo "OmniRoute already running on port ${PORT}"
else
  omniroute serve --daemon --no-open --port "$PORT"
fi

# 3. Wait for /api/health.
for _ in $(seq 1 60); do
  if curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
if ! curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
  echo "OmniRoute did not become healthy at ${HEALTH_URL}" >&2
  exit 1
fi
echo "OmniRoute healthy at ${HEALTH_URL}"

# 4. Register the Anthropic provider from ANTHROPIC_API_KEY (skip if already configured).
if [ -z "${ANTHROPIC_API_KEY:-}" ]; then
  echo "ANTHROPIC_API_KEY is not set; export it and rerun" >&2
  exit 1
fi
if omniroute providers list --json 2>/dev/null | grep -q '"anthropic"'; then
  echo "anthropic provider already configured; skipping"
else
  omniroute providers add anthropic --credential-env ANTHROPIC_API_KEY --yes
fi

# 5. Create the priority combo named "default" (skip if it already exists).
if omniroute combo list --json 2>/dev/null | grep -q '"default"'; then
  echo "combo \"default\" already exists; skipping"
else
  omniroute combo create default --strategy priority --models "anthropic/claude-opus-5,anthropic/claude-sonnet-5"
fi

echo "Done. Run: omniroute launch"
