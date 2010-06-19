require File.expand_path("#{File.dirname(__FILE__)}/thor_helper")

class Server < Thor
  desc "start [environment=development] [port=9000]", "starts the app server for the specified environment in the background"
  def start(env="development", port=9000)
    require "daemons"
    options = daemon_options(:start)
    Dir.mkdir(options[:dir]) unless File.exists?(options[:dir])
    Daemons.run_proc("ce3_thin_server", options) do
      require_and_run(env, port)
    end
  end

  desc "stop [environment=development]", "stops the app server for the specified environment"
  def stop(env="development")
    require "daemons"
    Daemons.run_proc("ce3_thin_server", daemon_options(:stop)) {}
  end

  desc "foreground [environment=development] [port=9000]", "runs the app server in the foreground"
  def foreground(env="development", port=9000)
    require_and_run(env, port)
  end

  private

  def daemon_options(start_or_stop)
    {
      :app_name   => "hyperarchy_server",
      :ARGV       => [start_or_stop.to_s],
      :dir_mode   => :normal,
      :dir        => "#{dir}/../../log",
      :multiple   => false,
      :mode       => :exec,
      :backtrace  => true,
      :log_output => true
    }
  end

  def require_and_run(env, port)
    ENV['RACK_ENV'] = env
    require "#{dir}/../lib/hyperarchy"
    Hyperarchy::App.run! :host => 'localhost', :port => port
  end

  def dir
    File.dirname(__FILE__)
  end
end
