dir = File.dirname(__FILE__)

require "rubygems"
require "spec"
require "#{dir}/../lib/eden"

Dir["#{File.dirname(__FILE__)}/spec_helpers/**/*.rb"].each do |spec_helper_path|
  require spec_helper_path
end

Origin.connection = Sequel.sqlite
Model::GlobalDomain.create_schema

Spec::Runner.configure do |config|
  config.mock_with :rr
  config.before do
    Model::GlobalDomain.clear_tables
    Model::GlobalDomain.load_fixtures
    Model::GlobalDomain.initialize_identity_maps
  end

  config.after do
    Model::GlobalDomain.clear_identity_maps
  end
end

at_exit do
  Spec::Runner.run
end
