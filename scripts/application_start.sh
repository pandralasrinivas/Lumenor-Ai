#!/usr/bin/env bash
set -euo pipefail

if ! command -v systemctl >/dev/null 2>&1; then
  exit 0
fi

for service in nginx httpd apache2; do
  if systemctl is-active --quiet "${service}"; then
    systemctl reload "${service}" || systemctl restart "${service}"
    exit 0
  fi
done
