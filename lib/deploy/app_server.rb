class AppServer
  def initialize(stage)
    @stage = stage
  end

  def hostname
    'rails.hyperarchy.com'
  end

  def provision
    update_packages
    create_hyperarchy_user
    install_package 'git'
    install_postgres
    install_nginx
    install_rvm
    install_ruby
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

  def install_postgres
    install_packages 'postgresql', 'libpq-dev'
    run "sudo -u postgres createuser hyperarchy --createdb --no-superuser --no-createrole"
  end

  def install_nginx
    install_packages 'libpcre3-dev', 'build-essential', 'libssl-dev'
    run "cd /opt"
    run "wget http://nginx.org/download/nginx-0.8.54.tar.gz"
    run "tar -zxvf nginx-0.8.54.tar.gz"
    run "cd /opt/nginx-0.8.54/"
    run "./configure --prefix=/opt/nginx --user=nginx --group=nginx --with-http_ssl_module"
    run "make && make install"
    run "adduser --system --no-create-home --disabled-login --disabled-password --group nginx"
    run "wget https://library.linode.com/web-servers/nginx/installation/reference/init-deb.sh"
    run "mv init-deb.sh /etc/init.d/nginx"
    run "chmod +x /etc/init.d/nginx"
    run "/usr/sbin/update-rc.d -f nginx defaults"
    run "/etc/init.d/nginx start"
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

  def install_packages(*packages)
    run "yes | apt-get install", *packages
  end
  alias_method :install_package, :install_packages

  protected
  PROMPT_REGEX = /[$%#>] \z/n

  def run(*command)
    command = command.join(' ')
    output = shell.cmd(command) {|data| print data}
    command_regex = /#{Regexp.escape(command)}/
    output.split("\n").reject {|l| l.match(command_regex) || l.match(PROMPT_REGEX)}.join("\n")
  end

  def upload!(from, to)
    sftp_session.upload!(from, to)
  end

  def shell
    @shell ||= Net::SSH::Telnet.new('Session' => ssh_session)
  end

  def ssh_session
    @ssh_session ||= Net::SSH.start(hostname, "root")
  end

  def sftp_session
    @sftp_session ||= Net::SFTP::Session.new(ssh_session).tap do |sftp|
      sftp.loop { sftp.opening? }
    end
  end
end