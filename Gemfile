source :gemcutter

# monarch
gem "rack", "1.1.0"
gem "sinatra", "1.0"
gem "pg", "0.9.0"
gem "sequel", "3.16.0"
gem "activesupport", "3.0.1"
gem "json", "1.2.0"
gem "guid", "0.1.1"
gem "cramp", "0.11"

## hyperarchy
gem "thin", "1.2.7"
gem "eventmachine", "0.12.11", :git => "git://github.com/eventmachine/eventmachine", :ref => "6c79977980345f2e3b55"
gem "warden", "0.10.7"
gem "erector", "0.6.7"
gem "rack-flash", "0.1.1"
gem "bcrypt-ruby", "2.1.1", :require => "bcrypt"
gem "pony", "1.0"
gem "rgl", "0.4.0", :require => ['rgl/base', 'rgl/adjacency', 'rgl/topsort']
gem "newrelic_rpm", "2.13.2"
gem "rufus-scheduler", "2.0.8", :require => "rufus/scheduler"

group :development do
  gem "sinatra-reloader", "0.5.0", :require => "sinatra/reloader"
  gem "haml", "3.0.18", :require => "sass/plugin/rack"
  gem "ruby-prof", "0.9.2"
end

group :test do
  gem "rspec", "1.3.0", :require => "spec"
  gem "rr", "1.0.0"
  gem "rack-test", "0.5.3", :require => "rack/test"
  gem "machinist", "1.0.6", :require => ["machinist", "machinist/blueprints", "sham"]
  gem "faker", "0.3.1"
  gem "timecop", "0.3.4"
  gem "ruby-debug-base19", "0.11.23"
  gem "ruby-debug19", "0.11.6", :require => "ruby-debug"

  # for monarch specs, since rubymine forces me to run them with this gemfile
  # hoses deployment when it goes to production
  gem "sqlite3-ruby", "1.2.4", :require => "sqlite3"
  gem "differ", "0.1.1"
end

group :thor do
  gem "thin", "1.2.7"
  gem "bcrypt-ruby", "2.1.1", :require => "bcrypt"
  gem "net-ssh", "2.0.23"
  gem "git", "1.2.5"
  gem "daemons", "1.0.10"
  gem "sequel", "3.16.0"
  gem "pg", "0.9.0"
  gem "mysql", "2.8.1"
end
