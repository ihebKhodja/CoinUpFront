#!/bin/sh
set -eu

# Nginx official image runs /docker-entrypoint.d/*.sh before starting.
# We generate /usr/share/nginx/html/env.js from environment variables.

HTML_DIR="/usr/share/nginx/html"
OUT_FILE="$HTML_DIR/env.js"

BACKEND_URL_DEFAULT="http://localhost:5000/api"
BACKEND_URL_VALUE="${BACKEND_URL:-$BACKEND_URL_DEFAULT}"

# Escape for a JS double-quoted string
BACKEND_URL_JS=$(printf '%s' "$BACKEND_URL_VALUE" | sed 's/\\/\\\\/g; s/"/\\"/g')

cat > "$OUT_FILE" <<EOF
// Auto-generated at container startup.
// Do not edit by hand; set environment variables instead.
(function () {
  window.__env = window.__env || {};
  window.__env.BACKEND_URL = "$BACKEND_URL_JS";
})();
EOF

# Make sure file is readable
chmod 0644 "$OUT_FILE"

echo "[env] Wrote env.js (BACKEND_URL=$BACKEND_URL_VALUE)"
