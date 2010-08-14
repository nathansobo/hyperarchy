dir = File.dirname(__FILE__)
ROOT = File.expand_path("#{dir}/..")


God.watch do |w|
  w.name = "nginx"
  w.dir = ROOT
  w.start = "sudo nginx -p #{ROOT}/global_config/ -c nginx.conf"
  w.pid_file = "#{ROOT}/log/nginx.pid"

  w.start_if do |start|
    start.condition(:process_running) do |c|
      c.interval = 5
      c.running = false
    end
  end
end

%w[demo production].each do |env|
  God.watch do |w|
    w.name = "hyperarchy_#{env}"
    w.dir = ROOT
    w.start = "cd /home/hyperarchy/#{env} && thor server:start #{env}"
    w.stop = "cd /home/hyperarchy/#{env} && thor server:stop #{env}"
    w.pid_file = "#{ROOT}/log/hyperarchy_#{env}.pid"
    w.behavior(:clean_pid_file)
    w.uid = "hyperarchy"
    w.gid = "hyperarchy"

    w.start_if do |start|
      start.condition(:process_running) do |c|
        c.interval = 1.seconds
        c.running = false
      end
    end
  end
end