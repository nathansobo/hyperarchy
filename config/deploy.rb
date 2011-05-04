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
  task :restart do
    # restart unicorn here
  end
end

before :deploy, :add_ssh_agent
