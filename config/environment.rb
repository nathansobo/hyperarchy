# Load the rails application
require File.expand_path('../application', __FILE__)

# Initialize the rails application
Hyperarchy::Application.initialize!

redis_uri = URI.parse(ENV["REDISTOGO_URL"] || ENV["REDISCLOUD_URL"])
$redis = Redis.new(:host => redis_uri.host, :port => redis_uri.port, :password => redis_uri.password)

APP_NAME = ENV['APP_NAME'] || 'Hyperarchy'
APP_DOMAIN = ENV['APP_DOMAIN'] || 'hyperarchy.githubapp.com'
APP_URL = ENV['APP_URL'] || "https://#{APP_DOMAIN}"
MAILGUN_URL = "https://api:#{ENV['MAILGUN_KEY']}@api.mailgun.net/v2/decider.cc"

require 'prequel_extensions'
require 'event_observer'

require 'thread/pool'
$thread_pool = Thread.pool(4)

EventObserver.observe(User, Question, Answer, Preference, Ranking, QuestionComment)
