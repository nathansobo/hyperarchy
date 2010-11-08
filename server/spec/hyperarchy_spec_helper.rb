dir = File.dirname(__FILE__)

ENV['RACK_ENV'] = "test"
require "#{dir}/../lib/hyperarchy"
require "#{dir}/spec_helpers/machinist_monarch_adaptor"
require "#{dir}/spec_helpers/blueprints"
require "#{MONARCH_SERVER_ROOT}/spec/spec_helpers/rack_example_group"

Spec::Runner.configure do |config|
  config.mock_with :rr

  config.before do
    Monarch::Model::Repository.clear_tables
    Organization.create!(:name => ALPHA_TEST_ORG_NAME, :suppress_membership_creation => true)
    Monarch::Model::Repository.initialize_local_identity_map
    SubscriptionManager.start
    Sham.reset
    Mailer.reset
    stub(EventMachine).add_timer

    def EM.defer
      yield
    end
  end

  config.after do
    Monarch::Model::Repository.clear_local_identity_map
    set_current_user(nil)
    Timecop.return
  end
end

module Spec::Example::Subject::ExampleMethods
  def make_member(organization, attributes = {})
    user = User.make(attributes)
    organization.memberships.create!(:user => user, :suppress_invite_email => true)
    user
  end

  def make_owner(organization, attributes = {})
    user = User.make(attributes)
    organization.memberships.create!(:user => user, :role => "owner", :suppress_invite_email => true)
    user
  end

  def find_majority(winner, loser)
    election.majorities.find(:winner => winner, :loser => loser).reload
  end

  def set_current_user(user)
    Monarch::Model::Repository.current_user = user
  end

  def current_user
    Monarch::Model::Repository.current_user
  end
end

class RackExampleGroup < Spec::Example::ExampleGroup
  include Warden::Test::Helpers

  after do
    Warden::test_reset!
  end

  def app
    Hyperarchy::App
  end

  def flash
    last_request.env["x-rack.flash"]
  end

  def warden
    last_request.env["warden"]
  end

  def current_user
    warden.user
  end

  def login_as(user, opts={})
    super
    user
  end
end

class Rack::MockResponse
  def body_from_json
    JSON.parse(body)
  end
end

at_exit do
  Spec::Runner.run
end