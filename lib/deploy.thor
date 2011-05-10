$LOAD_PATH << File.dirname(__FILE__)
require 'deploy'

class Provision < Thor
  default_task :provision

  desc 'provision [env=staging]', 'provision a new staging server'
  def provision(env='staging')
    AppServer.new(env).provision
  end

  desc 'install_public_key [env=staging]', 'install the public ssh key after entering the root password'
  def install_public_key(env='staging')
    AppServer.new(env).install_public_key
  end
end

class Deploy < Thor
  default_task :deploy

  desc 'deploy [env=staging] [ref=origin/rails3]', 'deploy the specified revision to the specified environment'
  def deploy(env='staging', ref='origin/rails3')
    AppServer.new(env).deploy(ref)
  end

  desc "minify_js [env=staging]", "minify javascript for upload."
  def minify_js(env="staging")
    ENV['RAILS_ENV'] = env
    require File.expand_path('config/environment')
    GiftWrapper.clear_package_dir
    GiftWrapper.combine_js("underscore", "jquery-1.5.2")
    GiftWrapper.combine_js('app')
  end
end