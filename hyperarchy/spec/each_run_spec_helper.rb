Dir[Rails.root.join("spec/support/**/*.rb")].each {|f| require f}

RSpec.configure do |config|
  config.mock_with :rr
  config.include SpecMethods
  config.include ModelSpecMethods, :type => :model
  config.include ControllerSpecMethods, :type => :controller

  config.before do
    Prequel.clear_tables
    Prequel.clear_session
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