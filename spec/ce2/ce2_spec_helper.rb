require "#{File.dirname(__FILE__)}/../../lib/ce2"
require "spec"

Spec::Runner.configure do |config|
  config.mock_with :rr

  config.before do
    Origin.clear
  end
end