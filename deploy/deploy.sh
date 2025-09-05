#!/usr/bin/env bash
set -euo pipefail

APP_DIR=${APP_DIR:-/opt/youtube-automation}
DOMAIN=${DOMAIN:?set DOMAIN, e.g. app.example.com}
BASIC_AUTH_HASH=${BASIC_AUTH_HASH:?set BASIC_AUTH_HASH from `caddy hash-password`}

sudo mkdir -p "$APP_DIR" && sudo chown -R "$USER":"$USER" "$APP_DIR"
cd "$APP_DIR"

if [ ! -d .git ]; then
  echo "Clone your repo here first: git clone <repo> ." >&2
  exit 1
fi

echo "Building Docker image..."
docker build -t yt-auto-backend .

mkdir -p storage data

if [ ! -f .env ]; then
  echo "Missing .env in $APP_DIR. Copy deploy/env.example and fill secrets." >&2
  exit 1
fi

set +e
docker rm -f yt-app >/dev/null 2>&1
set -e

echo "Starting container..."
docker run -d --name yt-app --restart unless-stopped \
  -p 8000:8000 \
  --env-file .env \
  -v "$APP_DIR/storage:/app/storage" \
  -v "$APP_DIR/data:/app/data" \
  -v "$APP_DIR/client_sectets.json:/app/client_sectets.json:ro" \
  yt-auto-backend

sleep 2
curl -fsS http://localhost:8000/api/health || { echo "Backend health failed"; exit 1; }

echo "Configuring Caddy..."
CADDYFILE_CONTENT="${DOMAIN} {
    encode gzip
    basicauth * {
        lucy ${BASIC_AUTH_HASH}
    }
    reverse_proxy localhost:8000
}"

echo "$CADDYFILE_CONTENT" | sudo tee /etc/caddy/Caddyfile >/dev/null
sudo systemctl reload caddy

echo "Done. Visit: https://${DOMAIN}"
