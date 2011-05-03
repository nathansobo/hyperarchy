$:.unshift(File.expand_path('./lib', ENV['rvm_path']))
require "rvm/capistrano"
require "bundler/capistrano"
require 'capistrano/ext/multistage'

set :application, "hyperarchy"
set :repository,  "git@github.com:nathansobo/hyperarchy.git"
set :scm, :git
set :branch, "rails3"
set :deploy_via, :remote_cache
set :user, :root
set :rvm_ruby_string, '1.9.2-p180'

ssh_options[:keys] = [File.expand_path('config/provision/keys/id_rsa')]
ssh_options[:forward_agent] = true

namespace :deploy do
  task :restart do
    # restart unicorn here
  end
end

before :deploy, :add_ssh_agent
task :add_ssh_agent do
  unless run_locally("ssh-add -l") =~ %r{config/provision/keys/id_rsa}
    run_locally("ssh-add #{ssh_options[:keys].first}")
  end
end
