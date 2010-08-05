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
    require "#{File.dirname(__FILE__)}/deployment"
    Deployment.new.deploy_global_config
  end

  desc "minify_js [env=production]", "minify the javascript. should be run on the server to which you are deploying."
  def minify_js(env="production")
    require_hyperarchy(env)
    GiftWrapper.clear_package_dir
    GiftWrapper.combine_js('application')
  end

  private
  def deploy(env, ref)
    require "#{File.dirname(__FILE__)}/deployment"
    Deployment.new.deploy(env, ref)
  end
end