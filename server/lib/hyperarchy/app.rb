dir = File.dirname(__FILE__)

module Hyperarchy
  class App < Sinatra::Base
  end

  class Unauthorized < Exception
    def code
      401
    end
  end
end

load "#{dir}/app/configuration.rb"
load "#{dir}/app/routes.rb"
