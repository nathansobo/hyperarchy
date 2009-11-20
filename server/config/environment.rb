dir = File.expand_path(File.dirname(__FILE__))

ROOT = File.expand_path("#{dir}/../..")
SERVER_ROOT = File.expand_path("#{ROOT}/server")
CLIENT_ROOT = File.expand_path("#{ROOT}/client")
XMPP_ENABLED = true

unless Object.const_defined?(:ENVIRONMENT)
  ENVIRONMENT = ENV['ENVIRONMENT'] || 'development'
end 

require "#{SERVER_ROOT}/vendor/monarch/server/lib/monarch"
require "rubygems"
require "bcrypt"
require "erector"

require "#{SERVER_ROOT}/app/models"
require "#{SERVER_ROOT}/app/views"
require "#{SERVER_ROOT}/app/resources"

class Hash
  include ActiveSupport::CoreExtensions::Hash::Keys
end

Util::AssetManager.add_js_location("/javascript/app", "#{CLIENT_ROOT}/app")
Util::AssetManager.add_location("/stylesheets", "#{CLIENT_ROOT}/stylesheets")
require "#{dir}/environments/#{ENVIRONMENT}"
