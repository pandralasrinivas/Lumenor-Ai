#!/bin/bash
set -e

echo "Checking React website"

for attempt in {1..10}; do
  if curl --fail --silent http://127.0.0.1/ > /dev/null; then
    echo "React application is working"
    exit 0
  fi

  echo "Waiting for Nginx: attempt ${attempt}/10"
  sleep 2
done

echo "React application validation failed"

systemctl status nginx --no-pager || true
tail -n 50 /var/log/nginx/error.log || true

exit 1