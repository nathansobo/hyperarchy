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
    Monarch::Model::Repository.initialize_local_identity_map
    SubscriptionManager.start
    Sham.reset
    Mailer.reset
    stub(EventMachine).add_timer

    def EM.defer
      yield
    end

    Organization.make(:name => "Hyperarchy Social", :suppress_membership_creation => true, :social => true)
    User.make(:first_name => "Guest", :last_name => "User", :guest => true)
  end

  config.after do
    Monarch::Model::Repository.clear_local_identity_map
    set_current_user(nil)
    Timecop.return
  end
end

module Spec::Example::Subject::ExampleMethods
  def with_rack_env(temporary_env)
    current_env = Object.send(:remove_const, :RACK_ENV)
    Object.const_set(:RACK_ENV, temporary_env)
    yield
  ensure
    Object.send(:remove_const, :RACK_ENV)
    Object.const_set(:RACK_ENV, current_env)
  end

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

  def session
    last_request.env['rack.session']
  end

  def warden
    last_request.env["warden"]
  end

  def current_user
    current_session.has_request?? warden.user : @current_user
  end

  def login_as(user, opts={})
    @current_user = user
    super
    user
  end

  def xhr(verb, path, params = {})
    send(verb, path, params, "HTTP_X_REQUESTED_WITH" => "XMLHttpRequest")
  end

  [:get, :put, :post, :delete].each do |verb|
    define_method("xhr_#{verb}") do |path, params = {}|
      xhr(verb, path, params)
    end
  end
end

class Rack::MockResponse
  def body_from_json
    JSON.parse(body)
  end

  def dataset
    body_from_json["dataset"]
  end
end

class Rack::Test::Session
  def has_request?
    @rack_mock_session.has_request?
  end
end

class Rack::MockSession
  def has_request?
    !@last_request.nil?
  end
end

at_exit do
  Spec::Runner.run
end