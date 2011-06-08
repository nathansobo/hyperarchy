require 'rubygems'
require 'rspec'

$LOAD_PATH.unshift(File.expand_path("../../lib", __FILE__))
require 'prequel'
require 'machinist'
require 'prequel/machinist_adaptor'
Sequel.postgres("prequel_test")
Prequel::DB # touch the Prequel::DB constant so it gets assigned to the connection made above

Dir[File.expand_path("../support/**/*.rb", __FILE__)].each {|f| require f}

RSpec.configure do |config|
  config.mock_with :rr
  config.include BeLikeQueryMatcher
  config.include TimeTravel
  config.after do
    Prequel::Relations::Table.drop_all_tables
    Prequel::Record.subclasses.each do |subclass|
      subclass.remove_class
    end
    Prequel.clear_subscription_nodes
    Prequel.clear_session
  end
end
