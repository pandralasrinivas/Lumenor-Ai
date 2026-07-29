#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/html}"
WEB_USER="${WEB_USER:-www-data}"

if [[ -z "${APP_DIR}" || "${APP_DIR}" == "/" ]]; then
  echo "Refusing to update permissions for an empty or root deployment directory."
  exit 1
fi

chmod -R u=rwX,go=rX "${APP_DIR}"

if id "${WEB_USER}" >/dev/null 2>&1; then
  chown -R "${WEB_USER}:${WEB_USER}" "${APP_DIR}"
fi
