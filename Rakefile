#!/usr/bin/env rake
# Add your own tasks in files placed in lib/tasks ending in .rake,
# for example lib/tasks/capistrano.rake, and they will automatically be available to Rake.

require File.expand_path('../config/application', __FILE__)

Hyperarchy::Application.load_tasks

task :nof do
  system %{find . -name *spec.rb | xargs sed -E -i "" "s/f+(it|describe) +(['\\"])/\\1 \\2/g"}
end
