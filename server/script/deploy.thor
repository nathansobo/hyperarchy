class Deploy < Thor
  desc "production [ref=origin/master]", "deploys the specified ref to production"
  def production(ref="origin/master")
    deploy(:production, ref)
  end

  desc "demo [ref=origin/master]", "deploys the specified ref to demo"
  def demo(ref="origin/master")
    deploy(:demo, ref)
  end

  desc "global", "rsyncs nginx and god config files to the server and reloads them"
  def global
    require "#{File.dirname(__FILE__)}/deploy"
    Deployment.new.deploy_global_config
  end

  private
  def deploy(env, ref)
    require "#{File.dirname(__FILE__)}/deploy"
    Deployment.new.deploy(env, ref)
  end
end