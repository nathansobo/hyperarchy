dir = File.dirname(__FILE__)

require File.expand_path("#{dir}/../lib/paths")
require "rubygems"
require "thor"
require "bundler"

ENV['BUNDLE_GEMFILE'] ||= "#{HYPERARCHY_ROOT}/Gemfile"
Bundler.setup(:thor)
require "sequel"

def require_hyperarchy(env)
  ENV['RACK_ENV'] = env
  require "#{HYPERARCHY_ROOT}/server/lib/hyperarchy"
end