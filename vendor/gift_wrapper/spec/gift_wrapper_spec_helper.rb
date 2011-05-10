dir = File.dirname(__FILE__)
require "rubygems"
require "rspec"
require "rack/test"
require "#{dir}/../lib/gift_wrapper"

RSpec.configure do |config|
  config.mock_with :rr
end
