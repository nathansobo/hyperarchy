$: << "#{ROOT}/server/vendor/net-ssh-shell/lib"
require "net/ssh/shell"
require "git"

class Deployment
  attr_reader :shell, :local_repo

  def deploy(env, ref)
    @local_repo = Git.open(ROOT)

    cd deploy_dir(env)
    old_ref = git "rev-parse", :HEAD
    new_ref = local_repo.revparse(ref)

    git :fetch
    git :reset, "--hard", ref
    git :clean, "-df"
    bundle :install if gemfile_changed?(old_ref, new_ref)
    god :unmonitor, "hyperarchy_#{env}"
    thor "server:stop", env
    sleep 1
    thor "db:migrate", env
    thor "deploy:minify_js", env
    thor "server:start", env
    god :monitor, "hyperarchy_#{env}"
  end

  def deploy_global_config
    system("rsync -ave ssh #{ROOT}/global_config hyperarchy@hyperarchy.com:")
    god :load, "/home/hyperarchy/global_config/hyperarchy.god"
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

  commands :cd, :git, :bundle, :thor, :sudo
end
