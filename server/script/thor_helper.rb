dir = File.dirname(__FILE__)
ROOT = "#{dir}/../.."

require "rubygems"
require "thor"
require "bundler"

ENV['BUNDLE_GEMFILE'] ||= "#{ROOT}/Gemfile"
Bundler.setup(:thor)
require "sequel"
