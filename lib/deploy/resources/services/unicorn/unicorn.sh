#!/bin/bash
source "/usr/local/rvm/scripts/rvm"
export PATH=/opt/node/bin:$PATH
cd /app
exec bundle exec unicorn --env $RAILS_ENV --config-file config/unicorn.rb
