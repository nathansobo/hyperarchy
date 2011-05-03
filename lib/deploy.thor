$LOAD_PATH << File.dirname(__FILE__)
require 'deploy'

class Provision < Thor
  desc 'provision:staging', 'provision a new staging server'
  def staging
    AppServer.new(:staging).provision
  end
end

class Deploy < Thor
  desc 'deploy:staging [rev=rails3]', 'deploy the specified revision to staging or rails3 by default'
  def staging(rev='master')
  end
end