require 'rubygems'

$LOAD_PATH.unshift(File.expand_path("../../lib", __FILE__))
require 'prequel'
Sequel.postgres("prequel_test")
Prequel::DB # touch the Prequel::DB constant so it gets assigned to the connection made above

Dir[File.expand_path("../support/**/*.rb", __FILE__)].each {|f| require f}

RSpec.configure do |config|
  config.mock_with :rr
  config.include BeLikeQueryMatcher
  config.after do
    Prequel::Relations::Table.drop_all_tables
    Prequel::Record.subclasses.each do |subclass|
      subclass.remove_class
    end
    Prequel.clear_session
  end
end
