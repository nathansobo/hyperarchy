dir = File.dirname(__FILE__)
ROOT = File.expand_path("#{dir}/../..")

require "rubygems"
require "thor"
require "bundler"

ENV['BUNDLE_GEMFILE'] ||= "#{ROOT}/Gemfile"
Bundler.setup(:thor)
require "sequel"
