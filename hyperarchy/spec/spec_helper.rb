# This file is copied to spec/ when you run 'rails generate rspec:install'
ENV["RAILS_ENV"] ||= 'test'
require File.expand_path("../../config/environment", __FILE__)
require 'rspec/rails'
require 'machinist'
require 'monarch/machinist_monarch_adaptor'
require 'rr'
require 'faker'

# Requires supporting ruby files with custom matchers and macros, etc,
# in spec/support/ and its subdirectories.
Dir[Rails.root.join("spec/support/**/*.rb")].each {|f| require f}

RSpec.configure do |config|
  config.mock_with :rr
  config.include SpecMethods
  config.include ModelSpecMethods, :type => :model
  config.before do
    Monarch::Model::Repository.clear_tables
    Monarch::Model::Repository.initialize_local_identity_map
    Mailer.reset
    Sham.reset

    Organization.make(:name => "Hyperarchy Social", :suppress_membership_creation => true, :social => true)
    User.make(:first_name => "Guest", :last_name => "User", :guest => true)
  end

  # TODO: Why doesn't a block taking a block work with RR?
  def Hyperarchy.defer
    yield
  end

  Mailer.use_fake
end
