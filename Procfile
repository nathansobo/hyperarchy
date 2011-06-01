web: bundle exec rails server thin
redis: script/development-redis-server
resque_worker: QUEUE=* bundle exec rake resque:work
mailtrap: bundle exec mailtrap run
socket_server: node vendor/socket_server/socket_server.js
