set :application, 'hyperarchy'
set :deploy_to, '/app'
set :repository,  'git@github.com:nathansobo/hyperarchy.git'
set :scm, :git
set :branch, 'rails3'
set :deploy_via, :remote_cache
set :user, 'root'
set :rvm_ruby_string, '1.9.2-p180'
set :stage_dir, 'config/deploy/stages'

$:.unshift(File.expand_path('./lib', ENV['rvm_path']))
require 'rvm/capistrano'
require 'bundler/capistrano'
require 'capistrano/ext/multistage'

load 'config/deploy/ssh.rb'
load 'config/deploy/services.rb'

namespace :deploy do
  desc "Deploy the app for the first time"
  task :cold do
    update
    create_database
    migrate
    start
  end

  task :create_database do
    rake = fetch(:rake, "rake")
    rails_env = fetch(:rails_env, "production")
    migrate_env = fetch(:migrate_env, "")
    migrate_target = fetch(:migrate_target, :latest)

    directory =
      case migrate_target.to_sym
        when :current then current_path
        when :latest  then latest_release
        else raise ArgumentError, "unknown migration target #{migrate_target.inspect}"
      end

    run "cd #{directory}; #{rake} RAILS_ENV=#{rails_env} #{migrate_env} db:create"
  end
  
  task :start do
    # restart unicorn here
  end

  task :restart do
    # restart unicorn here
  end
end

before :deploy, :add_ssh_agent
