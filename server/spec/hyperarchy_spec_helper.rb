dir = File.dirname(__FILE__)

ENVIRONMENT = "test"
require "#{dir}/../config/environment"
require "spec"
require "#{dir}/spec_helpers/fixtures"
require "#{MONARCH_SERVER_ROOT}/spec/spec_helpers/resource_example_group"
require "#{MONARCH_SERVER_ROOT}/spec/spec_helpers/test_request"

Spec::Runner.configure do |config|
  config.mock_with :rr

  config.before do
    Model::Repository.initialize_local_identity_map
  end

  config.after do
    Model::Repository.clear_local_identity_map
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

at_exit do
  Spec::Runner.run
end
