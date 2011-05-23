#!/bin/bash
source "/usr/local/rvm/scripts/rvm"
cd /app
exec bundle exec rake resque:work
