Dir[Rails.root.join("spec/support/**/*.rb")].each {|f| require f}
require 'deploy'

Rails.application.reload_routes!

RSpec.configure do |config|
  config.mock_with :rr
  config.include SpecMethods
  config.include ModelSpecMethods, :type => :model
  config.include ModelSpecMethods, :type => :mailer
  config.include ControllerSpecMethods, :type => :controller

  config.before do
    Prequel.test_mode = true
    Prequel.clear_tables
    stub($redis).lock
    stub($redis).unlock
    stub(Resque::Status) do |stub|
      stub.get
      stub.set
      stub.should_kill?
      stub.create
    end
    stub(Resque).enqueue
    Sham.reset

    Organization.make(:name => "Hyperarchy Social", :suppress_membership_creation => true, :social => true)
    User.make(:first_name => "Guest", :last_name => "User", :guest => true, :default_guest => true)
    clear_deliveries
  end

  config.after do
    Prequel.clear_session_in_test_mode
  end

  # TODO: Why doesn't a block taking a block work with RR?
  def Hyperarchy.defer
    yield
  end
end
