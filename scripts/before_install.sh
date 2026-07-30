#!/bin/bash
set -e

echo "Removing old React files"

mkdir -p /var/www/react-app
rm -rf /var/www/react-app/*