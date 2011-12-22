#  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
#  licensed under the Affero General Public License version 3 or later.  See
#  the COPYRIGHT file.

class AppServer
  attr_reader :stage, :rails_env
  def initialize(stage)
    @stage = stage
  end

  def hostname
    case stage.to_sym
      when :demo
        'demo.hyperarchy.com'
      when :production
        'hyperarchy.com'
      when :vm
        '192.168.0.192'
    end
  end

  def rails_env
    if stage == 'vm'
      'production'
    else
      stage
    end
  end

  def repository
    "git@github.com:nathansobo/hyperarchy.git"
  end

  def deploy(ref, options={})
    nuke_local_assets
    run_locally "env RAILS_ENV=#{rails_env} bundle exec rake assets:precompile"

    as('hyperarchy', '/app') do
      run "git fetch origin"
    end

    stop_service "socket_server"
    maintenance_page_up
    nuke_remote_assets
    upload_assets
    as 'hyperarchy', '/app' do
      run "git checkout --force", ref
      unpack_secrets if options[:unpack_secrets]
      run "source .rvmrc"
      run "bundle install --deployment --without development test deploy"
      run "bundle exec thor db:migrate #{rails_env}"
    end

    restart_service 'unicorn'
    start_service 'socket_server'
    restart_service 'resque_worker'
    restart_service 'resque_scheduler'
    start_service 'resque_web'
    sleep 1 until port_listening?(8080)
    maintenance_page_down

    nuke_local_assets
  end

  def provision
    update_packages
    create_hyperarchy_user
    create_log_directory
    upload_bashrc
    source_bashrc
    install_package 'git-core'
    install_libcurl
    install_daemontools
    install_postgres
    install_nginx
    install_redis
    install_rvm
    install_ruby
    install_node
    clone_repository
    install_services
    puts
  end

  def install_public_key
    system "chmod 0600 #{private_key_path}"
    puts "enter root password for #{hostname}:"
    password = no_echo { $stdin.gets.chomp }
    ssh_session('root', password)
    run 'mkdir -p ~/.ssh'
    public_key = File.read(public_key_path).chomp
    run "echo '#{public_key}' >> ~/.ssh/authorized_keys"
    run "echo '#{public_key}' >> /home/hyperarchy/.ssh/authorized_keys"
    run "chown -R hyperarchy:hyperarchy /home/hyperarchy"
    puts
    system "ssh-add #{private_key_path}"
  end

  def prepare_ssl_cert
    run_locally "curl http://www.startssl.com/certs/sub.class1.server.ca.pem >> keys/hyperarchy.crt"
    run_locally "curl http://www.startssl.com/certs/ca.pem >> keys/hyperarchy.crt"
  end

  def no_echo
    system "stty -echo"
    yield
  ensure
    system "stty echo"
  end

  def private_key_path
    File.expand_path('keys/servers')
  end

  def public_key_path
    File.expand_path('keys/servers.pub')
  end

  def restart_service(service_name)
    run "rm /service/#{service_name}/down" if run?("test -e /service/#{service_name}/down")
    if service_down?(service_name)
      run "svc -u /service/#{service_name}"
    else
      run "svc -cq /service/#{service_name}" # send a cont before quit to workaround signals being ignored on ubuntu
    end
  end

  def stop_service(service_name)
    run "svc -d /service/#{service_name}"
  end

  def start_service(service_name)
    run "rm /service/#{service_name}/down" if run?("test -e /service/#{service_name}/down")
    run "svc -u /service/#{service_name}"
  end

  def as(username, dir=nil)
    run "ssh -AY -o StrictHostKeyChecking=no hyperarchy@localhost"
    run "cd #{dir}" if dir
    yield
    run! "exit"
  end

  def port_listening?(port)
    run?("netstat -ln | grep :#{port}")
  end

  def service_down?(name)
    run("svstat /service/#{name}") =~ /: down/
  end

  def maintenance_page_up
    run "touch /app/offline"
  end

  def maintenance_page_down
    run! "rm /app/offline"
  end

  def update_packages
    run "echo udev hold | dpkg --set-selections" if stage == 'vm' # workaround bug in turnkey linux
    run "yes | apt-get update"
    run "DEBIAN_FRONTEND=noninteractive apt-get upgrade -q -y"
  end

  def create_hyperarchy_user
    run! "groupadd ssl-cert"
    run "chown root:ssl-cert /etc/ssl/private"
    run "mkdir -p /home/hyperarchy"
    unless run?('id hyperarchy')
      run "useradd -G ssl-cert -d /home/hyperarchy -s /bin/bash hyperarchy"
    end
    run "cp -r /root/.ssh /home/hyperarchy/.ssh"
    run "chown -R hyperarchy:hyperarchy /home/hyperarchy/.ssh"
  end

  def create_log_directory
    run "mkdir -p /log"
    run "chown hyperarchy /log"
  end

  def upload_bashrc
    upload 'lib/deploy/resources/.bashrc', '/root/.bashrc'
    run 'cp /root/.bashrc /home/hyperarchy/'
    run 'cp /root/.profile /home/hyperarchy/'
    run 'chown -R hyperarchy:hyperarchy /home/hyperarchy'
  end

  def source_bashrc
    run! 'source /root/.bashrc'
  end

  def install_libcurl
    install_packages 'libcurl3', 'libcurl3-dev'
  end

  def install_daemontools
    install_package 'build-essential'
    make_daemontools_dirs
    download_daemontools
    run "cd /package"
    run "tar -xzvpf /usr/local/djb/dist/daemontools-0.76.tar.gz"
    run "cd admin/daemontools-0.76"
    run "patch -p1 < /usr/local/djb/patches/daemontools-0.76.errno.patch"
    run "patch -p1 < /usr/local/djb/patches/daemontools-0.76.sigq12.patch"
    run "patch -p3 < /usr/local/djb/patches/daemontools-0.76-setuidgid-initgroups.patch"
    run "package/install"
    upload 'lib/deploy/resources/daemontools/svscanboot.conf', '/etc/init/svscanboot.conf'
    run "start svscanboot" unless run("status svscanboot") =~ /start\/running/
  end

  def make_daemontools_dirs
    run "mkdir -p /usr/local/djb/dist"
    run "mkdir -p /usr/local/djb/patches"
    run "mkdir -p /usr/local/package"
    run "chmod 1755 /usr/local/package"
    run! "ln -s /usr/local/package /package"
    run "mkdir -p /service"
    run "mkdir -p /var/svc.d"
  end

  def download_daemontools
    run "cd /usr/local/djb/dist"
    run "wget http://cr.yp.to/daemontools/daemontools-0.76.tar.gz"
    run "cd /usr/local/djb/patches"
    upload 'lib/deploy/resources/daemontools/daemontools-0.76.errno.patch', '/usr/local/djb/patches/daemontools-0.76.errno.patch'
    upload 'lib/deploy/resources/daemontools/daemontools-0.76.sigq12.patch', '/usr/local/djb/patches/daemontools-0.76.sigq12.patch'
    upload 'lib/deploy/resources/daemontools/daemontools-0.76-setuidgid-initgroups.patch', '/usr/local/djb/patches/daemontools-0.76-setuidgid-initgroups.patch'
  end

  def install_postgres
    install_packages 'postgresql', 'libpq-dev'
    run "su - postgres"
    run "pg_dropcluster --stop 8.4 main"
    run "pg_createcluster --start -e UTF-8 8.4 main"
    run "createuser hyperarchy --createdb --no-superuser --no-createrole"
    run "createdb --encoding utf8 --owner hyperarchy hyperarchy_#{rails_env}"
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
    upload_template 'lib/deploy/resources/nginx/nginx.conf.erb', '/opt/nginx/conf/nginx.conf'
    upload 'lib/deploy/resources/nginx/htpasswd', '/opt/nginx/conf/htpasswd'
    upload 'keys/hyperarchy.crt', '/etc/ssl/certs/hyperarchy.crt'
    upload 'keys/hyperarchy.key', '/etc/ssl/private/hyperarchy.key'
    upload 'lib/deploy/resources/nginx/nginx_upstart.conf', '/etc/init/nginx.conf'
    run "chmod 640 /etc/ssl/private/hyperarchy.key"
    run "chown root:ssl-cert /etc/ssl/private/hyperarchy.key"
    run "start nginx"
  end

  def reload_nginx_config
    upload_template 'lib/deploy/resources/nginx/nginx.conf.erb', '/opt/nginx/conf/nginx.conf'
    run "nginx -s reload" if run? "nginx -t"
  end

  def install_redis
    run "apt-get install redis-server"
  end

  def update_nginx_config
    upload 'lib/deploy/resources/nginx/nginx.conf', '/opt/nginx/conf/nginx.conf'
    if run? "nginx -t"
      run "nginx -s reload"
    else
      puts "nginx config is not syntactically valid. not reloading it."
    end
  end

  def install_rvm
    install_package 'curl'
    run "bash < <(curl -s https://rvm.beginrescueend.com/install/rvm)"
    run "source /usr/local/rvm/scripts/rvm"
    run "rvm get latest"
    run "source /usr/local/rvm/scripts/rvm"
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

  def install_node
    install_package 'libssl-dev'
    run "cd /opt"
    run "git clone -b v0.4.8 --depth 0 https://github.com/joyent/node.git"
    run "cd node"
    run "export JOBS=2" # optional, sets number of parallel commands.
    run "./configure --prefix=/opt/node"
    run "make"
    run "make install"
    run "curl http://npmjs.org/install.sh | clean=yes sh"
  end

  def upload_deploy_keys
    upload "keys/deploy", "/root/.ssh/id_rsa"
    upload "keys/deploy.pub", "/root/.ssh/id_rsa.pub"
    run "chmod 600 /root/.ssh/id_rsa*"
    run "cp /root/.ssh/id_rsa* /home/hyperarchy/.ssh"
    run "chown -R hyperarchy /home/hyperarchy/.ssh"
    run "chgrp -R hyperarchy /home/hyperarchy/.ssh"
  end

  def clone_repository
    run "mkdir -p /app"
    run "chown hyperarchy:hyperarchy /app"

    as "hyperarchy" do
      run! "ssh -o StrictHostKeyChecking=no git@github.com"
      run "yes | git clone", repository, "/app"
      run "ln -s /log /app/log"
      run "rvm rvmrc trust /app"
    end
  end

  def upload_assets
    Dir["public/assets/*"].each do |path|
      upload path, "/app/public/assets/#{File.basename(path)}"
    end
  end

  def nuke_remote_assets
    run "mkdir -p /app/public/assets"
    run "rm -rf /app/public/assets/*"
  end

  def nuke_local_assets
    run_locally "rm -rf public/assets"
  end

  def install_services
    install_service 'unicorn'
    if stage == 'vm'
      install_service 'socket_server', :NO_SSL => true
    else
      install_service 'socket_server'
    end
    install_service 'resque_worker', :QUEUE => '*', :VVERBOSE => 1
    install_service 'resque_scheduler'
    install_service 'resque_web', :HOME => '/home/hyperarchy'
  end

  def reinstall_services
    maintenance_page_up
    install_services
    run "svc -u /service/*"
    run "rm /service/*/down"
    sleep 1 until port_listening?(8080)
    maintenance_page_down
  end

  def install_service(service_name, env_vars={})
    env_vars = {:RAILS_ENV => rails_env}.merge(env_vars)
    run "rm /service/#{service_name}" if run?("test -e /service/#{service_name}")
    if run?("test -e /var/svc.d/#{service_name}")
      run "svc -dx /var/svc.d/#{service_name} /var/svc.d/#{service_name}/log"
      run "rm -rf /var/svc.d/#{service_name}"
    end
    run "mkdir -p /log/#{service_name}"
    upload "lib/deploy/resources/services/#{service_name}", "/var/svc.d/#{service_name}"
    run "chmod 755 /var/svc.d/#{service_name}/run"
    run "chmod 755 /var/svc.d/#{service_name}/#{service_name}.sh"
    run "chmod 755 /var/svc.d/#{service_name}/log/run"
    run "mkdir -p /var/svc.d/#{service_name}/env"
    env_vars.each do |var_name, value|
      run! "echo #{value.inspect} > /var/svc.d/#{service_name}/env/#{var_name}"
    end
    run "touch /var/svc.d/#{service_name}/down"
    run "ln -s /var/svc.d/#{service_name} /service/#{service_name}"
  end

  def dump_database
    db_name = "hyperarchy_#{rails_env}"
    dump_file_path = "/tmp/#{db_name}_#{Time.now.to_i}.tar"
    as 'hyperarchy' do
      run "pg_dump #{db_name} --file=#{dump_file_path} --format=tar"
      run "gzip #{dump_file_path}"
    end
    "#{dump_file_path}.gz"
  end

  def download_database(source_server)
    dump_file_path = source_server.dump_database
    run "scp -o StrictHostKeyChecking=no #{source_server.hostname}:#{dump_file_path} #{dump_file_path}"
    run "gunzip #{dump_file_path}"
    dump_file_path = dump_file_path.gsub(/\.gz$/, '')

    stop_service 'unicorn'
    sleep 1 while port_listening?(8080) 

    as 'hyperarchy' do
      run! "pg_restore #{dump_file_path} --dbname=hyperarchy_#{rails_env} --clean"
    end

    start_service 'unicorn'
    sleep 1 until port_listening?(8080)
  end

  def unpack_secrets
    puts "Enter password to unpack secrets:"
    password = no_echo { $stdin.gets.chomp } 
    puts "running 'bundle exec thor secrets:unpack <password>'"
    run_silently "bundle exec thor secrets:unpack #{password}"
  end

  protected

  def install_packages(*packages)
    run "yes | apt-get install", *packages
  end
  alias_method :install_package, :install_packages


  def run_locally(cmd)
    puts(cmd)
    raise "Local command failed: #{cmd}" unless system(cmd)
  end

  PROMPT_REGEX = /[$%#>] (\z|\e)/n
  def run(*command_fragments)
    command = command_fragments.join(' ')
    result = run_command(command)
    raise "Command failed: #{command}" unless run_command('echo $?', true) == '0'
    result
  end

  def run!(*command_fragments)
    run_command(command_fragments.join(' '))
  end

  def run?(*command_fragments)
    run_command(command_fragments.join(' '))
    run_command("echo $?") == '0'
  end

  def run_silently(*command_fragments)
    command = command_fragments.join(' ')
    result = run_command(command, true)
    raise "Command failed: <silenced>" unless run_command('echo $?', true) == '0'
    result
  end

  def run_command(command, silent=false)
    output = shell.cmd(command) {|data| print data.gsub(/(\r|\r\n|\n\r)+/, "\n") unless silent }
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

  def upload(from, to)
    sftp_session.upload!(from, to, :progress => UploadProgressHandler.new)
  end

  def upload_template(template_path, to)
    require 'erb'
    file_content = ERB.new(File.read(template_path)).result(binding)
    file_handle = sftp_session.open!(to, 'w')
    sftp_session.write!(file_handle, 0, file_content)
  end

  def shell
    @shell ||= Net::SSH::Telnet.new('Session' => ssh_session, 'Prompt' => PROMPT_REGEX)
  end

  def ssh_session(user="root", password=nil)
    @ssh_session ||= Net::SSH.start(hostname, user, :password => password, :forward_agent => true)
  end

  def sftp_session
    @sftp_session ||= Net::SFTP::Session.new(ssh_session).tap do |sftp|
      sftp.loop { sftp.opening? }
    end
  end
end