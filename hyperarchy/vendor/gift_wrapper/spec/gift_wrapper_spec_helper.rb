dir = File.dirname(__FILE__)
require "rubygems"
require "spec"
require "rack/test"
require "#{dir}/../lib/gift_wrapper"

Spec::Runner.configure do |config|
  config.mock_with :rr
end

at_exit do
  exit Spec::Runner.run
end
