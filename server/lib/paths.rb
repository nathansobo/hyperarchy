dir = File.dirname(__FILE__)
HYPERARCHY_ROOT = File.expand_path("#{dir}/../..") unless defined?(HYPERARCHY_ROOT)
ENV['APP_ROOT'] = HYPERARCHY_ROOT
LOG_DIR = File.expand_path("#{HYPERARCHY_ROOT}/log")
SERVER_ROOT = File.expand_path("#{HYPERARCHY_ROOT}/server")
CLIENT_ROOT = File.expand_path("#{HYPERARCHY_ROOT}/client")
PUBLIC_ROOT = File.expand_path("#{HYPERARCHY_ROOT}/public")
$: << "#{SERVER_ROOT}/vendor/monarch/server/lib/"
