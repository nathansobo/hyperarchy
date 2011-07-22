web: bundle exec thin start --rackup config.ru -p 8080
redis: script/development-redis-server
resque_worker: QUEUE=* bundle exec rake resque:work
resque_web: bundle exec thin start --rackup config/resque_web.ru -p 5678
socket_server: NO_SSL=true node vendor/socket_server/socket_server.js