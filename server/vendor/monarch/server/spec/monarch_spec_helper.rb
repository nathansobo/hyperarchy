dir = File.dirname(__FILE__)

require "rubygems"
require "spec"
require "#{dir}/../lib/monarch"

Dir["#{File.dirname(__FILE__)}/spec_helpers/*.rb"].each do |spec_helper_path|
  require spec_helper_path
end

Origin.connection = Sequel.sqlite
Model::Repository.create_schema

Spec::Runner.configure do |config|
  config.mock_with :rr
  config.before do
    Model::Repository.clear_tables
    Model::Repository.load_fixtures(FIXTURES)
    Model::Repository.initialize_local_identity_map
  end

  config.after do
    Model::Repository.clear_local_identity_map
  end
end

at_exit do
  Spec::Runner.run
end

module Spec::Example::ExampleMethods
  def publicize(object, *method_names)
    (class << object; self; end).class_eval do
      method_names.each do |method_name|
        public method_name
      end
    end
  end
end
