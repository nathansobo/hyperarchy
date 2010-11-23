$: << "#{HYPERARCHY_ROOT}/server/vendor/net-ssh-shell/lib"
require "net/ssh/shell"
require "git"

class Deployment
  attr_reader :shell, :local_repo

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
    system("rsync -ave ssh #{HYPERARCHY_ROOT}/global_config hyperarchy@hyperarchy.com:")
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

  def shell
    @shell ||= Net::SSH.start("hyperarchy.com", "hyperarchy").shell
  end

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

  def execute!(*args)
    command = args.join(" ")
    puts command
    exit_status, output = shell.execute!(command)
    raise "#{command} executed non-zero" unless exit_status == 0
    output
  end

  def self.commands(*commands)
    commands.each do |command|
      define_method(command) do |*args|
        execute!(command, *args)
      end
    end
  end

  commands :cd, :git, :bundle, :thor, :sudo, :touch, :rm, :source
end
