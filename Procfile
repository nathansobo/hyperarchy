web: bundle exec rails server thin
redis: script/development-redis-server
resque_worker: QUEUE=* bundle exec rake resque:work
resque_web: bundle exec resque-web config/resqueweb_conf.rb --foreground --no-launch --log-file /dev/stdout --server thin
mailtrap: bundle exec mailtrap run
socket_server: node vendor/socket_server/socket_server.js
