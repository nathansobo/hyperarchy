dir = File.dirname(__FILE__)
require "#{dir}/../config/environment"
require "spec"
require "#{dir}/fixtures"

Spec::Runner.configure do |config|
  config.mock_with :rr

  config.before do
    Model::Repository.clear_tables
    Model::Repository.load_fixtures
    Model::Repository.initialize_identity_maps
  end

  config.after do
    Model::Repository.clear_identity_maps
  end
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
