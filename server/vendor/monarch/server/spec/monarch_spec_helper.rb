dir = File.dirname(__FILE__)

require "rubygems"
require "spec"
require "set"
require "rack/test"
require "#{dir}/../lib/monarch"
require "#{dir}/../lib/monarch/model/client"

Dir["#{File.dirname(__FILE__)}/spec_helpers/*.rb"].each do |spec_helper_path|
  require spec_helper_path
end

Origin.connection = Sequel.sqlite
Model::Repository.create_schema
Model::convert_strings_to_keys = true

Spec::Runner.configure do |config|
  config.include Matchers 
  config.mock_with :rr
  config.before do
    Model::Repository.clear_tables
    Model::Repository.load_fixtures(FIXTURES)
    Model::Repository.initialize_local_identity_map unless manually_manage_identity_map?
    stub(EventMachine).add_timer
  end

  config.after do
#    raise "Test pollution! Subscriptions must be destroyed after each test" if Model::Repository.num_subscriptions == 0
    Model::Repository.clear_local_identity_map unless manually_manage_identity_map?
  end
end

at_exit do
   exit Spec::Runner.run
end

module Spec::Example::ExampleGroupMethods
  def manually_manage_identity_map
    @manually_manage_identity_map = true
  end

  def manually_manage_identity_map?
    !@manually_manage_identity_map.nil?
  end
end

module Spec::Example::ExampleMethods
  def publicize(object, *method_names)
    (class << object; self; end).class_eval do
      method_names.each do |method_name|
        public method_name
      end
    end
  end

  def manually_manage_identity_map?
    self.class.manually_manage_identity_map?
  end
end