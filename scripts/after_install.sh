#!/bin/bash
set -e

APP_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "Setting file permissions"

chown -R www-data:www-data /var/www/react-app
find /var/www/react-app -type d -exec chmod 755 {} \;
find /var/www/react-app -type f -exec chmod 644 {} \;

echo "Installing Nginx configuration"

cp "$APP_ROOT/deploy/nginx-react.conf" \
   /etc/nginx/sites-available/react-app

ln -sfn /etc/nginx/sites-available/react-app \
        /etc/nginx/sites-enabled/react-app

rm -f /etc/nginx/sites-enabled/default