module Hyperarchy
  class App < Sinatra::Base
    use Rack::Session::Cookie
    use Rack::Flash, :accessorize => [:errors]
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
      Origin.connection = Sequel.mysql('hyperarchy_test', :user => 'root', :password => 'password')
      Monarch::Model::convert_strings_to_keys = true
    end

    configure(:development) do
      Origin.connection = Sequel.mysql('hyperarchy_development', :user => 'root', :password => 'password')

      register Sinatra::Reloader
      dir = File.dirname(__FILE__)
      also_reload "#{dir}/../models/*.rb"
      also_reload "#{dir}/../views/*.rb"
    end
  end
end