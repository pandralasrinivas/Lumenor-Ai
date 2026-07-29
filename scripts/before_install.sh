#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/html}"

if [[ -z "${APP_DIR}" || "${APP_DIR}" == "/" ]]; then
  echo "Refusing to prepare an empty or root deployment directory."
  exit 1
fi

install -d -m 755 "${APP_DIR}"
find "${APP_DIR}" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
