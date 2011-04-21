$:.unshift(File.expand_path('./lib', ENV['rvm_path']))
require "rvm/capistrano"
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
  task :restart, :roles => :app do
    # restart unicorn here
  end
end

namespace :bundler do
  task :create_symlink, :roles => :app do
    shared_dir = File.join(shared_path, 'bundle')
    release_dir = File.join(release_path, '.bundle')
    run("mkdir -p #{shared_dir} && ln -s #{shared_dir} #{release_dir}")
  end

  task :install, :roles => :app do
    run "cd #{release_path} && bundle install --deployment --without development test"

    on_rollback do
      if previous_release
        run "cd #{previous_release} && bundle install --deployment --without development test"
      else
        logger.important "no previous release to rollback to, rollback of bundler:install skipped"
      end
    end
  end

  task :bundle_new_release, :roles => :db do
    bundler.create_symlink
    bundler.install
  end
end

task :add_ssh_agent do
  unless run_locally("ssh-add -l") =~ %r{config/provision/keys/id_rsa}
    run_locally("ssh-add #{ssh_options[:keys].first}")
  end
end

before "deploy", "add_ssh_agent"
after "deploy:rollback:revision", "bundler:install"
after "deploy:update_code", "bundler:bundle_new_release"