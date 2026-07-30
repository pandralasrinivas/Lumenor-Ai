#!/bin/bash
set -e

echo "Checking Nginx configuration"

nginx -t

echo "Restarting Nginx"

systemctl enable nginx
systemctl restart nginx