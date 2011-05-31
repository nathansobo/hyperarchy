source 'http://rubygems.org'

gem 'rails', '3.0.7'
gem 'rake', '0.8.7'
gem 'unicorn', '3.5.0'
gem 'thin', '1.2.11' # for resque-web on prod
gem 'pg', '0.9.0'
gem 'sequel', '3.16.0'
gem 'sequel-rails', '0.1.8'
gem 'bcrypt-ruby', :require => 'bcrypt'
gem 'rgl', :require => ['rgl/base', 'rgl/adjacency', 'rgl/topsort']
gem 'erector', :path => 'vendor/erector'
gem 'pony', '1.1'
gem 'haml', '3.0.25'
gem 'resque', '1.15.0'
gem 'resque-status', '0.2.3', :require => ['resque/status', 'resque/job_with_status']
gem 'resque-scheduler', '1.9.9', :require => ['resque_scheduler']
gem 'uuidtools', '2.1.2'
gem 'typhoeus', '0.2.4'
gem 'redis', '2.2.0'
gem 'redis-lock', '0.1.0'

group :development, :test do
  gem 'thor'
  gem 'haml', '3.0.25'
  gem 'rspec', '~> 2.5.0'
  gem 'rspec-rails', '~> 2.5.0'
  gem 'rr', '1.0.2'
  gem 'machinist', '1.0.6'
  gem 'faker', '0.9.5'
  gem 'spork', '~> 0.9.0.rc7'
  gem 'fuubar', '0.0.5'
  gem 'foreman', '0.16.0'
  gem 'mailtrap', '0.2.1'
  gem 'parallel_tests', :git => 'git@github.com:nathansobo/parallel_tests.git', :ref => '1aacd508c932d360c015'
end

group :deploy do
  gem 'net-ssh', '2.1.0'
  gem 'net-ssh-telnet', :require => 'net/ssh/telnet'
  gem 'net-sftp', :require => 'net/sftp'
  gem 'uuidtools', '2.1.2'
end
