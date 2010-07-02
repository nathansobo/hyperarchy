module Hyperarchy
  class App < Sinatra::Base
    use Monarch::Rack::IdentityMapManager unless RACK_ENV == "test"
    use Rack::Session::Cookie
    use Rack::Flash
    use Warden::Manager do |manager|
      manager.default_strategies :bcrypt
      manager.serialize_into_session do |user|
        user.id
      end
      manager.serialize_from_session do |id|
        User.find(id)
      end
    end

    register Monarch
    helpers Hyperarchy::Helpers

    Origin.connection = Sequel.mysql("hyperarchy_#{RACK_ENV}", :user => 'root', :password => 'password', :encoding => 'utf8')
    
    configure(:test) do
      Mailer.use_fake
      Mailer.base_url = "hyperarchy.com"
      Monarch::Model::convert_strings_to_keys = true
    end

    configure(:development) do
      set :port, 9000
      Mailer.default_options = {
        :via => :smtp,
        :via_options => {
          :address => "localhost",
          :port => 2525,
        }
      }

      register Sinatra::Reloader
      dir = File.dirname(__FILE__)
      also_reload "#{dir}/../*.rb"
      also_reload "#{dir}/../models/*.rb"
      also_reload "#{dir}/../views/*.rb"
    end

    configure(:demo) do
      set :port, 3001
    end

    configure(:production) do
      set :port, 3000

      Mailer.default_options = {
        :via => :smtp,
        :via_options => {
          :address => "smtp.gmail.com",
          :port => 587,
          :user_name => "admin@hyperarchy.com",
          :password => "thepresent",
          :authentication => :plain,
          :domain => "hyperarchy.com"
        }
      }
    end

    Warden::Manager.after_set_user do |user, auth, options|
      Monarch::Model::Record.current_user = user
    end

    before do
      Mailer.base_url = base_url
    end
  end
end