require File.expand_path('../thor_helper', __FILE__)

class Provision < Thor
  default_task :demo

  [:production, :demo, :vm].each do |env|
    desc env, "provision the #{env} server"
    define_method env, do
      require 'deploy'
      AppServer.new(env.to_s).provision
    end
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
end

class Deploy < Thor
  default_task :demo

  [:production, :demo, :vm].each do |env|
    desc "#{env} [ref=origin/master] [--unpack_secrets]", "deploy to the specified environment"
    method_options :unpack_secrets => :boolean
    define_method env do |ref='origin/master'|
      require 'deploy'
      AppServer.new(env.to_s).deploy(ref, options)
    end
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
end
