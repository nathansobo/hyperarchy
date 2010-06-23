require File.expand_path("#{File.dirname(__FILE__)}/thor_helper")

class Server < Thor
  desc "start [environment=development] [port]", "starts the app server for the specified environment in the background"
  def start(env="development", port=nil)
    require "daemons"
    options = daemon_options(:start)
    Dir.mkdir(options[:dir]) unless File.directory?(options[:dir])
    Daemons.run_proc("hyperarchy_#{env}", options) do
      require_and_run(env, port)
    end
  end

  desc "stop [environment=development]", "stops the app server for the specified environment"
  def stop(env="development")
    require "daemons"
    Daemons.run_proc("hyperarchy_#{env}", daemon_options(:stop)) {}
  end

  desc "foreground [environment=development] [port]", "runs the app server in the foreground"
  def foreground(env="development", port=nil)
    require_and_run(env, port)
  end

  private

  def daemon_options(start_or_stop)
    {
      :app_name   => "hyperarchy_server",
      :ARGV       => [start_or_stop.to_s],
      :dir_mode   => :normal,
      :dir        => File.expand_path("#{dir}/../../log"),
      :multiple   => false,
      :mode       => :exec,
      :backtrace  => true,
      :log_output => true
    }
  end

  def require_and_run(env, port)
    ENV['RACK_ENV'] = env
    require "#{dir}/../lib/hyperarchy"
    options = { :host => 'localhost' }
    options[:port] = port if port
    Hyperarchy::App.run!(options)
  end

  def dir
    File.dirname(__FILE__)
  end
end
