require File.expand_path("#{File.dirname(__FILE__)}/thor_helper")

class Server < Thor
  map "fg" => :foreground
  
  desc "start [environment=development] [port]", "starts the app server for the specified environment in the background"
  def start(env="development", port=nil)
    run(:start, env, true, port)
  end

  desc "stop [environment=development]", "stops the app server for the specified environment"
  def stop(env="development")
    run(:stop, env, true)
  end

  desc "foreground [environment=development] [port]", "runs the app server in the foreground"
  def foreground(env="development", port=nil)
    run(:start, env, false, port)
  end

  private

  PORTS = {
    "development" => 9000,
    "demo" => 3001,
    "production" => 3000
  }

  def run(command, env, daemonize, port_override=nil)
    require "thin"
    options = {
      :rackup => "#{SERVER_ROOT}/script/hyperarchy.ru",
      :daemonize => daemonize,
      :environment => env,
      :port => port_override || PORTS[env],
      :threaded => true,
    }

    if daemonize
      options[:pid] = pid_file(env)
      options[:log] = log_file(env)
    end

    Thin::Command.script = "bundle exec thin"
    command = Thin::Command.new(command, options)
    exec(command.shellify)
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
