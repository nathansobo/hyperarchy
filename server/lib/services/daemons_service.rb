module Services
  class DaemonsService
    class << self
      def method_missing(name, *args, &block)
        new.send(name, *args, &block)
      end
    end

    def run
      control "run"
    end

    def start
      control "start"
    end

    def stop
      control "stop"
    end

    def control(command)
      require "daemons"
      Daemons.run_proc(app_name, :dir_mode => :normal, :dir => "#{SERVER_ROOT}/service", :ARGV => [command], &proc)
    end
  end
end