require 'rubygems'
require 'spork'


Spork.prefork do
  ENV["RAILS_ENV"] ||= 'test'
  require File.expand_path("../../config/environment", __FILE__)

  require 'rspec/rails'
  require 'machinist'
  require 'prequel/machinist_adaptor'
  require 'rr'
  require 'faker'

  # required for spork + rubymine
  $:.unshift(File.expand_path("/Applications/RubyMine 3.2.1.app") + "/rb/testing/patch/bdd")
  $:.unshift(File.expand_path("/Applications/RubyMine 3.2.1.app") + "/rb/testing/patch/common")

  $:.unshift(File.expand_path("/Applications/RubyMine 3.2.2.app") + "/rb/testing/patch/bdd")
  $:.unshift(File.expand_path("/Applications/RubyMine 3.2.2.app") + "/rb/testing/patch/common")
end

Spork.each_run do
  require Rails.root.join('spec', 'each_run_spec_helper')
end
