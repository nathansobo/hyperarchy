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
  desc 'staging [rev=rails3]', 'deploy the specified revision to staging or rails3 by default'
  def staging(rev='master')
  end
end