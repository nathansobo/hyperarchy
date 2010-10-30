require File.expand_path("#{File.dirname(__FILE__)}/thor_helper")

class Server < Thor
  map "fg" => :foreground
  
  desc "start [environment=development] [port]", "starts the app server for the specified environment in the background"
  def start(env="development", port=nil)
    require_and_run(env, port, :daemonize)
  end

  desc "stop [environment=development]", "stops the app server for the specified environment"
  def stop(env="development")
    require "thin"
    Thin::Server.kill(pid_file(env), 0)
  end

  desc "foreground [environment=development] [port]", "runs the app server in the foreground"
  def foreground(env="development", port=nil)
    require_and_run(env, port)
  end

  private

  def require_and_run(env, port_override, daemonize=false)
    require_hyperarchy(env)
    port = port_override || Hyperarchy::App.port
    server = Thin::Server.new(Hyperarchy::App, port)
    server.threaded = true

    if daemonize
      server.log_file = log_file(env)
      server.pid_file = pid_file(env)
      server.daemonize
      Signal.trap("QUIT") { exit }
      Signal.trap("INT") { exit }
    end
    server.start
  end

  def pid_file(env)
    "#{LOG_DIR}/hyperarchy_#{env}.pid"
  end

  def log_file(env)
    "#{LOG_DIR}/thin_#{env}.log"
  end

  def dir
    File.dirname(__FILE__)
  end
end
