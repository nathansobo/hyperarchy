dir = File.dirname(__FILE__)
require "#{dir}/../../lib/hyperarchy"
require "spec"
require "#{dir}/fixtures"

Spec::Runner.configure do |config|
  config.mock_with :rr

  config.before do
    GlobalDomain.clear_tables
    GlobalDomain.load_fixtures
  end
end

at_exit do
  Spec::Runner.run
end
