dir = File.dirname(__FILE__)

ROOT = File.expand_path("#{dir}/../..")
SERVER_ROOT = File.expand_path("#{ROOT}/server")
CLIENT_ROOT = File.expand_path("#{ROOT}/client")

unless Object.const_defined?(:ENVIRONMENT)
  ENVIRONMENT = ENV['ENVIRONMENT'] || 'development'
end 

require "#{SERVER_ROOT}/vendor/eden/server/lib/eden"
require "rubygems"
require "bcrypt"
require "erector"

require "#{SERVER_ROOT}/app/models"
require "#{SERVER_ROOT}/app/views"
require "#{SERVER_ROOT}/app/resources"

class Hash
  include ActiveSupport::CoreExtensions::Hash::Keys
end

Http::StaticAssetManager.add_js_directory("#{CLIENT_ROOT}/app", "/javascript/app")
Http::StaticAssetManager.add_js_directory("#{CLIENT_ROOT}/vendor", "/javascript/vendor")
Origin = Model::Repository.new
require "#{dir}/environments/#{ENVIRONMENT}"
