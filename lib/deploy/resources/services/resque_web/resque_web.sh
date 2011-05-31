#!/bin/bash
source "/usr/local/rvm/scripts/rvm"
cd /app
exec bundle exec resque-web --foreground --no-launch --log-file /dev/stdout --app-dir /app --server thin
