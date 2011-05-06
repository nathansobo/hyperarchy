class AppServer
  def initialize(stage)
    @stage = stage
  end

  def hostname
    'rails.hyperarchy.com'
  end

  def install_public_key
    puts "enter root password for #{hostname}:"
    password = $stdin.gets.chomp
    ssh_session('root', password)
    run 'mkdir -p ~/.ssh'
    run "echo '#{File.read(public_key_path).chomp}' >> ~/.ssh/authorized_keys"
    puts
    system "ssh-add #{private_key_path}"
  end

  def provision
#    update_packages
#    create_hyperarchy_user
#    create_log_directory
#    install_package 'git'
#    install_postgres
#    install_nginx
#    install_rvm
#    install_ruby
    puts
  end

  def private_key_path
    File.expand_path('keys/id_rsa')
  end

  def public_key_path
    File.expand_path('keys/id_rsa.pub')
  end

  def update_packages
    run "yes | apt-get update"
    run "yes | apt-get upgrade"
  end

  def create_hyperarchy_user
    run "mkdir /home/hyperarchy"
    run "useradd hyperarchy -d /home/hyperarchy -s /bin/bash"
    run "cp -r /root/.ssh /home/hyperarchy/.ssh"
  end

  def create_log_directory
    run "mkdir -p /log"
    run "chown hyperarchy /log"
  end

  def install_postgres
    install_packages 'postgresql', 'libpq-dev'
    run "su - postgres"
    run "createuser hyperarchy --createdb --no-superuser --no-createrole"
    run "exit"
  end

  def install_nginx
    install_packages 'libpcre3-dev', 'build-essential', 'libssl-dev'
    run "cd /opt"
    run "wget http://nginx.org/download/nginx-0.8.54.tar.gz"
    run "tar -zxvf nginx-0.8.54.tar.gz"
    run "cd /opt/nginx-0.8.54/"
    run "./configure --prefix=/opt/nginx --user=nginx --group=nginx --with-http_ssl_module"
    run "make"
    run "make install"
    run "adduser --system --no-create-home --disabled-login --disabled-password --group nginx"
    run "ln -s /opt/nginx/sbin/nginx /usr/local/sbin/nginx"
    upload! 'lib/deploy/resources/nginx/nginx.conf', '/opt/nginx/conf/nginx.conf'
    upload! 'lib/deploy/resources/nginx/nginx_upstart.conf', '/etc/init/nginx.conf'
    upload! 'lib/deploy/resources/nginx/hyperarchy.crt', '/etc/ssl/certs/hyperarchy.crt'
    upload! 'lib/deploy/resources/nginx/hyperarchy.key', '/etc/ssl/private/hyperarchy.key'
    run "start nginx"
  end

  def install_rvm
    run "bash < <(curl -s https://rvm.beginrescueend.com/install/rvm)"
    run "rvm get latest"
    run "source /usr/local/rvm/scripts/rvm"
    upload 'resources/.bashrc', '/root/.bashrc'
    run 'cp /root/.bashrc /home/hyperarchy/.bashrc'
  end

  def install_ruby
    install_packages *%w(
      build-essential bison openssl libreadline6 libreadline6-dev curl zlib1g zlib1g-dev libssl-dev
      libyaml-dev libsqlite3-0 libsqlite3-dev sqlite3 libxml2-dev libxslt-dev autoconf libc6-dev ncurses-dev
    )
    run "rvm install 1.9.2-p180"
    run "rvm use 1.9.2-p180 --default"
    run "gem install bundler --version 1.0.12"
  end

  protected

  def install_packages(*packages)
    run "yes | apt-get install", *packages
  end
  alias_method :install_package, :install_packages

  PROMPT_REGEX = /[$%#>] (\z|\e)/n
  def run(*command)
    command = command.join(' ')
    output = shell.cmd(command) {|data| print data.gsub(/(\r|\r\n|\n\r)+/, "\n") }
    command_regex = /#{Regexp.escape(command)}/
    output.split("\n").reject {|l| l.match(command_regex) || l.match(PROMPT_REGEX)}.join("\n")
  end

  class UploadProgressHandler
    def on_open(uploader, file)
      puts "starting upload: #{file.local} -> #{file.remote} (#{file.size} bytes)"
    end

    def on_put(uploader, file, offset, data)
      puts "writing #{data.length} bytes to #{file.remote} starting at #{offset}"
    end

    def on_close(uploader, file)
      puts "finished with #{file.remote}"
    end

    def on_mkdir(uploader, path)
      puts "creating directory #{path}"
    end
  end

  def upload!(from, to)
    sftp_session.upload!(from, to, :progress => UploadProgressHandler.new)
  end

  def shell
    @shell ||= Net::SSH::Telnet.new('Session' => ssh_session, 'Prompt' => PROMPT_REGEX)
  end

  def ssh_session(user="root", password=nil)
    @ssh_session ||= Net::SSH.start(hostname, user, :password => password)
  end

  def sftp_session
    @sftp_session ||= Net::SFTP::Session.new(ssh_session).tap do |sftp|
      sftp.loop { sftp.opening? }
    end
  end
end