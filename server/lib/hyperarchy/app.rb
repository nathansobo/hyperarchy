dir = File.dirname(__FILE__)

module Hyperarchy
  class App < Sinatra::Base
  end
end
load "#{dir}/app/configuration.rb"
load "#{dir}/app/routes.rb"
