# Add your own tasks in files placed in lib/tasks ending in .rake,
# for example lib/tasks/capistrano.rake, and they will automatically be available to Rake.

require File.expand_path('../config/application', __FILE__)

Hyperarchy::Application.load_tasks

require 'resque/tasks'
require 'resque_scheduler/tasks'
task "resque:setup" => :environment

task "resque:scheduler_setup" do
  $stdout.sync = true
end
