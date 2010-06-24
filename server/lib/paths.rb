dir = File.dirname(__FILE__)
ROOT = File.expand_path("#{dir}/../..") unless defined?(ROOT)
SERVER_ROOT = File.expand_path("#{ROOT}/server")
CLIENT_ROOT = File.expand_path("#{ROOT}/client")
$: << "#{SERVER_ROOT}/vendor/monarch/server/lib/"
