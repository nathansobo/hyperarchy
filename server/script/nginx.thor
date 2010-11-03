require File.expand_path("#{File.dirname(__FILE__)}/thor_helper")

class Nginx < Thor

  desc "start", "starts nginx pointed at the global config"
  def start
    exec(nginx_command)
  end

  desc "stop", "stops nginx"
  def stop
    exec("#{nginx_command} -s stop")
  end

  desc "reload", "reloads the nginx config"
  def reload
    exec("#{nginx_command} -s reload")
  end

  desc "test", "tests the nginx config"
  def test
    exec("#{nginx_command} -t")
  end

  protected

  def nginx_command
    "sudo nginx -p #{HYPERARCHY_ROOT}/global_config/ -c nginx.conf"
  end
end