dir = File.expand_path(File.dirname(__FILE__))

ENV['RACK_ENV'] = "development" unless ENV.has_key?('RACK_ENV')

ROOT = File.expand_path("#{dir}/../..")
SERVER_ROOT = File.expand_path("#{ROOT}/server")
CLIENT_ROOT = File.expand_path("#{ROOT}/client")
$: << "#{SERVER_ROOT}/vendor/monarch/server/lib/"

require "rubygems"
require "sinatra"
require "monarch"
require "sinatra/reloader"
require "rack-flash"
require "bcrypt"
require "pony"
require "erector"
require 'rgl/base'
require 'rgl/adjacency'
require 'rgl/topsort'
require "#{dir}/warden/strategies/bcrypt_strategy"

require "#{dir}/hyperarchy/mailer"
require "#{dir}/hyperarchy/helpers"
require "#{dir}/hyperarchy/models"
require "#{dir}/hyperarchy/views"
require "#{dir}/hyperarchy/app"

Monarch.add_js_location("/javascript/app", "#{CLIENT_ROOT}/app")
Monarch.add_js_location("/javascript/vendor", "#{CLIENT_ROOT}/vendor")
Monarch.add_location("/stylesheets", "#{CLIENT_ROOT}/stylesheets")
Monarch.add_location("/images", "#{CLIENT_ROOT}/images")
