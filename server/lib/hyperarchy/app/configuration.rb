module Hyperarchy
  class App < Sinatra::Base
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

    configure(:test) do
      Mailer.use_fake
      Mailer.base_url = "hyperarchy.com"
      Origin.connection = Sequel.mysql('hyperarchy_test', :user => 'root', :password => 'password')
      Monarch::Model::convert_strings_to_keys = true
    end

    configure(:development) do
      Mailer.default_options = {
        :via => :smtp,
        :via_options => {
          :address => "hyperarchy.com",
          :host => "localhost",
          :port => 2525,
        }
      }

      Origin.connection = Sequel.mysql('hyperarchy_development', :user => 'root', :password => 'password')

      register Sinatra::Reloader
      dir = File.dirname(__FILE__)

      also_reload "#{dir}/../*.rb"
      also_reload "#{dir}/../models/*.rb"
      also_reload "#{dir}/../views/*.rb"
    end

    Warden::Manager.after_set_user do |user, auth, options|
      Monarch::Model::Record.current_user = user
    end

    before do
      Mailer.base_url = base_url
    end
  end
end