class Nginx < Thor
  desc "start", "start nginx"
  def start
    render_nginx_conf
    system "sudo nginx -c #{conf_file_path}"
  end

  desc "stop", "stop nginx"
  def stop
    render_nginx_conf
    system "sudo nginx -s stop -c #{conf_file_path}"
  end

  desc "reload", "reload nginx config"
  def reload
    render_nginx_conf
    system "sudo nginx -s reload -c #{conf_file_path}"
  end

  desc "test", "test nginx config"
  def test
    render_nginx_conf
    system "sudo nginx -t -c #{conf_file_path}"
  end

  protected
  def conf_file_path
    File.expand_path('../../deploy/resources/nginx/nginx.conf', __FILE__)
  end

  def render_nginx_conf
    require 'erb'
    File.open(conf_file_path, 'w') do |f|
      stage = 'development'
      f.write(ERB.new(File.read(conf_file_path + ".erb")).result(binding))
    end
  end
end