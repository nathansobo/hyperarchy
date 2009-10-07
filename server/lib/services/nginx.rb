module Services
  class Nginx
    class << self
      def run
        raise "Cannot run nginx in the foreground"
      end

      def start
        exec "sudo /usr/bin/env nginx -c #{File.dirname(__FILE__)}/../../config/nginx.conf"
      end

      def stop
        exec "sudo kill -QUIT `cat /opt/local/var/run/nginx/nginx.pid`"
      end
    end
  end
end