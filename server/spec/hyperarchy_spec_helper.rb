dir = File.dirname(__FILE__)

ENVIRONMENT = "test"
require "#{dir}/../config/environment"
require "spec"
require "#{dir}/spec_helpers/fixtures"

Spec::Runner.configure do |config|
  config.mock_with :rr

  config.before do
    Model::Repository.initialize_identity_maps
  end

  config.after do
    Model::Repository.clear_identity_maps
  end
end

module Spec::Example::Subject::ExampleGroupMethods
  def use_fixtures
    before do
      Model::Repository.load_fixtures(FIXTURES)
    end

    after do
      Model::Repository.clear_tables
    end
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
