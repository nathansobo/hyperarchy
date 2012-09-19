# Load the rails application
require File.expand_path('../application', __FILE__)

# Initialize the rails application
Hyperarchy::Application.initialize!

redis_uri = URI.parse(ENV["REDISTOGO_URL"])
$redis = Redis.new(:host => redis_uri.host, :port => redis_uri.port, :password => redis_uri.password)

require 'prequel_extensions'
require 'event_observer'

EventObserver.observe(User, Question, Answer, Ranking, Vote, QuestionComment)
