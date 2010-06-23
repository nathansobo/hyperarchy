dir = File.dirname(__FILE__)
ROOT = File.expand_path("#{dir}/..")

%w[demo production].each do |env|
  God.watch do |w|
    w.name = "hyperarchy_#{env}"
    w.dir = ROOT
    w.start = "thor server:start #{env}"
    w.stop = "thor server:stop #{env}"
    w.grace = 10.seconds
    w.pid_file = "#{ROOT}/log/hyperarchy_#{env}.pid"
    w.behavior(:clean_pid_file)

    w.start_if do |start|
      start.condition(:process_running) do |c|
        c.interval = 5.seconds
        c.running = false
      end
    end
  end
end