namespace :services do
  desc "Install daemontools services"
  namespace :install do
    desc "Install all services"
    task :default do
      unicorn
    end

    desc "Install Unicorn service"
    task :unicorn do
      require 'erb'
      run 'mkdir -p /var/svc.d/unicorn/log'
      upload 'config/deploy/services/unicorn/run', '/var/svc.d/unicorn/run', :mode => 0755
      template = ERB.new(File.read('config/deploy/services/unicorn/unicorn.sh.erb'))
      put template.result(binding), '/var/svc.d/unicorn/unicorn.sh', :mode => 0755
      upload 'config/deploy/services/unicorn/log/run', '/var/svc.d/unicorn/log/run', :mode => 0755
      run 'ln -s /var/svc.d/unicorn /service/unicorn'
    end
  end
end
