module Hyperarchy
  class App < Sinatra::Base
    configure(:test) do
      Origin.connection = Sequel.mysql('hyperarchy_test', :user => 'root', :password => 'password')
      Model::convert_strings_to_keys = true
    end

    configure(:development) do
      Origin.connection = Sequel.mysql('hyperarchy_development', :user => 'root', :password => 'password')
    end

    use Http::AssetService, Util::AssetManager.instance
    use Rack::Session::Cookie
    use Warden::Manager do |manager|
      manager.default_strategies :bcrypt
      manager.serialize_into_session do |user|
        user.id
      end
      manager.serialize_from_session do |id|
        User.find(id)
      end
    end

    helpers Util::BuildRelationalDataset, Hyperarchy::Helpers
  end
end