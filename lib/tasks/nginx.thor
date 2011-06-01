class Nginx < Thor
  desc "start", "start nginx"
  def start
    system "sudo nginx -c #{conf_file_path}"
  end

  desc "stop", "stop nginx"
  def stop
    system "sudo nginx -s stop -c #{conf_file_path}"
  end

  desc "reload", "reload nginx config"
  def reload
    system "sudo nginx -s reload -c #{conf_file_path}"
  end

  desc "test", "test nginx config"
  def test
    system "sudo nginx -t -c #{conf_file_path}"
  end

  protected
  def conf_file_path
    File.expand_path('../../deploy/resources/nginx/nginx.conf', __FILE__)
  end
end