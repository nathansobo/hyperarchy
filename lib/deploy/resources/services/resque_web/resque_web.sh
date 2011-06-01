#!/bin/bash
source "/usr/local/rvm/scripts/rvm"
cd /app
exec bundle exec resque-web config/resqueweb_conf.rb \
  --foreground --no-launch --host 127.0.0.1 --log-file /dev/stdout --app-dir /app --server thin
