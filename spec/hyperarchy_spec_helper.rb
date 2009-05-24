dir = File.dirname(__FILE__)
require "#{dir}/../config/environment"
require "spec"
require "#{dir}/fixtures"

Spec::Runner.configure do |config|
  config.mock_with :rr

  config.before do
    Model::GlobalDomain.clear_tables
    Model::GlobalDomain.load_fixtures
  end
end

at_exit do
  Spec::Runner.run
end
