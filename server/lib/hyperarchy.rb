dir = File.expand_path(File.dirname(__FILE__))

ENV['RACK_ENV'] = "development" unless ENV.has_key?('RACK_ENV')
RACK_ENV = ENV['RACK_ENV']
require "#{dir}/paths"
require "rubygems"
require "bundler"
ENV['BUNDLE_GEMFILE'] ||= "#{dir}/../../Gemfile"

Bundler::require(:default, RACK_ENV.to_sym)
require "monarch"
require "logger"
require "#{dir}/warden/strategies/bcrypt_strategy"
require "#{dir}/hyperarchy/mailer"
require "#{dir}/hyperarchy/helpers"
require "#{dir}/hyperarchy/models"
require "#{dir}/hyperarchy/views"
require "#{dir}/hyperarchy/app"

GiftWrapper.mount("#{CLIENT_ROOT}/app", "/javascript/app")
GiftWrapper.mount("#{CLIENT_ROOT}/vendor", "/javascript/vendor")
GiftWrapper.mount("#{CLIENT_ROOT}/stylesheets", "/stylesheets")
GiftWrapper.mount("#{CLIENT_ROOT}/images", "/images")
GiftWrapper.mount_package_dir("#{CLIENT_ROOT}/pkg", "/javascript/pkg")