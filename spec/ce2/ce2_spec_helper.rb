dir = File.dirname(__FILE__)
require "#{dir}/../../lib/ce2"
require "spec"
require "#{dir}/fixtures"

Spec::Runner.configure do |config|
  config.mock_with :rr

  config.before do
    GlobalDomain.clear_tables
    GlobalDomain.load_fixtures
  end
end
