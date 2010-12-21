require "#{File.dirname(__FILE__)}/ssh_client"

require "git"

class Deployment < SshClient
  attr_reader :local_repo

  def deploy(env, ref)
    @local_repo = Git.open(HYPERARCHY_ROOT)

    cd deploy_dir(env)
    old_ref = git "rev-parse", :HEAD
    new_ref = local_repo.revparse(ref)

    git :fetch
    git :reset, "--hard", ref
    source ".rvmrc" if rvmrc_changed?(old_ref, new_ref)
    bundle :install if gemfile_changed?(old_ref, new_ref)
    sudo :monit, :unmonitor, "hyperarchy_#{env}"
    thor "deploy:target:display_maintenance_page"
    git :clean, "-df"
    thor "server:stop", env
    thor "db:migrate", env
    thor "deploy:target:copy_assets"
    thor "deploy:target:minify_js", env
    thor "server:start", env
    sudo :monit, :monitor, "hyperarchy_#{env}"
    thor "deploy:target:remove_maintenance_page"
  end

  def deploy_global_config
    local("rsync -ave ssh #{HYPERARCHY_ROOT}/global_config hyperarchy@hyperarchy.com:")
    reload_monit_config
    reload_nginx_config
  end

  def reload_monit_config
    if sudo :monit, "-t"
      sudo :monit, :reload
    else
      puts "syntax error in monit config. did not attempt to load it."
    end
  end

  def reload_nginx_config
    if sudo "nginx -t -p ~/global_config/ -c nginx.conf"
      sudo "nginx -p ~/global_config/ -c nginx.conf -s reload"
    else
      puts "syntax error in nginx config. did not attempt to load it."
    end
  end

  protected
  def god(*args)
    sudo "-i", :god, *args
  end

  def gemfile_changed?(old_ref, new_ref)
    local_repo.diff(old_ref, new_ref).path('Gemfile').patch != ""
  end

  def rvmrc_changed?(old_ref, new_ref)
    local_repo.diff(old_ref, new_ref).path('.rvmrc').patch != ""
  end

  def deploy_dir(env)
    "/home/hyperarchy/#{env}"
  end
end
