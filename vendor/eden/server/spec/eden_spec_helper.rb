dir = File.dirname(__FILE__)

require "rubygems"
require "spec"
require "#{dir}/../lib/eden"

Spec::Runner.configure do |config|
  config.mock_with :rr
end

module Http
  class TestRequest < Http::Request
    def initialize
      super({})
    end
  end
end

at_exit do
  Spec::Runner.run
end
