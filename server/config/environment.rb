dir = File.expand_path(File.dirname(__FILE__))

ROOT = File.expand_path("#{dir}/../..")
SERVER_ROOT = File.expand_path("#{ROOT}/server")
CLIENT_ROOT = File.expand_path("#{ROOT}/client")

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

Http::AssetManager.add_js_location("/javascript/app", "#{CLIENT_ROOT}/app")
Http::AssetManager.add_location("/stylesheets", "#{CLIENT_ROOT}/stylesheets")
require "#{dir}/environments/#{ENVIRONMENT}"
