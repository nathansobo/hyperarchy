dir = File.dirname(__FILE__)

ENV['RACK_ENV'] = "test"

require "#{dir}/../lib/hyperarchy"
require "spec"
require "rack/test"
require "#{dir}/spec_helpers/fixtures"
require "#{MONARCH_SERVER_ROOT}/spec/spec_helpers/rack_example_group"

Spec::Runner.configure do |config|
  config.mock_with :rr

  config.before do
    Monarch::Model::Repository.clear_tables
    Monarch::Model::Repository.initialize_local_identity_map
  end

  config.after do
    Monarch::Model::Repository.clear_local_identity_map
  end
end

module Spec::Example::Subject::ExampleGroupMethods
  def use_fixtures
    before do
      Monarch::Model::Repository.load_fixtures(FIXTURES)
    end
  end
end

module Spec::Example::Subject::ExampleMethods
  def find_majority(winner, loser)
    election.majorities.find(:winner => winner, :loser => loser).reload
  end
end

class RackExampleGroup < Spec::Example::ExampleGroup
  def app
    Hyperarchy::App
  end
end

class Rack::MockResponse
  def body_from_json
    JSON.parse(body)
  end

  def ok?
    status == 200
  end
end

at_exit do
  Spec::Runner.run
end