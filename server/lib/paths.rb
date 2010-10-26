dir = File.dirname(__FILE__)
ROOT = File.expand_path("#{dir}/../..") unless defined?(ROOT)
ENV['APP_ROOT'] = ROOT
LOG_DIR = File.expand_path("#{ROOT}/log")
SERVER_ROOT = File.expand_path("#{ROOT}/server")
CLIENT_ROOT = File.expand_path("#{ROOT}/client")
PUBLIC_ROOT = File.expand_path("#{ROOT}/public")
$: << "#{SERVER_ROOT}/vendor/monarch/server/lib/"
