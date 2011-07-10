require File.expand_path('../thor_helper', __FILE__)

class Provision < Thor
  default_task :demo

  desc 'production', 'provision the production server'
  def production
    provision('production')
  end

  desc 'demo', 'provision the demo server'
  def demo
    provision('demo')
  end

  desc 'vm', 'provision the vm'
  def vm
    provision('vm')
  end

  desc 'install_public_key [env=demo]', 'install the public ssh key after entering the root password'
  def install_public_key(env='demo')
    require 'deploy'
    AppServer.new(env).install_public_key
  end

  desc 'reload_nginx_config [env=demo]', 'upload, test, and reload the nginx.conf'
  def reload_nginx_config(env='demo')
    require 'deploy'
    AppServer.new(env).reload_nginx_config
  end

  desc 'reinstall_services [env=demo]', 'reinstall all services with the maintenance page up, then start them'
  def reinstall_services(env='demo')
    require 'deploy'
    AppServer.new(env).reinstall_services
  end

  protected

  def provision(env)
    require 'deploy'
    AppServer.new(env).provision
  end
end

class Deploy < Thor
  default_task :demo

  desc 'production [ref=origin/master]', 'deploy the specified revision to production'
  def production(ref='origin/master')
    deploy('production', ref)
  end

  desc 'production [ref=origin/master]', 'deploy the specified revision to demo'
  def demo(ref='origin/master')
    deploy('demo', ref)
  end

  desc 'production [ref=origin/master]', 'deploy the specified revision to the vm'
  def vm(ref='origin/master')
    deploy('vm', ref)
  end

  desc "minify_js [env=demo]", "minify javascript for upload."
  def minify_js(env="demo")
    require 'deploy'
    ENV['RAILS_ENV'] = env
    require File.expand_path('config/environment')
    GiftWrapper.clear_package_dir
    GiftWrapper.combine_js("underscore", "jquery-1.5.2")
    GiftWrapper.combine_js('app')
  end

  protected

  def deploy(env, ref)
    require 'deploy'
    AppServer.new(env).deploy(ref)
  end
end
