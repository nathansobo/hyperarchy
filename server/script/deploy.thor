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

  class Target < Thor
    desc "minify_js [env=production]", "minify the javascript. should be run on the server to which you are deploying."
    def minify_js(env="production")
      require_hyperarchy(env)
      GiftWrapper.combine_js("underscore", "jquery-1.4.2")
      GiftWrapper.combine_js('application')
    end

    desc "display_maintenance_page", "touches the 'offline' file in the application directory, which causes nginx to display the maintenance page"
    def display_maintenance_page
      require "fileutils"
      FileUtils.touch("#{ROOT}/offline")
    end

    desc "display_maintenance_page", "removes the 'offline' file in the application directory, which causes nginx to not display the maintenance page"
    def remove_maintenance_page
      require "fileutils"
      FileUtils.rm("#{ROOT}/offline")
    end
    
    desc "copy_assets", "copy static assets to the public directory to be served by nginx"
    def copy_assets
      require "fileutils"

      FileUtils.mkdir_p(PUBLIC_ROOT)
      FileUtils.rm_r(Dir.glob("#{PUBLIC_ROOT}/**/*"),:force => true)
      FileUtils.cp_r("#{CLIENT_ROOT}/images", "#{PUBLIC_ROOT}/images")
      FileUtils.mkdir("#{PUBLIC_ROOT}/stylesheets")
      FileUtils.cp("#{CLIENT_ROOT}/stylesheets/hyperarchy.css", "#{PUBLIC_ROOT}/stylesheets")
    end
  end

  private
  def deploy(env, ref)
    require "#{File.dirname(__FILE__)}/deployment"
    Deployment.new.deploy(env, ref)
  end
end