# Load the rails application
require File.expand_path('../application', __FILE__)

# Initialize the rails application
Decider::Application.initialize!

require 'prequel_extensions'
require 'event_observer'

EventObserver.observe(User, Question, Answer, Ranking)

class FakeRedis
  def lock(name)
  end

  def unlock(name)
  end
end

$redis = FakeRedis.new
