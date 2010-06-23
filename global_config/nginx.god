dir = File.dirname(__FILE__)
ROOT = File.expand_path("#{dir}/..")

God.watch do |w|
  w.name = "nginx"
  w.dir = ROOT
  w.start = "sudo nginx -p #{ROOT}/global_config/ -c nginx.conf"
  w.grace = 15.seconds
  w.pid_file = "#{ROOT}/log/nginx.pid"

  w.start_if do |start|
    start.condition(:process_running) do |c|
      c.interval = 10
      c.running = false
    end
  end
end