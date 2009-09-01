dir = File.dirname(__FILE__)
ROOT = File.expand_path("#{dir}/..")

unless Object.const_defined?(:ENVIRONMENT)
  ENVIRONMENT = ENV['ENVIRONMENT'] || 'development'
end 

require "#{ROOT}/vendor/eden/server/lib/eden"
require "rubygems"
require "bcrypt"
require "erector"

require "#{ROOT}/app/models"
require "#{ROOT}/app/views"
require "#{ROOT}/app/resources"

class Hash
  include ActiveSupport::CoreExtensions::Hash::Keys
end

Http::StaticAssetManager.add_js_directory("#{ROOT}/public/javascript", "/javascript")
Origin = Model::Repository.new
require "#{dir}/environments/#{ENVIRONMENT}"
