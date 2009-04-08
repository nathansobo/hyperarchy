require "#{File.dirname(__FILE__)}/../../lib/june"
require "rubygems"
require "spec"

Spec::Runner.configure do |config|
  config.mock_with :rr
end

June.origin.connection = Sequel.sqlite

class User < June::Tuple
  
end

class Pet < June::Tuple

end

class Species < June::Tuple

end