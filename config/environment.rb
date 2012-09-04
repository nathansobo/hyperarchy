# Load the rails application
require File.expand_path('../application', __FILE__)

# Initialize the rails application
Decider::Application.initialize!

require 'prequel_extensions'

class FakeRedis
  def lock(name)
  end

  def unlock(name)
  end
end

$redis = FakeRedis.new
