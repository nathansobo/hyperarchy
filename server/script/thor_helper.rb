dir = File.dirname(__FILE__)
require "rubygems"
require "thor"
require "bundler"
ENV['BUNDLE_GEMFILE'] ||= "#{dir}/../../Gemfile"
Bundler.setup(:default, :development)
require "sequel"
